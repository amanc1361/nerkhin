package handler

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type AuthHandler struct {
	tokenService            port.TokenService
	authService             port.AuthService
	verificationCodeService port.VerificationCodeService
	config                  config.App
	userSubRepo             port.UserSubscriptionService
}

func RegisterAuthHandler(
	authService port.AuthService,
	tokenService port.TokenService,
	verificationCodeService port.VerificationCodeService,
	userSubRepo port.UserSubscriptionService,
	appConfig config.App) *AuthHandler {
	return &AuthHandler{
		tokenService:            tokenService,
		authService:             authService,
		verificationCodeService: verificationCodeService,
		config:                  appConfig,
		userSubRepo:             userSubRepo,
	}
}

type loginRequest struct {
	Phone string `json:"phone" binding:"required"`
}

type loginResponse struct {
	Success bool   `json:"success"`
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

type vcRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Code     string `json:"code" binding:"required"`
	DeviceID string `json:"deviceId" binding:"required"` // <--- CHANGED
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type tokenResponse struct {
	AccessToken           string        `json:"accessToken"`
	RefreshToken          string        `json:"refreshToken,omitempty"`
	AccessTokenExpiresAt  int64         `json:"accessTokenExpiresAt"`
	User                  *UserResponse `json:"user"`
	SubscriptionStatus    string        `json:"subscriptionStatus,omitempty"`
	SubscriptionExpiresAt *string       `json:"subscriptionExpiresAt,omitempty"`
}

type UserResponse struct {
	ID                    int64   `json:"id"`
	FullName              string  `json:"fullName,omitempty"`
	Phone                 string  `json:"phone,omitempty"`
	Role                  int16   `json:"role,omitempty"`
	CityID                int64   `json:"cityId,omitempty"`
	SubscriptionStatus    string  `json:"subscriptionStatus,omitempty"`
	SubscriptionExpiresAt *string `json:"subscriptionExpiresAt,omitempty"`
}

func (ah *AuthHandler) VerifyCode(ctx *gin.Context) {
	var req vcRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, ah.config.Lang)
		return
	}

	// ADDED: Get device info from request context
	userAgent := ctx.GetHeader("User-Agent")
	ipAddress := ctx.ClientIP()

	// CHANGED: Pass device info to the service
	user, adminAccess, err := ah.verificationCodeService.VerifyCode(ctx, req.Phone, req.Code, req.DeviceID, userAgent, ipAddress)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}
	if user == nil {
		HandleError(ctx, errors.New(msg.ErrUserDoesNotExist), ah.config.Lang)
		return
	}

	accessTokenString, _, accessTokenExpiration, err := ah.tokenService.CreateAccessToken(user, adminAccess)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}

	refreshTokenString, _, _, err := ah.tokenService.CreateRefreshToken(user)
	if err != nil {
		HandleError(ctx, err, ah.config.Lang)
		return
	}
	subStatus, subExp, _ := ah.fetchSubscriptionInfo(ctx, user.ID)

	var subExpStr *string
	if subExp != nil {
		s := subExp.UTC().Format(time.RFC3339)
		subExpStr = &s
	}

	clientUserResponse := &UserResponse{
		ID:                    user.ID,
		FullName:              user.FullName,
		Phone:                 user.Phone,
		Role:                  int16(user.Role),
		CityID:                user.CityID,
		SubscriptionStatus:    subStatus,
		SubscriptionExpiresAt: subExpStr,
	}

	responsePayload := &tokenResponse{
		AccessToken:           accessTokenString,
		RefreshToken:          refreshTokenString,
		AccessTokenExpiresAt:  accessTokenExpiration.Unix(),
		User:                  clientUserResponse,
		SubscriptionStatus:    subStatus,
		SubscriptionExpiresAt: subExpStr,
	}
	handleSuccess(ctx, responsePayload)
}

// ... rest of the auth.go file remains the same
func (ah *AuthHandler) RefreshAccessToken(ctx *gin.Context) {
    var req refreshRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        validationError(ctx, err, ah.config.Lang)
        return
    }

    refreshTokenPayload, err := ah.tokenService.VerifyRefreshToken(req.RefreshToken)
    if err != nil {
        ctx.SetCookie(ah.config.Cookie.Name, "", -1, ah.config.Cookie.Path, ah.config.Cookie.Domain, ah.config.Cookie.Secure, ah.config.Cookie.HTTPOnly)
        HandleError(ctx, err, ah.config.Lang)
        return
    }

    user, err := ah.authService.GetUserByID(ctx, refreshTokenPayload.UserID)
    if err != nil {
        HandleError(ctx, err, ah.config.Lang)
        return
    }
    if user == nil {
        HandleError(ctx, errors.New(msg.ErrUserDoesNotExist), ah.config.Lang)
        return
    }

    if user.Role != refreshTokenPayload.UserRole {
        HandleError(ctx, errors.New("user role mismatch during token refresh"), ah.config.Lang)
        return
    }

    newAccessTokenString, _, Expiration, err := ah.tokenService.CreateAccessToken(user, nil)
    if err != nil {
        HandleError(ctx, err, ah.config.Lang)
        return
    }
    subStatus, subExp, _ := ah.fetchSubscriptionInfo(ctx, user.ID)

    var subExpStr *string
    if subExp != nil {
        s := subExp.UTC().Format(time.RFC3339)
        subExpStr = &s
    }

    clientUserResponse := &UserResponse{
        ID:                    user.ID,
        FullName:              user.FullName,
        Phone:                 user.Phone,
        Role:                  int16(user.Role),
        CityID:                user.CityID,
        SubscriptionStatus:    subStatus,
        SubscriptionExpiresAt: subExpStr,
    }

    responsePayload := &tokenResponse{
        AccessToken:           newAccessTokenString,
        RefreshToken:          req.RefreshToken,
        AccessTokenExpiresAt:  Expiration.Unix(),
        User:                  clientUserResponse,
        SubscriptionStatus:    subStatus,
        SubscriptionExpiresAt: subExpStr,
    }
    handleSuccess(ctx, responsePayload)
}

func (ah *AuthHandler) fetchSubscriptionInfo(
    ctx *gin.Context,
    userID int64,
) (status string, expiresAt *time.Time, err error) {
    list, err := ah.userSubRepo.FetchUserSubscriptionList(ctx, userID)
    if err != nil {
        return "none", nil, err
    }
    if len(list) == 0 {
        return "none", nil, nil
    }
    now := time.Now()
    for _, it := range list {
        if it == nil {
            continue
        }
        if it.ExpiresAt.After(now) {
            return "active", &it.ExpiresAt, nil
        }
        return "expired", &it.ExpiresAt, nil
    }
    return "none", nil, nil
}