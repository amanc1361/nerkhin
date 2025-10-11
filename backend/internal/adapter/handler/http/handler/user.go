package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"

	"strconv"
	"time"

	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"

	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
)

const USER_IMAGES_LIMIT = 1

type UserHandler struct {
	service      port.UserService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterUserHandler(service port.UserService, tokenService port.TokenService,
	appConfig config.App) *UserHandler {
	return &UserHandler{
		service,
		tokenService,
		appConfig,
	}
}

type registerUserRequest struct {
	Phone    string `json:"phone"`
	CityId   int64  `json:"cityId"`
	Role     int16  `json:"role"`
	FullName string `json:"fullName"`
}

type registerUserResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	UserId  int64  `json:"userId"`
}

func (uh *UserHandler) Register(ctx *gin.Context) {
	var req registerUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, uh.AppConfig.Lang)
		return
	}

	user := domain.User{
		Phone:    req.Phone,
		CityID:   req.CityId,
		Role:     domain.UserRole(req.Role),
		FullName: req.FullName,
		State:    domain.NewUser,
	}

	id, err := uh.service.RegisterUser(ctx, &user)
	if err != nil {
		HandleError(ctx, err, uh.AppConfig.Lang)
		return
	}

	rsp := &registerUserResponse{
		Success: true,
		Message: "کاربر با موففیت ثبت شد",
		UserId:  id,
	}

	handleSuccess(ctx, rsp)
}

type updateUserRequest struct {
	Id       int64  `json:"id"`
	Phone    string `json:"phone"`
	CityId   int64  `json:"cityId"`
	Role     int16  `json:"role"`
	FullName string `json:"fullName"`
}

type updateUserResponse struct {
	UserId int64 `json:"userId"`
}

func (uh *UserHandler) Update(ctx *gin.Context) {
	var req updateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, uh.AppConfig.Lang)
		return
	}

	user := domain.User{
		ID:       req.Id,
		Phone:    req.Phone,
		CityID:   req.CityId,
		Role:     domain.UserRole(req.Role),
		FullName: req.FullName,
	}

	id, err := uh.service.UpdateUser(ctx, &user)
	if err != nil {
		HandleError(ctx, err, uh.AppConfig.Lang)
		return
	}

	rsp := &updateUserResponse{

		UserId: id,
	}

	handleSuccess(ctx, rsp)
}

type fetchUserRequest struct {
	Id int64 `uri:"id" example:"1"`
}

type fetchUserResponse struct {
	Id       int64  `json:"id"`
	Phone    string `json:"phone"`
	CityId   int64  `json:"cityId"`
	Role     int16  `json:"role"`
	State    int16  `json:"state"`
	FullName string `json:"fullName"`
}

