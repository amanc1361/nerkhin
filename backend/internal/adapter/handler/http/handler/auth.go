package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"

	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

// AuthHandler struct
type AuthHandler struct {
	tokenService            port.TokenService
	authService             port.AuthService
	verificationCodeService port.VerificationCodeService
	config                  config.App
}

// RegisterAuthHandler
func RegisterAuthHandler(
	authService port.AuthService,
	tokenService port.TokenService,
	verificationCodeService port.VerificationCodeService,

	appConfig config.App) *AuthHandler {
	return &AuthHandler{
		tokenService:            tokenService,
		authService:             authService,
		verificationCodeService: verificationCodeService,
		config:                  appConfig,
	}
}

// --- Login Handler ---
type loginRequest struct {
	Phone string `json:"phone" binding:"required"`
}
type loginResponse struct {
	Success bool   `json:"success"` // <--- این فیلد اضافه شد
	Message string `json:"message"`
}

func (ah *AuthHandler) Login(ctx *gin.Context) {
	var req loginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, ah.config.Lang)
		return
	}
	_, err := ah.authService.Login(ctx, req.Phone)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}
	rsp := &loginResponse{
		Success: true,
		Message: "Verification code sent successfully"}
	handleSuccess(ctx, rsp)
}

// --- Structs for VerifyCode & RefreshAccessToken ---
type vcRequest struct {
	Phone string `json:"phone" binding:"required"`
	Code  string `json:"code" binding:"required"`
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type tokenResponse struct {
	AccessToken          string        `json:"accessToken"`
	RefreshToken         string        `json:"refreshToken,omitempty"`
	AccessTokenExpiresAt int64         `json:"accessTokenExpiresAt"` // Unix Timestamp
	User                 *UserResponse `json:"user"`
}

type UserResponse struct {
	ID       int64  `json:"id"`
	FullName string `json:"fullName,omitempty"`
	Phone    string `json:"phone,omitempty"`
	Role     int16  `json:"role,omitempty"`
	CityID   int64  `json:"cityId,omitempty"`
}

// --- VerifyCode Handler (Corrected) ---
func (ah *AuthHandler) VerifyCode(ctx *gin.Context) {
	var req vcRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, ah.config.Lang)
		return
	}

	user, adminAccess, err := ah.verificationCodeService.VerifyCode(ctx, req.Phone, req.Code)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}
	if user == nil {
		HandleError(ctx, errors.New(msg.ErrUserDoesNotExist), ah.config.Lang)
		return
	}

	// فراخوانی متد جدید که 4 مقدار برمی‌گرداند
	accessTokenString, _, accessTokenExpiration, err := ah.tokenService.CreateAccessToken(user, adminAccess)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}

	// فراخوانی متد جدید که 4 مقدار برمی‌گرداند
	refreshTokenString, _, _, err := ah.tokenService.CreateRefreshToken(user)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}

	clientUserResponse := &UserResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Phone:    user.Phone,
		Role:     int16(user.Role),
		CityID:   user.CityID,
	}

	responsePayload := &tokenResponse{
		AccessToken:          accessTokenString,
		RefreshToken:         refreshTokenString,
		AccessTokenExpiresAt: accessTokenExpiration.Unix(), // <--- استفاده صحیح از زمان انقضای بازگشتی
		User:                 clientUserResponse,
	}
	handleSuccess(ctx, responsePayload)
}

// --- RefreshAccessToken Handler (Corrected) ---
func (ah *AuthHandler) RefreshAccessToken(ctx *gin.Context) {
	var req refreshRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, ah.config.Lang)
		return
	}

	refreshTokenPayload, err := ah.tokenService.VerifyRefreshToken(req.RefreshToken)
	if err != nil {
		// پاک کردن کوکی نامعتبر و برگرداندن خطای Unauthorized
		ctx.SetCookie(ah.config.Cookie.Name, "", -1, ah.config.Cookie.Path, ah.config.Cookie.Domain, ah.config.Cookie.Secure, ah.config.Cookie.HTTPOnly)
		HandleError(ctx, err, ah.config.Lang)
		return
	}

	// حالا از authService برای دریافت کاربر استفاده می‌کنیم
	user, err := ah.authService.GetUserByID(ctx, refreshTokenPayload.UserID)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}
	if user == nil {
		HandleError(ctx, errors.New(msg.ErrUserDoesNotExist), ah.config.Lang)
		return
	}

	// بررسی تطابق نقش (این بخش بدون تغییر است)
	if user.Role != refreshTokenPayload.UserRole {
		HandleError(ctx, errors.New("user role mismatch during token refresh"), ah.config.Lang)
		return
	}

	// ایجاد Access Token جدید
	newAccessTokenString, _, Expiration, err := ah.tokenService.CreateAccessToken(user, nil)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}

	clientUserResponse := &UserResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Phone:    user.Phone,
		Role:     int16(user.Role),
		CityID:   user.CityID,
	}

	responsePayload := &tokenResponse{
		AccessToken:          newAccessTokenString,
		RefreshToken:         req.RefreshToken, // همان رفرش توکن قبلی
		AccessTokenExpiresAt: Expiration.Unix(),
		User:                 clientUserResponse,
	}
	handleSuccess(ctx, responsePayload)
}