func (uh *UserHandler) FetchUser(ctx *gin.Context) {
	var req fetchUserRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		validationError(ctx, err, uh.AppConfig.Lang)
		return
	}

	fetchedUser, err := uh.service.GetUserByID(ctx, req.Id)
	if err != nil {
		HandleError(ctx, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(ctx, fetchedUser)
}

func (uh *UserHandler) Delete(ctx *gin.Context) {
	userId, err := strconv.Atoi(ctx.Param("userId"))
	if err != nil {
		validationError(ctx, err, uh.AppConfig.Lang)
		return
	}

	err = uh.service.DeleteUser(ctx, int64(userId))
	if err != nil {
		HandleError(ctx, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(ctx, nil)
}

type fetchUsersByFilterRequest struct {
	Role       int16  `json:"role"`
	State      int16  `json:"state"`
	SearchText string `json:"searchText"`
	CityID     int64  `json:"cityId"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
}
type fetchUsersByFilterResponse struct {
	Users      []*domain.UserViewModel `json:"users"`
	TotalCount int64                   `json:"totalCount"`
}

type changeUserStateRequest struct {
	UserID      int64            `json:"userId"`
	TargetState domain.UserState `json:"targetState"`
}

func (uh *UserHandler) FetchUsersByFilter(c *gin.Context) {
	var req fetchUsersByFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	// مقادیر پیش‌فرض برای صفحه‌بندی اگر در درخواست نیامده باشند
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 10 // تعداد پیش‌فرض آیتم در هر صفحه
	}

	ctx := c.Request.Context()

	// فراخوانی سرویس با پارامترهای جدید صفحه‌بندی
	users, totalCount, err := uh.service.GetUsersByFilter(ctx, domain.UserFilter{
		Role:       domain.UserRole(req.Role),
		State:      domain.UserState(req.State),
		SearchText: req.SearchText,
		CityID:     req.CityID,
	}, req.Page, req.Limit)

	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	// ساخت پاسخ نهایی با ساختار صحیح
	responsePayload := &fetchUsersByFilterResponse{
		Users:      users,
		TotalCount: totalCount,
	}

	handleSuccess(c, responsePayload)
}

func (uh *UserHandler) ChangeState(c *gin.Context) {
	var req changeUserStateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := uh.service.ChangeUserState(ctx, req.UserID, req.TargetState)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type updateShopRequest struct {
	ShopName     string `json:"shopName"`
	ShopPhone1   string `json:"shopPhone1"`
	ShopPhone2   string `json:"shopPhone2"`
	ShopPhone3   string `json:"shopPhone3"`
	ShopAddress  string `json:"shopAddress"`
	TelegramUrl  string `json:"telegramUrl"`
	InstagramUrl string `json:"instagramUrl"`
	WhatsappUrl  string `json:"whatsappUrl"`
	WebsiteUrl   string `json:"websiteUrl"`
	Latitude     string `json:"latitude"`
	Longitude    string `json:"longitude"`
}

func (uh *UserHandler) UpdateShop(c *gin.Context) {
	// --- A) اطمینان از پارسِ multipart قبل از PostForm
	ct := strings.ToLower(c.GetHeader("Content-Type"))
	if strings.HasPrefix(ct, "multipart/form-data") {
		if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
			HandleError(c, err, uh.AppConfig.Lang)
			return
		}
	}

	// --- B) data را بخوان و JSON کن
	var req updateShopRequest
	jsonData := c.PostForm("data")
	if jsonData == "" {
		validationError(c, errors.New("invalid payload: missing 'data'"), uh.AppConfig.Lang)
		return
	}
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	// --- C) تبدیل مختصات
	latitude := decimal.NullDecimal{}
	if req.Latitude != "" {
		lat, err := decimal.NewFromString(req.Latitude)
		if err != nil {
			validationError(c, err, uh.AppConfig.Lang)
			return
		}
		latitude.Decimal = lat
		latitude.Valid = !lat.IsZero()
	}
	longitude := decimal.NullDecimal{}
	if req.Longitude != "" {
		long, err := decimal.NewFromString(req.Longitude)
		if err != nil {
			validationError(c, err, uh.AppConfig.Lang)
			return
		}
		longitude.Decimal = long
		longitude.Valid = !long.IsZero()
	}

	// --- D) ساخت مدل
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID
	shop := &domain.User{
		ID:           currentUserID,
		ShopName:     req.ShopName,
		ShopPhone1:   req.ShopPhone1,
		ShopPhone2:   req.ShopPhone2,
		ShopPhone3:   req.ShopPhone3,
		ShopAddress:  req.ShopAddress,
		TelegramUrl:  req.TelegramUrl,
		InstagramUrl: req.InstagramUrl,
		WhatsappUrl:  req.WhatsappUrl,
		WebsiteUrl:   req.WebsiteUrl,
		Latitude:     latitude,
		Longitude:    longitude,
	}

	// --- E) دریافت فایل‌ها (کلید: "images") + بازگرداندن خطا (ساکت نباش)
	imageFileNames, err := saveAndGetImageFileNames(c, "images", uh.AppConfig.ImageBasePath, USER_IMAGES_LIMIT)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}
	if len(imageFileNames) > 0 {
		shop.ImageUrl = imageFileNames[0]
	}

	// --- F) به‌روزرسانی و پاسخ
	ctx := c.Request.Context()
	if err := uh.service.UpdateShop(ctx, shop); err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}
	handleSuccess(c, nil)
}

type addNewUserRequest struct {
	Phone    string `json:"phone"`
	CityId   int64  `json:"cityId"`
	Role     int16  `json:"role"`
	FullName string `json:"fullName"`
}

type addNewUserResponse struct {
	ID int64 `json:"id"`
}

func (uh *UserHandler) AddNewUser(c *gin.Context) {
	var req addNewUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	user := domain.User{
		Phone:    req.Phone,
		CityID:   req.CityId,
		Role:     domain.UserRole(req.Role),
		FullName: req.FullName,
	}

	ctx := c.Request.Context()
	id, err := uh.service.AddNewUser(ctx, &user)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	resp := &addNewUserResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type addNewAdminRequest struct {
	Phone    string `json:"phone"`
	CityId   int64  `json:"cityId"`
	FullName string `json:"fullName"`
}

type addNewAdminResponse struct {
	ID int64 `json:"id"`
}

func (uh *UserHandler) AddNewAdmin(c *gin.Context) {
	var req addNewAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	user := domain.User{
		Phone:    req.Phone,
		CityID:   req.CityId,
		FullName: req.FullName,
	}

	ctx := c.Request.Context()
	id, err := uh.service.AddNewAdmin(ctx, &user)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	resp := &addNewAdminResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type deleteAdminRequest struct {
	AdminID int64 `uri:"adminId"`
}

func (uh *UserHandler) DeleteAdmin(c *gin.Context) {
	var req deleteAdminRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := uh.service.DeleteAdmin(ctx, req.AdminID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type subscriptionStatusVM struct {
	CityID         int64     `json:"cityId"`
	City           string    `json:"city"` // نام شهر (اختیاری، اگر جوین می‌زنی)
	SubscriptionID int64     `json:"subscriptionId"`
	ExpiresAt      time.Time `json:"expiresAt"`
	IsActive       bool      `json:"isActive"`
	DaysRemaining  int       `json:"daysRemaining"` // اگر منقضی شده = 0
	DaysOverdue    int       `json:"daysOverdue"`   // اگر فعال است = 0
}

type fetchUserInfoResponse struct {
	User                  domain.User            `json:"user"`
	AdminAccessInfo       *domain.AdminAccess    `json:"adminAccessInfo"`
	Subscriptions         []subscriptionStatusVM `json:"subscriptions"`
	HasActiveSubscription bool                   `json:"hasActiveSubscription"`
	ActiveCities          []int64                `json:"activeCities"`
}

func (uh *UserHandler) FetchUserInfo(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	userID := authPayload.UserID

	ctx := c.Request.Context()

	// قبلی‌ها همون‌طور که هست:
	fetchedUser, adminAccessInfo, err := uh.service.FetchUserInfo(ctx, userID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	// جدید: گرفتن سابسکرایب‌ها (برای همه شهرها)
	subs, err := uh.service.GetUserSubscriptionsWithCity(ctx, userID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	now := time.Now()
	outSubs := make([]subscriptionStatusVM, 0, len(subs))
	activeCities := make([]int64, 0, len(subs))
	hasActive := false

	for _, s := range subs {
		// s.ExpiresAt از نوع time.Time است
		diff := s.ExpiresAt.Sub(now).Hours() / 24.0
		isActive := diff >= 0

		var daysRemaining int
		var daysOverdue int
		if isActive {
			// سقف به بالا تا اگر چند ساعت مانده بود، 1 روز حساب شود
			daysRemaining = int(math.Ceil(diff))
			if daysRemaining < 0 {
				daysRemaining = 0
			}
		} else {
			// منقضی‌شده: چند روز گذشته؟
			daysOverdue = int(math.Ceil(-diff))
			if daysOverdue < 0 {
				daysOverdue = 0
			}
		}

		vm := subscriptionStatusVM{
			CityID:         s.CityID,
			City:           s.City, // اگر در کوئری جوین کردی
			SubscriptionID: s.SubscriptionID,
			ExpiresAt:      s.ExpiresAt,
			IsActive:       isActive,
			DaysRemaining:  daysRemaining,
			DaysOverdue:    daysOverdue,
		}
		outSubs = append(outSubs, vm)
		if isActive {
			hasActive = true
			activeCities = append(activeCities, s.CityID)
		}
	}

	response := &fetchUserInfoResponse{
		User:                  *fetchedUser,
		AdminAccessInfo:       adminAccessInfo,
		Subscriptions:         outSubs,
		HasActiveSubscription: hasActive,
		ActiveCities:          activeCities,
	}

	handleSuccess(c, response)
}

type updateDollarPriceRequest struct {
	DollarPrice  string `json:"dollarPrice"  binding:"required"`
	DollarUpdate *bool  `json:"dollarUpdate,omitempty"` // اختیاری
	Rounded      *bool  `json:"rounded,omitempty"`      // اختیاری
}

func (uh *UserHandler) GetDollarPrice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	dollarPrice, err := uh.service.GetDollarPrice(ctx, int64(id))
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, dollarPrice)
}
func (uh *UserHandler) UpdateDollarPrice(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	var req updateDollarPriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	dollarPriceDecimal, err := decimal.NewFromString(req.DollarPrice)
	if err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	// فقط پاس دادن همون‌ها؛ Service خودش تشخیص می‌ده اگر nil بود، دست نزنه
	err = uh.service.UpdateDollarPrice(
		c,
		currentUserId,
		decimal.NullDecimal{Decimal: dollarPriceDecimal, Valid: !dollarPriceDecimal.IsZero()},
		req.DollarUpdate,
		req.Rounded,
	)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type getAdminRequest struct {
	AdminID int64 `uri:"adminId"`
}

func (uh *UserHandler) GetAdminAccess(c *gin.Context) {
	var req getAdminRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	adminAccess, err := uh.service.GetAdminAccess(ctx, req.AdminID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, adminAccess)
}

type updateAdminUriRequest struct {
	AdminID int64 `uri:"adminId"`
}

type updateAdminRequest struct {
	SaveProduct        bool `json:"saveProduct"`
	ChangeUserState    bool `json:"changeUserState"`
	ChangeShopState    bool `json:"changeShopState"`
	ChangeAccountState bool `json:"changeAccountState"`
}

// این struct و تابع جدید را به فایل handler/user.go اضافه کنید

// ... بالای فایل در کنار بقیه struct ها
type updateDeviceLimitRequest struct {
	UserID int64 `json:"userId" binding:"required,min=1"`
	Limit  int   `json:"limit" binding:"required,min=1"`
}

// ... در انتهای فایل به عنوان یک متد جدید برای UserHandler
func (uh *UserHandler) UpdateUserDeviceLimit(c *gin.Context) {
	var req updateDeviceLimitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := uh.service.UpdateUserDeviceLimit(ctx, req.UserID, req.Limit)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, gin.H{"message": "User device limit updated successfully"})
}
func (uh *UserHandler) UpdateAdminAccess(c *gin.Context) {
	var uriReq updateAdminUriRequest
	if err := c.ShouldBindUri(&uriReq); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	var reqPayload updateAdminRequest
	if err := c.ShouldBindJSON(&reqPayload); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := uh.service.UpdateAdminAccess(ctx, &domain.AdminAccess{
		UserID:             uriReq.AdminID,
		SaveProduct:        reqPayload.SaveProduct,
		ChangeUserState:    reqPayload.ChangeUserState,
		ChangeShopState:    reqPayload.ChangeShopState,
		ChangeAccountState: reqPayload.ChangeAccountState,
	})
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

// ... به انتهای فایل اضافه شود
func (uh *UserHandler) ListUserDevices(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		validationError(c, errors.New("invalid user ID"), uh.AppConfig.Lang)
		return
	}

	devices, err := uh.service.GetUserActiveDevices(c.Request.Context(), userID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}
	handleSuccess(c, devices)
}

func (uh *UserHandler) DeleteUserDevice(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		validationError(c, errors.New("invalid user ID"), uh.AppConfig.Lang)
		return
	}
	deviceID := c.Param("deviceId")

	err = uh.service.DeleteUserDevice(c.Request.Context(), userID, deviceID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}
	handleSuccess(c, gin.H{"message": "Device deleted successfully"})
}

// DeleteAllUserDevices handles the HTTP request to delete all devices for a user.
func (uh *UserHandler) DeleteAllUserDevices(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		validationError(c, errors.New("invalid user ID"), uh.AppConfig.Lang)
		return
	}

	err = uh.service.DeleteAllUserDevices(c.Request.Context(), userID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, gin.H{"message": "All devices for the user deleted successfully"})
}

// struct برای درخواست
type updateAllUsersDeviceLimitRequest struct {
	Limit int `json:"limit" binding:"required,min=1"`
}

// تابع هندلر
func (uh *UserHandler) UpdateAllUsersDeviceLimit(c *gin.Context) {
	var req updateAllUsersDeviceLimitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

	err := uh.service.UpdateAllUsersDeviceLimit(c.Request.Context(), req.Limit)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, gin.H{"message": "All users device limit updated successfully"})
}

func (uh *UserHandler) FetchAdminUserList(c *gin.Context) {
	// **مهم**: این Endpoint باید توسط Middleware ادمین محافظت شود.

	// Parse query parameters for filtering
	filter := &domain.UserFilterSubScribe{}

	if isWholesalerStr, ok := c.GetQuery("is_wholesaler"); ok {
		isWholesaler, err := strconv.ParseBool(isWholesalerStr)
		if err == nil {
			filter.IsWholesaler = &isWholesaler
		}
	}

	if hasSubStr, ok := c.GetQuery("has_subscription"); ok {
		hasSub, err := strconv.ParseBool(hasSubStr)
		if err == nil {
			filter.HasSubscription = &hasSub
		}
	}

	ctx := c.Request.Context()
	users, err := uh.service.FetchAdminUserList(ctx, filter)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	handleSuccess(c, users)
}

// in handler/user_handler.go

func (uh *UserHandler) ImpersonateUser(c *gin.Context) {
	// هویت ادمین از توکن فعلی او که در Middleware بررسی شده، استخراج می‌شود
	fmt.Println("--- ImpersonateUser handler reached! ---")
	authPayload := httputil.GetAuthPayload(c)
	adminID := authPayload.UserID

	targetUserID, err := strconv.ParseInt(c.Param("userId"), 10, 64)
	if err != nil {
		HandleError(c, errors.New("Invalid user ID"), uh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	impersonationToken, targetUser, err := uh.service.ImpersonateUser(ctx, targetUserID, adminID)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	// پاسخ شامل توکن جدید و اطلاعات کاربر است
	handleSuccess(c, gin.H{
		"impersonationToken": impersonationToken,
		"user":               targetUser,
	})
}
