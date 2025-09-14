
type UserFilter struct {

	Role UserRole
	
	State UserState
	
	SearchText string
	
	CityID int64
	
	}
	
	
	
	type UserViewModel struct {
	
	User
	
	IsActive bool `json:"isActive"`
	
	CityName string `json:"cityName"`
	
	SubscriptionDaysLeft int32 `json:"subscriptionDaysLeft"`
	
	}
	
	
	
	type User struct {
	
	ID int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityID int64 `json:"cityId"`
	
	Role UserRole `json:"role"`
	
	State UserState `gorm:"column:state_c" json:"state"`
	
	FullName string `json:"fullName"`
	
	ShopName string `json:"shopName"`
	
	ShopAddress string `json:"shopAddress"`
	
	ShopPhone1 string `json:"shopPhone1"`
	
	ShopPhone2 string `json:"shopPhone2"`
	
	ShopPhone3 string `json:"shopPhone3"`
	
	InstagramUrl string `json:"instagramUrl"`
	
	TelegramUrl string `json:"telegramUrl"`
	
	WhatsappUrl string `json:"whatsappUrl"`
	
	WebsiteUrl string `json:"websiteUrl"`
	
	ImageUrl string `json:"imageUrl"`
	
	DollarPrice decimal.NullDecimal `json:"dollarPrice"`
	
	LikesCount int32 `json:"likesCount"`
	
	ProductsCount int32 `json:"productsCount"`
	
	Latitude decimal.NullDecimal `json:"latitude"`
	
	Longitude decimal.NullDecimal `json:"longitude"`
	
	IsLiked bool `gorm:"-" json:"isLiked"`
	
	
	
	CreatedAt time.Time
	
	UpdatedAt time.Time
	
	}
	
	
	
	type AdminAccess struct {
	
	ID int64 `json:"id"`
	
	UserID int64 `json:"userId"`
	
	SaveProduct bool `json:"saveProduct"`
	
	ChangeUserState bool `json:"changeUserState"`
	
	ChangeShopState bool `json:"changeShopState"`
	
	ChangeAccountState bool `json:"changeAccountState"`
	
	}
	
	
	
	func (AdminAccess) TableName() string {
	
	return "admin_access"
	
	}
	
	
	
	type UserRole int16
	
	
	
	type UserState int16
	
	
	
	const (
	
	roleStart UserRole = iota
	
	SuperAdmin
	
	Admin
	
	Wholesaler
	
	Retailer
	
	roleEnd
	
	)
	
	
	
	const (
	
	stateStart UserState = iota
	
	NewUser
	
	RejectedUser
	
	InactiveAccount
	
	InactiveShop
	
	ApprovedUser
	
	stateEnd
	
	)
	
	
	
	func IsUserRoleValid(userRole UserRole) bool {
	
	return userRole > roleStart && userRole < roleEnd
	
	}
	
	
	
	func IsUserStateValid(userState UserState) bool {
	
	return userState > stateStart && userState < stateEnd
	
	}
	
	
	
	func (User) TableName() string {
	
	return "user_t"
	
	}
	
	
	
	type VerificationCode struct {
	
	ID int64
	
	UserID int64
	
	Code string
	
	}
	
	
	
	func (VerificationCode) TableName() string {
	
	return "verification_code"
	
	}
	
	package handler
	
	
	
	import (
	
	"encoding/json"
	
	"errors"
	
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
	
	service port.UserService
	
	TokenService port.TokenService
	
	AppConfig config.App
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	FullName string `json:"fullName"`
	
	}
	
	
	
	type registerUserResponse struct {
	
	Success bool `json:"success"`
	
	Message string `json:"message"`
	
	UserId int64 `json:"userId"`
	
	}
	
	
	
	func (uh *UserHandler) Register(ctx *gin.Context) {
	
	var req registerUserRequest
	
	if err := ctx.ShouldBindJSON(&req); err != nil {
	
	validationError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	user := domain.User{
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
	FullName: req.FullName,
	
	State: domain.NewUser,
	
	}
	
	
	
	id, err := uh.service.RegisterUser(ctx, &user)
	
	if err != nil {
	
	HandleError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	rsp := &registerUserResponse{
	
	Success: true,
	
	Message: "کاربر با موففیت ثبت شد",
	
	UserId: id,
	
	}
	
	
	
	handleSuccess(ctx, rsp)
	
	}
	
	
	
	type updateUserRequest struct {
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	ID: req.Id,
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
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
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
	SearchText string `json:"searchText"`
	
	CityID int64 `json:"cityId"`
	
	Page int `json:"page"`
	
	Limit int `json:"limit"`
	
	}
	
	type fetchUsersByFilterResponse struct {
	
	Users []*domain.UserViewModel `json:"users"`
	
	TotalCount int64 `json:"totalCount"`
	
	}
	
	
	
	type changeUserStateRequest struct {
	
	UserID int64 `json:"userId"`
	
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
	
	Role: domain.UserRole(req.Role),
	
	State: domain.UserState(req.State),
	
	SearchText: req.SearchText,
	
	CityID: req.CityID,
	
	}, req.Page, req.Limit)
	
	
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	// ساخت پاسخ نهایی با ساختار صحیح
	
	responsePayload := &fetchUsersByFilterResponse{
	
	Users: users,
	
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
	
	ShopName string `json:"shopName"`
	
	ShopPhone1 string `json:"shopPhone1"`
	
	ShopPhone2 string `json:"shopPhone2"`
	
	ShopPhone3 string `json:"shopPhone3"`
	
	ShopAddress string `json:"shopAddress"`
	
	TelegramUrl string `json:"telegramUrl"`
	
	InstagramUrl string `json:"instagramUrl"`
	
	WhatsappUrl string `json:"whatsappUrl"`
	
	WebsiteUrl string `json:"websiteUrl"`
	
	Latitude string `json:"latitude"`
	
	Longitude string `json:"longitude"`
	
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
	
	ID: currentUserID,
	
	ShopName: req.ShopName,
	
	ShopPhone1: req.ShopPhone1,
	
	ShopPhone2: req.ShopPhone2,
	
	ShopPhone3: req.ShopPhone3,
	
	ShopAddress: req.ShopAddress,
	
	TelegramUrl: req.TelegramUrl,
	
	InstagramUrl: req.InstagramUrl,
	
	WhatsappUrl: req.WhatsappUrl,
	
	WebsiteUrl: req.WebsiteUrl,
	
	Latitude: latitude,
	
	Longitude: longitude,
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
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
	
	CityID int64 `json:"cityId"`
	
	City string `json:"city"` // نام شهر (اختیاری، اگر جوین می‌زنی)
	
	SubscriptionID int64 `json:"subscriptionId"`
	
	ExpiresAt time.Time `json:"expiresAt"`
	
	IsActive bool `json:"isActive"`
	
	DaysRemaining int `json:"daysRemaining"` // اگر منقضی شده = 0
	
	DaysOverdue int `json:"daysOverdue"` // اگر فعال است = 0
	
	}
	
	
	
	type fetchUserInfoResponse struct {
	
	User domain.User `json:"user"`
	
	AdminAccessInfo *domain.AdminAccess `json:"adminAccessInfo"`
	
	Subscriptions []subscriptionStatusVM `json:"subscriptions"`
	
	HasActiveSubscription bool `json:"hasActiveSubscription"`
	
	ActiveCities []int64 `json:"activeCities"`
	
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
	
	CityID: s.CityID,
	
	City: s.City, // اگر در کوئری جوین کردی
	
	SubscriptionID: s.SubscriptionID,
	
	ExpiresAt: s.ExpiresAt,
	
	IsActive: isActive,
	
	DaysRemaining: daysRemaining,
	
	DaysOverdue: daysOverdue,
	
	}
	
	outSubs = append(outSubs, vm)
	
	if isActive {
	
	hasActive = true
	
	activeCities = append(activeCities, s.CityID)
	
	}
	
	}
	
	
	
	response := &fetchUserInfoResponse{
	
	User: *fetchedUser,
	
	AdminAccessInfo: adminAccessInfo,
	
	Subscriptions: outSubs,
	
	HasActiveSubscription: hasActive,
	
	ActiveCities: activeCities,
	
	}
	
	
	
	handleSuccess(c, response)
	
	}
	
	
	
	type updateDollarPriceRequest struct {
	
	DollarPrice string `json:"dollarPrice"`
	
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
	
	
	
	err = uh.service.UpdateDollarPrice(c, currentUserId, decimal.NullDecimal{
	
	Decimal: dollarPriceDecimal,
	
	Valid: !dollarPriceDecimal.IsZero(),
	
	})
	
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
	
	SaveProduct bool `json:"saveProduct"`
	
	ChangeUserState bool `json:"changeUserState"`
	
	ChangeShopState bool `json:"changeShopState"`
	
	ChangeAccountState bool `json:"changeAccountState"`
	
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
	
	UserID: uriReq.AdminID,
	
	SaveProduct: reqPayload.SaveProduct,
	
	ChangeUserState: reqPayload.ChangeUserState,
	
	ChangeShopState: reqPayload.ChangeShopState,
	
	ChangeAccountState: reqPayload.ChangeAccountState,
	
	})
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	handleSuccess(c, nil)
	
	}
	
	
	
	package handler
	
	
	
	import (
	
	"encoding/json"
	
	"errors"
	
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
	
	service port.UserService
	
	TokenService port.TokenService
	
	AppConfig config.App
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	FullName string `json:"fullName"`
	
	}
	
	
	
	type registerUserResponse struct {
	
	Success bool `json:"success"`
	
	Message string `json:"message"`
	
	UserId int64 `json:"userId"`
	
	}
	
	
	
	func (uh *UserHandler) Register(ctx *gin.Context) {
	
	var req registerUserRequest
	
	if err := ctx.ShouldBindJSON(&req); err != nil {
	
	validationError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	user := domain.User{
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
	FullName: req.FullName,
	
	State: domain.NewUser,
	
	}
	
	
	
	id, err := uh.service.RegisterUser(ctx, &user)
	
	if err != nil {
	
	HandleError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	rsp := &registerUserResponse{
	
	Success: true,
	
	Message: "کاربر با موففیت ثبت شد",
	
	UserId: id,
	
	}
	
	
	
	handleSuccess(ctx, rsp)
	
	}
	
	
	
	type updateUserRequest struct {
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	ID: req.Id,
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
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
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
	SearchText string `json:"searchText"`
	
	CityID int64 `json:"cityId"`
	
	Page int `json:"page"`
	
	Limit int `json:"limit"`
	
	}
	
	type fetchUsersByFilterResponse struct {
	
	Users []*domain.UserViewModel `json:"users"`
	
	TotalCount int64 `json:"totalCount"`
	
	}
	
	
	
	type changeUserStateRequest struct {
	
	UserID int64 `json:"userId"`
	
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
	
	Role: domain.UserRole(req.Role),
	
	State: domain.UserState(req.State),
	
	SearchText: req.SearchText,
	
	CityID: req.CityID,
	
	}, req.Page, req.Limit)
	
	
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	// ساخت پاسخ نهایی با ساختار صحیح
	
	responsePayload := &fetchUsersByFilterResponse{
	
	Users: users,
	
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
	
	ShopName string `json:"shopName"`
	
	ShopPhone1 string `json:"shopPhone1"`
	
	ShopPhone2 string `json:"shopPhone2"`
	
	ShopPhone3 string `json:"shopPhone3"`
	
	ShopAddress string `json:"shopAddress"`
	
	TelegramUrl string `json:"telegramUrl"`
	
	InstagramUrl string `json:"instagramUrl"`
	
	WhatsappUrl string `json:"whatsappUrl"`
	
	WebsiteUrl string `json:"websiteUrl"`
	
	Latitude string `json:"latitude"`
	
	Longitude string `json:"longitude"`
	
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
	
	ID: currentUserID,
	
	ShopName: req.ShopName,
	
	ShopPhone1: req.ShopPhone1,
	
	ShopPhone2: req.ShopPhone2,
	
	ShopPhone3: req.ShopPhone3,
	
	ShopAddress: req.ShopAddress,
	
	TelegramUrl: req.TelegramUrl,
	
	InstagramUrl: req.InstagramUrl,
	
	WhatsappUrl: req.WhatsappUrl,
	
	WebsiteUrl: req.WebsiteUrl,
	
	Latitude: latitude,
	
	Longitude: longitude,
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
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
	
	CityID int64 `json:"cityId"`
	
	City string `json:"city"` // نام شهر (اختیاری، اگر جوین می‌زنی)
	
	SubscriptionID int64 `json:"subscriptionId"`
	
	ExpiresAt time.Time `json:"expiresAt"`
	
	IsActive bool `json:"isActive"`
	
	DaysRemaining int `json:"daysRemaining"` // اگر منقضی شده = 0
	
	DaysOverdue int `json:"daysOverdue"` // اگر فعال است = 0
	
	}
	
	
	
	type fetchUserInfoResponse struct {
	
	User domain.User `json:"user"`
	
	AdminAccessInfo *domain.AdminAccess `json:"adminAccessInfo"`
	
	Subscriptions []subscriptionStatusVM `json:"subscriptions"`
	
	HasActiveSubscription bool `json:"hasActiveSubscription"`
	
	ActiveCities []int64 `json:"activeCities"`
	
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
	
	CityID: s.CityID,
	
	City: s.City, // اگر در کوئری جوین کردی
	
	SubscriptionID: s.SubscriptionID,
	
	ExpiresAt: s.ExpiresAt,
	
	IsActive: isActive,
	
	DaysRemaining: daysRemaining,
	
	DaysOverdue: daysOverdue,
	
	}
	
	outSubs = append(outSubs, vm)
	
	if isActive {
	
	hasActive = true
	
	activeCities = append(activeCities, s.CityID)
	
	}
	
	}
	
	
	
	response := &fetchUserInfoResponse{
	
	User: *fetchedUser,
	
	AdminAccessInfo: adminAccessInfo,
	
	Subscriptions: outSubs,
	
	HasActiveSubscription: hasActive,
	
	ActiveCities: activeCities,
	
	}
	
	
	
	handleSuccess(c, response)
	
	}
	
	
	
	type updateDollarPriceRequest struct {
	
	DollarPrice string `json:"dollarPrice"`
	
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
	
	
	
	err = uh.service.UpdateDollarPrice(c, currentUserId, decimal.NullDecimal{
	
	Decimal: dollarPriceDecimal,
	
	Valid: !dollarPriceDecimal.IsZero(),
	
	})
	
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
	
	SaveProduct bool `json:"saveProduct"`
	
	ChangeUserState bool `json:"changeUserState"`
	
	ChangeShopState bool `json:"changeShopState"`
	
	ChangeAccountState bool `json:"changeAccountState"`
	
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
	
	UserID: uriReq.AdminID,
	
	SaveProduct: reqPayload.SaveProduct,
	
	ChangeUserState: reqPayload.ChangeUserState,
	
	ChangeShopState: reqPayload.ChangeShopState,
	
	ChangeAccountState: reqPayload.ChangeAccountState,
	
	})
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	handleSuccess(c, nil)
	
	}
	
	
	
	package handler
	
	
	
	import (
	
	"encoding/json"
	
	"errors"
	
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
	
	service port.UserService
	
	TokenService port.TokenService
	
	AppConfig config.App
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	FullName string `json:"fullName"`
	
	}
	
	
	
	type registerUserResponse struct {
	
	Success bool `json:"success"`
	
	Message string `json:"message"`
	
	UserId int64 `json:"userId"`
	
	}
	
	
	
	func (uh *UserHandler) Register(ctx *gin.Context) {
	
	var req registerUserRequest
	
	if err := ctx.ShouldBindJSON(&req); err != nil {
	
	validationError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	user := domain.User{
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
	FullName: req.FullName,
	
	State: domain.NewUser,
	
	}
	
	
	
	id, err := uh.service.RegisterUser(ctx, &user)
	
	if err != nil {
	
	HandleError(ctx, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	rsp := &registerUserResponse{
	
	Success: true,
	
	Message: "کاربر با موففیت ثبت شد",
	
	UserId: id,
	
	}
	
	
	
	handleSuccess(ctx, rsp)
	
	}
	
	
	
	type updateUserRequest struct {
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	ID: req.Id,
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Id int64 `json:"id"`
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
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
	
	Role int16 `json:"role"`
	
	State int16 `json:"state"`
	
	SearchText string `json:"searchText"`
	
	CityID int64 `json:"cityId"`
	
	Page int `json:"page"`
	
	Limit int `json:"limit"`
	
	}
	
	type fetchUsersByFilterResponse struct {
	
	Users []*domain.UserViewModel `json:"users"`
	
	TotalCount int64 `json:"totalCount"`
	
	}
	
	
	
	type changeUserStateRequest struct {
	
	UserID int64 `json:"userId"`
	
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
	
	Role: domain.UserRole(req.Role),
	
	State: domain.UserState(req.State),
	
	SearchText: req.SearchText,
	
	CityID: req.CityID,
	
	}, req.Page, req.Limit)
	
	
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	// ساخت پاسخ نهایی با ساختار صحیح
	
	responsePayload := &fetchUsersByFilterResponse{
	
	Users: users,
	
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
	
	ShopName string `json:"shopName"`
	
	ShopPhone1 string `json:"shopPhone1"`
	
	ShopPhone2 string `json:"shopPhone2"`
	
	ShopPhone3 string `json:"shopPhone3"`
	
	ShopAddress string `json:"shopAddress"`
	
	TelegramUrl string `json:"telegramUrl"`
	
	InstagramUrl string `json:"instagramUrl"`
	
	WhatsappUrl string `json:"whatsappUrl"`
	
	WebsiteUrl string `json:"websiteUrl"`
	
	Latitude string `json:"latitude"`
	
	Longitude string `json:"longitude"`
	
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
	
	ID: currentUserID,
	
	ShopName: req.ShopName,
	
	ShopPhone1: req.ShopPhone1,
	
	ShopPhone2: req.ShopPhone2,
	
	ShopPhone3: req.ShopPhone3,
	
	ShopAddress: req.ShopAddress,
	
	TelegramUrl: req.TelegramUrl,
	
	InstagramUrl: req.InstagramUrl,
	
	WhatsappUrl: req.WhatsappUrl,
	
	WebsiteUrl: req.WebsiteUrl,
	
	Latitude: latitude,
	
	Longitude: longitude,
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
	Role int16 `json:"role"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
	Role: domain.UserRole(req.Role),
	
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
	
	Phone string `json:"phone"`
	
	CityId int64 `json:"cityId"`
	
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
	
	Phone: req.Phone,
	
	CityID: req.CityId,
	
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
	
	CityID int64 `json:"cityId"`
	
	City string `json:"city"` // نام شهر (اختیاری، اگر جوین می‌زنی)
	
	SubscriptionID int64 `json:"subscriptionId"`
	
	ExpiresAt time.Time `json:"expiresAt"`
	
	IsActive bool `json:"isActive"`
	
	DaysRemaining int `json:"daysRemaining"` // اگر منقضی شده = 0
	
	DaysOverdue int `json:"daysOverdue"` // اگر فعال است = 0
	
	}
	
	
	
	type fetchUserInfoResponse struct {
	
	User domain.User `json:"user"`
	
	AdminAccessInfo *domain.AdminAccess `json:"adminAccessInfo"`
	
	Subscriptions []subscriptionStatusVM `json:"subscriptions"`
	
	HasActiveSubscription bool `json:"hasActiveSubscription"`
	
	ActiveCities []int64 `json:"activeCities"`
	
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
	
	CityID: s.CityID,
	
	City: s.City, // اگر در کوئری جوین کردی
	
	SubscriptionID: s.SubscriptionID,
	
	ExpiresAt: s.ExpiresAt,
	
	IsActive: isActive,
	
	DaysRemaining: daysRemaining,
	
	DaysOverdue: daysOverdue,
	
	}
	
	outSubs = append(outSubs, vm)
	
	if isActive {
	
	hasActive = true
	
	activeCities = append(activeCities, s.CityID)
	
	}
	
	}
	
	
	
	response := &fetchUserInfoResponse{
	
	User: *fetchedUser,
	
	AdminAccessInfo: adminAccessInfo,
	
	Subscriptions: outSubs,
	
	HasActiveSubscription: hasActive,
	
	ActiveCities: activeCities,
	
	}
	
	
	
	handleSuccess(c, response)
	
	}
	
	
	
	type updateDollarPriceRequest struct {
	
	DollarPrice string `json:"dollarPrice"`
	
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
	
	
	
	err = uh.service.UpdateDollarPrice(c, currentUserId, decimal.NullDecimal{
	
	Decimal: dollarPriceDecimal,
	
	Valid: !dollarPriceDecimal.IsZero(),
	
	})
	
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
	
	SaveProduct bool `json:"saveProduct"`
	
	ChangeUserState bool `json:"changeUserState"`
	
	ChangeShopState bool `json:"changeShopState"`
	
	ChangeAccountState bool `json:"changeAccountState"`
	
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
	
	UserID: uriReq.AdminID,
	
	SaveProduct: reqPayload.SaveProduct,
	
	ChangeUserState: reqPayload.ChangeUserState,
	
	ChangeShopState: reqPayload.ChangeShopState,
	
	ChangeAccountState: reqPayload.ChangeAccountState,
	
	})
	
	if err != nil {
	
	HandleError(c, err, uh.AppConfig.Lang)
	
	return
	
	}
	
	
	
	handleSuccess(c, nil)
	
	}
	
	package handler
	
	
	
	import (
	
	"errors"
	
	"time"
	
	
	
	"github.com/gin-gonic/gin"
	
	"github.com/nerkhin/internal/adapter/config"
	
	
	
	"github.com/nerkhin/internal/core/domain/msg"
	
	"github.com/nerkhin/internal/core/port"
	
	)
	
	
	
	// AuthHandler struct
	
	type AuthHandler struct {
	
	tokenService port.TokenService
	
	authService port.AuthService
	
	verificationCodeService port.VerificationCodeService
	
	config config.App
	
	userSubRepo port.UserSubscriptionService
	
	}
	
	
	
	// RegisterAuthHandler
	
	func RegisterAuthHandler(
	
	authService port.AuthService,
	
	tokenService port.TokenService,
	
	verificationCodeService port.VerificationCodeService,
	
	userSubRepo port.UserSubscriptionService,
	
	appConfig config.App) *AuthHandler {
	
	return &AuthHandler{
	
	tokenService: tokenService,
	
	authService: authService,
	
	verificationCodeService: verificationCodeService,
	
	config: appConfig,
	
	userSubRepo: userSubRepo,
	
	}
	
	}
	
	
	
	// --- Login Handler ---
	
	type loginRequest struct {
	
	Phone string `json:"phone" binding:"required"`
	
	}
	
	type loginResponse struct {
	
	Success bool `json:"success"` // <--- این فیلد اضافه شد
	
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
	
	Code string `json:"code" binding:"required"`
	
	}
	
	
	
	type refreshRequest struct {
	
	RefreshToken string `json:"refreshToken" binding:"required"`
	
	}
	
	
	
	type tokenResponse struct {
	
	AccessToken string `json:"accessToken"`
	
	RefreshToken string `json:"refreshToken,omitempty"`
	
	AccessTokenExpiresAt int64 `json:"accessTokenExpiresAt"` // Unix Timestamp
	
	User *UserResponse `json:"user"`
	
	SubscriptionStatus string `json:"subscriptionStatus,omitempty"` // "active" | "trial" | "expired" | "none"
	
	SubscriptionExpiresAt *string `json:"subscriptionExpiresAt,omitempty"` // ISO8601 مثل "2025-12-31T23:59:59Z"
	
	}
	
	
	
	type UserResponse struct {
	
	ID int64 `json:"id"`
	
	FullName string `json:"fullName,omitempty"`
	
	Phone string `json:"phone,omitempty"`
	
	Role int16 `json:"role,omitempty"`
	
	CityID int64 `json:"cityId,omitempty"`
	
	SubscriptionStatus string `json:"subscriptionStatus,omitempty"` // "active" | "trial" | "expired" | "none"
	
	SubscriptionExpiresAt *string `json:"subscriptionExpiresAt,omitempty"` // ISO8601 مثل "2025-12-31T23:59:59Z"
	
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
	
	subStatus, subExp, _ := ah.fetchSubscriptionInfo(ctx, user.ID)
	
	
	
	var subExpStr *string
	
	if subExp != nil {
	
	s := subExp.UTC().Format(time.RFC3339)
	
	subExpStr = &s
	
	}
	
	
	
	clientUserResponse := &UserResponse{
	
	ID: user.ID,
	
	FullName: user.FullName,
	
	Phone: user.Phone,
	
	Role: int16(user.Role),
	
	CityID: user.CityID,
	
	SubscriptionStatus: subStatus,
	
	SubscriptionExpiresAt: subExpStr,
	
	}
	
	
	
	responsePayload := &tokenResponse{
	
	AccessToken: accessTokenString,
	
	RefreshToken: refreshTokenString,
	
	AccessTokenExpiresAt: accessTokenExpiration.Unix(), // <--- استفاده صحیح از زمان انقضای بازگشتی
	
	User: clientUserResponse,
	
	SubscriptionStatus: subStatus,
	
	SubscriptionExpiresAt: subExpStr,
	
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
	
	subStatus, subExp, _ := ah.fetchSubscriptionInfo(ctx, user.ID)
	
	
	
	var subExpStr *string
	
	if subExp != nil {
	
	s := subExp.UTC().Format(time.RFC3339)
	
	subExpStr = &s
	
	}
	
	
	
	clientUserResponse := &UserResponse{
	
	ID: user.ID,
	
	FullName: user.FullName,
	
	Phone: user.Phone,
	
	Role: int16(user.Role),
	
	CityID: user.CityID,
	
	SubscriptionStatus: subStatus,
	
	SubscriptionExpiresAt: subExpStr,
	
	}
	
	
	
	responsePayload := &tokenResponse{
	
	AccessToken: newAccessTokenString,
	
	RefreshToken: req.RefreshToken, // همان رفرش توکن قبلی
	
	AccessTokenExpiresAt: Expiration.Unix(),
	
	User: clientUserResponse,
	
	SubscriptionStatus: subStatus,
	
	SubscriptionExpiresAt: subExpStr,
	
	}
	
	handleSuccess(ctx, responsePayload)
	
	}
	
	
	
	// در فایل handler
	
	func (ah *AuthHandler) fetchSubscriptionInfo(
	
	ctx *gin.Context,
	
	userID int64,
	
	) (status string, expiresAt *time.Time, err error) {
	
	
	
	// همه اشتراک‌های کاربر (برای هر شهر ممکن)
	
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
	
	// اولین اشتراک معتبر را ملاک قرار بده
	
	if it.ExpiresAt.After(now) {
	
	return "active", &it.ExpiresAt, nil
	
	}
	
	// اگر منقضی شده بود همون را برگردون و تمام
	
	return "expired", &it.ExpiresAt, nil
	
	}
	
	
	
	return "none", nil, nil
	
	}
	
	package middleware
	
	
	
	import (
	
	"errors"
	
	
	
	"strings"
	
	
	
	"github.com/gin-gonic/gin"
	
	"github.com/nerkhin/internal/adapter/config"
	
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	
	"github.com/nerkhin/internal/core/domain"
	
	"github.com/nerkhin/internal/core/domain/msg"
	
	"github.com/nerkhin/internal/core/port"
	
	)
	
	
	
	const (
	
	authorizationHeaderKey = "authorization"
	
	authorizationType = "bearer"
	
	authorizationPayloadKey = "authorization_payload"
	
	)
	
	
	
	func AuthMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	
	return func(c *gin.Context) {
	
	
	
	authorizationHeader := c.GetHeader("Authorization")
	
	
	
	if len(authorizationHeader) == 0 {
	
	
	
	handler.HandleAbort(c, errors.New(msg.ErrEmptyAuthorizationHeader), appConfig.Lang)
	
	return
	
	}
	
	
	
	fields := strings.Fields(authorizationHeader)
	
	
	
	if len(fields) != 2 {
	
	
	
	handler.HandleAbort(c, errors.New(msg.ErrInvalidAuthorizationHeader), appConfig.Lang)
	
	return
	
	}
	
	
	
	if strings.ToLower(fields[0]) != "bearer" {
	
	
	
	handler.HandleAbort(c, errors.New(msg.ErrInvalidAuthorizationType), appConfig.Lang)
	
	return
	
	}
	
	
	
	tokenString := fields[1]
	
	if strings.Contains(c.Request.URL.Path, "/product-model/by-brand") {
	
	
	
	}
	
	
	
	payload, err := token.VerifyAccessToken(tokenString)
	
	
	
	if err != nil || payload == nil {
	
	
	
	handler.HandleAbort(c, errors.New(msg.ErrInvalidToken), appConfig.Lang)
	
	return
	
	}
	
	
	
	c.Set(httputil.AuthPayloadKey, payload)
	
	c.Set("user_id", payload.UserID)
	
	
	
	c.Next()
	
	}
	
	}
	
	
	
	func AdminMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	
	return func(ctx *gin.Context) {
	
	payload := httputil.GetAuthPayload(ctx)
	
	
	
	if payload == nil {
	
	handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
	
	return
	
	}
	
	
	
	isAdmin := payload.UserRole == domain.SuperAdmin || payload.UserRole == domain.Admin
	
	if !isAdmin {
	
	err := errors.New(msg.ErrOperationNotAllowedForThisUser)
	
	handler.HandleAbort(ctx, err, appConfig.Lang)
	
	return
	
	}
	
	
	
	ctx.Next()
	
	}
	
	}
	
	
	
	func ApprovedUserMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	
	return func(ctx *gin.Context) {
	
	
	
	// استخراج payload
	
	val, exists := ctx.Get(httputil.AuthPayloadKey)
	
	if !exists {
	
	handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
	
	return
	
	}
	
	
	
	payload, ok := val.(*domain.TokenPayload)
	
	if !ok || payload == nil {
	
	handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
	
	return
	
	}
	
	
	
	// بررسی وضعیت تأیید کاربر
	
	if payload.UserState != domain.ApprovedUser {
	
	handler.HandleAbort(ctx, errors.New(msg.ErrOperationNotAllowedForNonApprovedUser), appConfig.Lang)
	
	return
	
	}
	
	
	
	// ادامه پردازش
	
	ctx.Next()
	
	}
	
	}
	
	
	
	func NonAdminMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	
	return func(ctx *gin.Context) {
	
	payload := httputil.GetAuthPayload(ctx)
	
	if payload == nil {
	
	handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
	
	return
	
	}
	
	
	
	isNonAdmin := payload.UserRole != domain.SuperAdmin && payload.UserRole != domain.Admin
	
	if !isNonAdmin {
	
	err := errors.New(msg.ErrOperationNotAllowedForThisUser)
	
	handler.HandleAbort(ctx, err, appConfig.Lang)
	
	return
	
	}
	
	
	
	ctx.Next()
	
	}
	
	}
	
	package auth
	
	
	
	import (
	
	"github.com/gin-gonic/gin"
	
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	
	)
	
	
	
	func AddRoutes(
	
	parent *gin.RouterGroup,
	
	authHandler *handler.AuthHandler,
	
	userHandler *handler.UserHandler,
	
	) {
	
	authGroup := parent.Group("/auth")
	
	
	
	authGroup.POST("/login", authHandler.Login)
	
	
	
	if userHandler != nil {
	
	authGroup.POST("/register", userHandler.Register)
	
	}
	
	
	
	authGroup.POST("/verify-code", authHandler.VerifyCode)
	
	
	
	authGroup.POST("/refresh-token", authHandler.RefreshAccessToken)
	
	}
	
	// فایل: internal/adapter/auth/paseto/paseto.go (یا مسیر مشابه در پروژه شما)
	
	package paseto
	
	
	
	import (
	
	"errors"
	
	"fmt"
	
	"time"
	
	
	
	// "os" // اگر کلید را مستقیماً از env می‌خوانید، اما بهتر است از طریق کانفیگ پاس داده شود
	
	
	
	"aidanwoods.dev/go-paseto"
	
	"github.com/google/uuid"
	
	"github.com/nerkhin/internal/adapter/config" // مسیر صحیح به پکیج کانفیگ شما
	
	"github.com/nerkhin/internal/core/domain" // مسیر صحیح به پکیج دامین شما
	
	"github.com/nerkhin/internal/core/domain/msg" // مسیر صحیح به پکیج پیام‌های شما
	
	"github.com/nerkhin/internal/core/port" // مسیر صحیح به پکیج پورت شما
	
	)
	
	
	
	// ساختار PasetoToken:
	
	// - دیگر نیازی به نگهداری یک نمونه *paseto.Token نیست.
	
	// - key و parser به صورت مقدار (value) ذخیره می‌شوند، نه اشاره‌گر (pointer).
	
	type PasetoToken struct {
	
	key paseto.V4SymmetricKey
	
	parser paseto.Parser
	
	accessTokenDuration time.Duration
	
	refreshTokenDuration time.Duration
	
	}
	
	
	
	// این خط در زمان کامپایل بررسی می‌کند که آیا *PasetoToken تمام متدهای اینترفیس port.TokenService را پیاده‌سازی کرده است یا خیر.
	
	var _ port.TokenService = (*PasetoToken)(nil)
	
	
	
	// RegisterTokenService: تابع سازنده و مقداردهی اولیه سرویس توکن
	
	func RegisterTokenService(cfg config.TokenConfig) (port.TokenService, error) {
	
	// 1. Parse کردن مدت اعتبارها
	
	accessTokenDur, err := time.ParseDuration(cfg.Duration)
	
	if err != nil {
	
	return nil, fmt.Errorf("%s (for access token): %w", msg.ErrTokenDuration, err)
	
	}
	
	
	
	refreshTokenDur, err := time.ParseDuration(cfg.RefreshTokenDuration)
	
	if err != nil {
	
	return nil, fmt.Errorf("%s (for refresh token): %w", msg.ErrTokenDuration, err)
	
	}
	
	
	
	// 2. بررسی و ایجاد کلید متقارن Paseto
	
	if cfg.SymmetricKeyHex == "" {
	
	// در محیط پروداکشن، این باید یک خطای fatal باشد.
	
	return nil, errors.New("Paseto symmetric key (SymmetricKeyHex) is not provided in config")
	
	}
	
	if len(cfg.SymmetricKeyHex) != 64 {
	
	return nil, fmt.Errorf("invalid Paseto key length: must be 64 hex characters, got %d", len(cfg.SymmetricKeyHex))
	
	}
	
	
	
	key, keyErr := paseto.V4SymmetricKeyFromHex(cfg.SymmetricKeyHex)
	
	if keyErr != nil {
	
	return nil, fmt.Errorf("failed to create Paseto symmetric key from hex: %w", keyErr)
	
	}
	
	
	
	// 3. ایجاد یک parser برای استفاده‌های بعدی
	
	parser := paseto.NewParser()
	
	// می‌توانید rule های بیشتری به parser اضافه کنید، مثلاً:
	
	// parser.AddRule(paseto.ForAudience("your-app-audience"))
	
	
	
	// 4. برگرداندن یک نمونه از PasetoToken با مقادیر صحیح
	
	return &PasetoToken{
	
	key: key,
	
	parser: parser,
	
	accessTokenDuration: accessTokenDur,
	
	refreshTokenDuration: refreshTokenDur,
	
	}, nil
	
	}
	
	
	
	// داخل همين فایل paseto.go اضافه كنيد: -------------------------------
	
	
	
	func (pt *PasetoToken) safeParse(tokenString string) (*paseto.Token, error) {
	
	var parsed *paseto.Token
	
	var err error
	
	
	
	// هر panic داخلی Paseto را به error تبدیل می‌کنیم
	
	defer func() {
	
	if r := recover(); r != nil {
	
	err = fmt.Errorf("%s (panic while parsing token): %v", msg.ErrInvalidToken, r)
	
	}
	
	}()
	
	
	
	parsed, err = pt.parser.ParseV4Local(pt.key, tokenString, nil)
	
	return parsed, err
	
	}
	
	
	
	// --- پیاده‌سازی متدهای اینترفیس port.TokenService ---
	
	
	
	func (pt *PasetoToken) CreateAccessToken(user *domain.User, adminAccess *domain.AdminAccess) (string, *domain.TokenPayload, time.Time, error) {
	
	jti, err := uuid.NewRandom()
	
	if err != nil {
	
	return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	
	}
	
	
	
	payload := &domain.TokenPayload{
	
	JTI: jti,
	
	UserID: user.ID,
	
	UserRole: user.Role,
	
	UserState: user.State,
	
	CityID: user.CityID,
	
	AdminAccess: adminAccess,
	
	Type: "access",
	
	}
	
	
	
	token := paseto.NewToken()
	
	if err := token.Set("payload", payload); err != nil {
	
	return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	
	}
	
	
	
	issuedAt := time.Now().UTC()
	
	expiredAt := issuedAt.Add(pt.accessTokenDuration)
	
	
	
	token.SetIssuedAt(issuedAt)
	
	token.SetNotBefore(issuedAt)
	
	token.SetExpiration(expiredAt)
	
	
	
	encryptedToken := token.V4Encrypt(pt.key, nil)
	
	return encryptedToken, payload, expiredAt, nil
	
	}
	
	
	
	func (pt *PasetoToken) VerifyAccessToken(tokenString string) (*domain.TokenPayload, error) {
	
	
	
	var tokenPayload domain.TokenPayload
	
	parsedToken, err := pt.safeParse(tokenString)
	
	if err != nil {
	
	return nil, err // توکن نامعتبر است
	
	}
	
	if parsedToken == nil { // در صورت panic، این nil می‌شود
	
	return nil, errors.New(msg.ErrInvalidToken)
	
	}
	
	
	
	if err := parsedToken.Get("payload", &tokenPayload); err != nil {
	
	return nil, fmt.Errorf("%s: failed to get 'payload' claim from access token: %w", msg.ErrInvalidToken, err)
	
	}
	
	
	
	if tokenPayload.Type != "access" {
	
	return nil, fmt.Errorf("%s: token type is not 'access'", msg.ErrInvalidToken)
	
	}
	
	
	
	return &tokenPayload, nil
	
	}
	
	
	
	func (pt *PasetoToken) CreateRefreshToken(user *domain.User) (string, *domain.RefreshTokenPayload, time.Time, error) {
	
	jti, err := uuid.NewRandom()
	
	if err != nil {
	
	return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	
	}
	
	payload := &domain.RefreshTokenPayload{
	
	JTI: jti,
	
	UserID: user.ID,
	
	UserRole: user.Role,
	
	Type: "refresh",
	
	}
	
	token := paseto.NewToken()
	
	if err := token.Set("payload", payload); err != nil {
	
	return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	
	}
	
	
	
	issuedAt := time.Now().UTC()
	
	expiredAt := issuedAt.Add(pt.refreshTokenDuration)
	
	
	
	token.SetIssuedAt(issuedAt)
	
	token.SetNotBefore(issuedAt)
	
	token.SetExpiration(expiredAt)
	
	
	
	encryptedToken := token.V4Encrypt(pt.key, nil)
	
	return encryptedToken, payload, expiredAt, nil
	
	}
	
	
	
	func (pt *PasetoToken) VerifyRefreshToken(tokenString string) (*domain.RefreshTokenPayload, error) {
	
	var tokenPayload domain.RefreshTokenPayload
	
	
	
	parsedToken, err := pt.parser.ParseV4Local(pt.key, tokenString, nil)
	
	if err != nil {
	
	
	
	return nil, fmt.Errorf("%s (refresh token): %w", msg.ErrInvalidToken, err)
	
	}
	
	
	
	if err := parsedToken.Get("payload", &tokenPayload); err != nil {
	
	return nil, fmt.Errorf("%s: failed to get 'payload' claim from refresh token: %w", msg.ErrInvalidToken, err)
	
	}
	
	
	
	if tokenPayload.Type != "refresh" {
	
	return nil, fmt.Errorf("%s: token type is not 'refresh'", msg.ErrInvalidToken)
	
	}
	
	return &tokenPayload, nil
	
	}
	
	
	
	func (pt *PasetoToken) GetAccessTokenDuration() time.Duration {
	
	return pt.accessTokenDuration
	
	}
	
	
	
	func (pt *PasetoToken) GetRefreshTokenDuration() time.Duration {
	
	return pt.refreshTokenDuration
	
	}
	
	package service
	
	
	
	import (
	
	"context"
	
	"errors"
	
	"regexp"
	
	
	
	"github.com/nerkhin/internal/adapter/config"
	
	"github.com/nerkhin/internal/core/domain"
	
	"github.com/nerkhin/internal/core/domain/msg"
	
	"github.com/nerkhin/internal/core/port"
	
	"github.com/shopspring/decimal"
	
	)
	
	
	
	var mobilePhoneNumberRegex *regexp.Regexp
	
	var nonMobilePhoneNumberRegex *regexp.Regexp
	
	
	
	func init() {
	
	mobilePhoneNumberRegex = regexp.MustCompile(`^(\+98|0)?9\d{9}$`)
	
	nonMobilePhoneNumberRegex = regexp.MustCompile(`^0[0-9]{2,}[0-9]{7,}$`)
	
	}
	
	
	
	type UserService struct {
	
	dbms port.DBMS
	
	repo port.UserRepository
	
	appConfig config.App
	
	verificationCodeService port.VerificationCodeService
	
	verificationCodeRepo port.VerificationCodeRepository
	
	}
	
	
	
	func RegisterUserService(dbms port.DBMS, repo port.UserRepository,
	
	vcService port.VerificationCodeService, verificationCodeRepo port.VerificationCodeRepository,
	
	appConfig config.App) *UserService {
	
	return &UserService{
	
	dbms,
	
	repo,
	
	appConfig,
	
	vcService,
	
	verificationCodeRepo,
	
	}
	
	}
	
	
	
	func (us *UserService) GetDollarPrice(ctx context.Context, id int64) (dollarPrice string, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	dollarPrice, err = us.repo.GetDollarPrice(ctx, txSession, id)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return dollarPrice, nil
	
	}
	
	
	
	func (us *UserService) RegisterUser(ctx context.Context, user *domain.User) (id int64, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if user.ID != 0 {
	
	err = errors.New(msg.ErrDataIsNotValid)
	
	return err
	
	}
	
	
	
	err = validateNewUser(ctx, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	if user.Role == domain.SuperAdmin || user.Role == domain.Admin {
	
	return errors.New(msg.ErrNewUserRoleShouldBeRetailerOrWholesaler)
	
	}
	
	
	
	user.State = domain.NewUser
	
	id, err = us.repo.CreateUser(ctx, txSession, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return id, nil
	
	}
	
	
	
	func (us *UserService) UpdateUser(ctx context.Context, user *domain.User) (id int64, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if user.ID < 1 {
	
	return errors.New(msg.ErrDataIsNotValid)
	
	}
	
	
	
	originalUser, err := us.GetUserByID(ctx, user.ID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	err = validateExistingUser(ctx, user, originalUser)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	id, err = us.repo.UpdateUser(ctx, txSession, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return id, nil
	
	}
	
	
	
	func (us *UserService) GetUserByID(ctx context.Context, id int64) (user *domain.User, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	user, err = us.repo.GetUserByID(ctx, txSession, id)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	
	
	func (us *UserService) DeleteUser(ctx context.Context, id int64) (err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	err = us.repo.DeleteUser(ctx, txSession, id)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	func (us *UserService) GetUsersByFilter(
	
	ctx context.Context,
	
	filter domain.UserFilter,
	
	page int,
	
	limit int,
	
	) (users []*domain.UserViewModel, totalCount int64, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	if page < 1 {
	
	page = 1
	
	}
	
	if limit < 1 {
	
	limit = 10
	
	} else if limit > 100 {
	
	limit = 100
	
	}
	
	
	
	offset := (page - 1) * limit
	
	
	
	users, totalCount, err = us.repo.GetUsersByFilter(ctx, db, filter, limit, offset)
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	return users, totalCount, nil
	
	}
	
	
	
	func (s *UserService) ChangeUserState(ctx context.Context, userID int64,
	
	targetState domain.UserState) (err error) {
	
	db, err := s.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = s.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if userID < 1 {
	
	return errors.New(msg.ErrDataIsNotValid)
	
	}
	
	
	
	if !domain.IsUserStateValid(targetState) {
	
	return errors.New(msg.ErrUserStateIsNotValid)
	
	}
	
	
	
	user, err := s.repo.GetUserByID(ctx, txSession, userID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	if user.State == targetState {
	
	return nil
	
	}
	
	
	
	user.State = targetState
	
	_, err = s.repo.UpdateUser(ctx, txSession, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (us *UserService) UpdateShop(ctx context.Context, shop *domain.User) (err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if shop.ID < 1 {
	
	return errors.New(msg.ErrDataIsNotValid)
	
	}
	
	
	
	err = validatePhoneNumber(shop.ShopPhone1)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	err = validatePhoneNumber(shop.ShopPhone2)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	err = validatePhoneNumber(shop.ShopPhone3)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	originalUser, err := us.repo.GetUserByID(ctx, txSession, shop.ID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	if originalUser.Role != domain.Wholesaler {
	
	return errors.New(msg.ErrOnlyWholesalerCanUpdateShop)
	
	}
	
	
	
	err = us.repo.UpdateShop(ctx, txSession, shop)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (us *UserService) AddNewUser(ctx context.Context, user *domain.User) (id int64, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if user.ID != 0 {
	
	err = errors.New(msg.ErrDataIsNotValid)
	
	return err
	
	}
	
	
	
	err = validateNewUser(ctx, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	if user.Role == domain.SuperAdmin || user.Role == domain.Admin {
	
	return errors.New(msg.ErrNewUserRoleShouldBeRetailerOrWholesaler)
	
	}
	
	
	
	user.State = domain.NewUser
	
	id, err = us.repo.CreateUser(ctx, txSession, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return id, nil
	
	}
	
	
	
	func (us *UserService) AddNewAdmin(ctx context.Context, user *domain.User) (id int64, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if user.ID != 0 {
	
	err = errors.New(msg.ErrDataIsNotValid)
	
	return err
	
	}
	
	
	
	user.Role = domain.Admin
	
	user.State = domain.ApprovedUser
	
	
	
	err = validateNewUser(ctx, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	id, err = us.repo.CreateUser(ctx, txSession, user)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	err = us.repo.CreateAdminAccess(ctx, txSession, id)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return id, nil
	
	}
	
	
	
	func (us *UserService) DeleteAdmin(ctx context.Context, adminID int64) (err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	err = us.repo.DeleteUser(ctx, txSession, adminID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	func (us *UserService) GetUserSubscriptionsWithCity(ctx context.Context, userID int64) ([]domain.UserSubscriptionWithCity, error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return nil, err
	
	}
	
	return us.repo.GetUserSubscriptionsWithCity(ctx, db, userID)
	
	}
	
	
	
	func (us *UserService) FetchUserInfo(ctx context.Context, id int64) (
	
	user *domain.User, adminAccessInfo *domain.AdminAccess, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	user, err = us.repo.GetUserByID(ctx, txSession, id)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	adminAccessInfo, err = us.repo.GetAdminAccess(ctx, txSession, user.ID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, adminAccessInfo, nil
	
	}
	
	
	
	func (us *UserService) UpdateDollarPrice(ctx context.Context, currentUserID int64,
	
	dollarPrice decimal.NullDecimal) (err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if currentUserID < 1 {
	
	return errors.New(msg.ErrDataIsNotValid)
	
	}
	
	
	
	originalShop, err := us.GetUserByID(ctx, currentUserID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	originalShop.DollarPrice = dollarPrice
	
	err = us.repo.UpdateDollarPrice(ctx, txSession, originalShop)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (us *UserService) GetAdminAccess(ctx context.Context, adminID int64) (
	
	adminAccess *domain.AdminAccess, err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	access, err := us.repo.GetAdminAccess(ctx, txSession, adminID)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	adminAccess = access
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return
	
	}
	
	
	
	func (us *UserService) UpdateAdminAccess(ctx context.Context, adminAccess *domain.AdminAccess) (
	
	err error) {
	
	db, err := us.dbms.NewDB(ctx)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if adminAccess.UserID < 1 {
	
	return errors.New(msg.ErrDataIsNotValid)
	
	}
	
	
	
	err := us.repo.UpdateAdminAccess(ctx, txSession, adminAccess)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func validateNewUser(_ context.Context, user *domain.User) error {
	
	match := mobilePhoneNumberRegex.MatchString(user.Phone)
	
	if !match {
	
	return errors.New(msg.ErrPhoneIsNotValid)
	
	}
	
	
	
	if user.CityID < 1 {
	
	return errors.New(msg.ErrUserCityCannotBeEmpty)
	
	}
	
	
	
	if valid := domain.IsUserRoleValid(user.Role); !valid {
	
	return errors.New(msg.ErrUserRoleIsNotValid)
	
	}
	
	
	
	if user.FullName == "" {
	
	return errors.New(msg.ErrUserFullNameCannotBeEmpty)
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func validateUserChangeState(_ context.Context, user *domain.User, targetState domain.UserState) (
	
	err error) {
	
	isValid := true
	
	
	
	switch targetState {
	
	case domain.ApprovedUser:
	
	if user.State != domain.NewUser &&
	
	user.State != domain.InactiveAccount &&
	
	user.State != domain.InactiveShop {
	
	isValid = false
	
	}
	
	break
	
	case domain.RejectedUser:
	
	if user.State != domain.NewUser {
	
	isValid = false
	
	}
	
	break
	
	case domain.InactiveAccount:
	
	if user.State != domain.ApprovedUser {
	
	isValid = false
	
	}
	
	break
	
	case domain.InactiveShop:
	
	if user.State != domain.ApprovedUser {
	
	isValid = false
	
	}
	
	break
	
	}
	
	
	
	if !isValid {
	
	return errors.New(msg.ErrUserChangeStateIsNotValid)
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func validateExistingUser(_ context.Context, user *domain.User, originalUser *domain.User) error {
	
	if originalUser.Role == domain.SuperAdmin || originalUser.Role == domain.Admin {
	
	return nil
	
	}
	
	
	
	if originalUser.State == domain.InactiveAccount ||
	
	originalUser.State == domain.InactiveShop ||
	
	originalUser.State == domain.RejectedUser {
	
	return errors.New(msg.ErrOperationNotAllowedForThisUser)
	
	}
	
	
	
	if originalUser.State == domain.NewUser {
	
	return errors.New(msg.ErrNewUserIsNotAllowedToChangeUserInfo)
	
	}
	
	
	
	if user.Role != originalUser.Role {
	
	return errors.New(msg.ErrUpdatingUserRoleIsNotAllowed)
	
	}
	
	
	
	if user.State != originalUser.State {
	
	return errors.New(msg.ErrUpdatingUserStateIsNotAllowed)
	
	}
	
	return nil
	
	}
	
	
	
	func validatePhoneNumber(phone string) error {
	
	if phone == "" {
	
	return nil
	
	}
	
	
	
	mobileMatch := mobilePhoneNumberRegex.MatchString(phone)
	
	nonMobileMatch := nonMobilePhoneNumberRegex.MatchString(phone)
	
	if !mobileMatch && !nonMobileMatch {
	
	return errors.New(msg.ErrPhoneIsNotValid)
	
	}
	
	
	
	return nil
	
	}
	
	package service
	
	
	
	import (
	
	"context"
	
	"errors"
	
	"fmt"
	
	
	
	//"github.com/kavenegar/kavenegar-go"
	
	"github.com/nerkhin/internal/adapter/config"
	
	"github.com/nerkhin/internal/core/domain"
	
	"github.com/nerkhin/internal/core/domain/msg"
	
	"github.com/nerkhin/internal/core/port"
	
	)
	
	
	
	var STATIC_CODE = "123456"
	
	var CODE_LENGTH = 6
	
	
	
	type VerificationCodeService struct {
	
	dbms port.DBMS
	
	repo port.VerificationCodeRepository
	
	userRepo port.UserRepository
	
	appConfig config.App
	
	}
	
	
	
	func RegisterVerificationCodeService(
	
	dbms port.DBMS,
	
	repo port.VerificationCodeRepository,
	
	userRepo port.UserRepository,
	
	appConfig config.App) port.VerificationCodeService {
	
	// rand.Seed(time.Now().UnixNano()) // برای تولید کد رندوم واقعی (اگر می‌خواهید استفاده کنید)
	
	return &VerificationCodeService{
	
	dbms: dbms,
	
	repo: repo,
	
	userRepo: userRepo,
	
	appConfig: appConfig,
	
	}
	
	}
	
	
	
	func (vc *VerificationCodeService) SendVerificationCode(ctx context.Context, phone string) (codeGenerated string, err error) {
	
	db, err := vc.dbms.NewDB(ctx)
	
	if err != nil {
	
	return "", fmt.Errorf("failed to get DB session for sending code: %w", err)
	
	}
	
	
	
	user, err := vc.userRepo.GetUserByPhone(ctx, db, phone)
	
	if err != nil {
	
	if errors.Is(err, errors.New(msg.ErrRecordNotFound)) {
	
	return "", errors.New(msg.ErrUserDoesNotExist)
	
	}
	
	return "", fmt.Errorf("failed to find user by phone before sending code: %w", err)
	
	}
	
	
	
	codeGenerated = STATIC_CODE
	
	
	
	err = vc.repo.SaveVerificationCode(ctx, db, user.ID, codeGenerated)
	
	if err != nil {
	
	return "", fmt.Errorf("failed to save verification code: %w", err)
	
	}
	
	
	
	return codeGenerated, nil
	
	}
	
	
	
	func (vc *VerificationCodeService) VerifyCode(ctx context.Context, phone, code string) (
	
	user *domain.User, adminAccess *domain.AdminAccess, err error) { // <--- تغییر در مقادیر بازگشتی
	
	
	
	db, err := vc.dbms.NewDB(ctx)
	
	if err != nil {
	
	return nil, nil, fmt.Errorf("failed to get DB session for verifying code: %w", err)
	
	}
	
	
	
	err = vc.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
	
	if len(code) != CODE_LENGTH {
	
	return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
	
	}
	
	
	
	localUser, txErr := vc.userRepo.GetUserByPhone(ctx, txSession, phone)
	
	if txErr != nil {
	
	if errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) { // یا خطای استاندارد "یافت نشد" شما
	
	return errors.New(msg.ErrUserDoesNotExist)
	
	}
	
	return fmt.Errorf("error getting user by phone in transaction: %w", txErr)
	
	}
	
	user = localUser
	
	
	
	localAdminAccess, txErr := vc.userRepo.GetAdminAccess(ctx, txSession, user.ID)
	
	if txErr != nil {
	
	if !errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) {
	
	return fmt.Errorf("error getting admin access in transaction: %w", txErr)
	
	}
	
	}
	
	adminAccess = localAdminAccess
	
	
	
	savedCode, txErr := vc.repo.GetVerificationCode(ctx, txSession, user.ID)
	
	if txErr != nil {
	
	if errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) {
	
	return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
	
	}
	
	return fmt.Errorf("error getting saved verification code in transaction: %w", txErr)
	
	}
	
	
	
	if code != savedCode {
	
	return errors.New(msg.ErrCodeIsWrong)
	
	}
	
	
	
	return nil
	
	})
	
	
	
	if err != nil {
	
	return nil, nil, err
	
	}
	
	
	
	return user, adminAccess, nil
	
	}
	
	package repository
	
	
	
	import (
	
	"context"
	
	"fmt"
	
	"time"
	
	
	
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	
	"github.com/nerkhin/internal/core/domain"
	
	"gorm.io/gorm"
	
	)
	
	
	
	type UserRepository struct{}
	
	
	
	func (ur *UserRepository) CreateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	user.UpdatedAt = time.Now()
	
	err = db.Create(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Omit(
	
	"role",
	
	"created_at",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByID(ctx context.Context, dbSession interface{}, id int64) (
	
	user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	user = &domain.User{}
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	
	
	// فقط اشتراک‌های فعالِ کاربر، یک رکورد به‌ازای هر شهر (جدیدترین بر اساس expires_at)
	
	func (ur *UserRepository) GetUserSubscriptionsWithCity(
	
	ctx context.Context,
	
	dbSession interface{},
	
	userID int64,
	
	) (subs []domain.UserSubscriptionWithCity, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	// نسخه مخصوص Postgres با DISTINCT ON:
	
	// - فقط رکوردهای فعال: us.expires_at >= NOW()
	
	// - یکی به‌ازای هر شهر: DISTINCT ON (us.city_id)
	
	// - جدیدترین: ORDER BY us.city_id, us.expires_at DESC
	
	err = db.
	
	Table("user_subscription AS us").
	
	Select(`
	
	DISTINCT ON (us.city_id)
	
	us.id,
	
	us.user_id,
	
	us.city_id,
	
	c.name AS city,
	
	us.subscription_id,
	
	us.expires_at,
	
	us.created_at,
	
	us.updated_at
	
	`).
	
	Joins("LEFT JOIN city c ON c.id = us.city_id").
	
	Where("us.user_id = ? AND us.expires_at >= NOW()", userID).
	
	// توجه: ترتیب برای DISTINCT ON باید city_id اول بیاد
	
	Order("us.city_id, us.expires_at DESC").
	
	Scan(&subs).Error
	
	
	
	return
	
	}
	
	
	
	func (ur *UserRepository) GetDollarPrice(ctx context.Context, dbSession interface{}, id int64) (dollarPrice string, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Select("dollar_price").
	
	Take(&dollarPrice).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return dollarPrice, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByPhone(ctx context.Context, dbSession interface{},
	
	phone string) (user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{Phone: phone}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	func (ur *UserRepository) DeleteUser(ctx context.Context, dbSession interface{}, id int64) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	if id == 0 {
	
	return nil
	
	}
	
	
	
	err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	
	// -------------------------------------------------------
	
	// 1) پاک‌سازی همهٔ وابستگی‌ها
	
	// -------------------------------------------------------
	
	
	
	// -- Model-based (اگر مدل‌های دامنه را دارید این بخش را استفاده کنید)
	
	// محصولات ایجادشده توسط کاربر (مثلاً فیلد CreatedBy یا UserID)
	
	
	
	// پسندِ محصولات توسط کاربر
	
	
	
	// پسندِ فروشگاه‌ها توسط کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteAccount{}).Error; err != nil {
	
	return err
	
	}
	
	// تراکنش‌های مالی کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.ProductRequest{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.PaymentTransactionHistory{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.Report{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserSubscription{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	
	if err := tx.Where("id = ?", id).Delete(&domain.User{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	return err
	
	}
	
	
	
	
	
	
	
	func (ur *UserRepository) GetUsersByFilter(ctx context.Context, dbSession interface{},
	
	filter domain.UserFilter, limit int,
	
	offset int) (users []*domain.UserViewModel, totalCount int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	users = []*domain.UserViewModel{}
	
	query := db.Table("user_t AS u")
	
	countQuery := db.Table("user_t AS u")
	
	
	
	applyFilters := func(q *gorm.DB) *gorm.DB {
	
	if domain.IsUserRoleValid(filter.Role) {
	
	q = q.Where("u.role = ?", filter.Role)
	
	}
	
	if domain.IsUserStateValid(filter.State) {
	
	q = q.Where("u.state_c = ?", filter.State)
	
	}
	
	if filter.SearchText != "" {
	
	searchQuery := "%" + filter.SearchText + "%"
	
	q = q.Where("u.phone LIKE ? OR u.full_name LIKE ?", searchQuery, searchQuery)
	
	}
	
	if filter.CityID > 0 {
	
	q = q.Where("u.city_id = ?", filter.CityID)
	
	}
	
	return q
	
	}
	
	
	
	query = applyFilters(query)
	
	countQuery = applyFilters(countQuery)
	
	
	
	err = countQuery.Count(&totalCount).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	if totalCount == 0 {
	
	return users, 0, nil
	
	}
	
	
	
	err = query.
	
	Joins("JOIN city AS c ON c.id = u.city_id").
	
	Order("u.id DESC").
	
	Limit(limit).
	
	Offset(offset).
	
	Select(
	
	"u.*",
	
	"c.name AS city_name",
	
	"CASE WHEN u.state_c = 5 THEN TRUE ELSE FALSE END AS is_active",
	
	).
	
	Scan(&users).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	return users, totalCount, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateShop(ctx context.Context, dbSession interface{},
	
	user *domain.User) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	userModel, err := ur.GetUserByID(ctx, dbSession, user.ID)
	
	if err != nil {
	
	return
	
	}
	
	
	
	if user.ImageUrl == "" {
	
	user.ImageUrl = userModel.ImageUrl
	
	}
	
	
	
	err = db.Omit(
	
	"phone",
	
	"city_id",
	
	"role",
	
	"state_c",
	
	"full_name",
	
	"dollar_price",
	
	"created_at",
	
	).Select(
	
	"shop_name",
	
	"shop_address",
	
	"shop_phone1",
	
	"shop_phone2",
	
	"shop_phone3",
	
	"telegram_url",
	
	"instagram_url",
	
	"whatsapp_url",
	
	"website_url",
	
	"latitude",
	
	"longitude",
	
	"image_url",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateDollarPrice(
	
	ctx context.Context,
	
	dbSession interface{},
	
	user *domain.User,
	
	) error {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	// ====== تنظیم نام جداول/ستون‌ها مطابق دیتابیس خودت ======
	
	const (
	
	userTable = "user_t" // جدول کاربران شما
	
	upTable = "user_product" // جدول user_product(s) شما
	
	userDollarCol = "dollar_price" // 👈 نام واقعی ستون نرخ دلار در user_t (اگر ‘usd_rate’ است، همین را عوض کن)
	
	baseDollarCol = "dollar_price" // 👈 قیمت دلاری پایه هر محصول (اگر اسمش چیز دیگری است عوض کن)
	
	rialCostsCol = "other_costs" // 👈 هزینه‌های ریالی (در up)
	
	finalPriceCol = "final_price" // 👈 قیمت نهایی (در up)
	
	)
	
	
	
	return db.Transaction(func(tx *gorm.DB) error {
	
	// 1) آپدیت نرخ دلار خود کاربر
	
	if err := tx.Table(userTable).
	
	Where("id = ?", user.ID).
	
	Update(userDollarCol, user.DollarPrice).Error; err != nil {
	
	return err
	
	}
	
	
	
	// 2) بازمحاسبه قیمت همه محصولات دلاری این کاربر
	
	// final_price = (base_dollar_price * user_t.dollar) + rial_costs
	
	raw := fmt.Sprintf(`
	
	UPDATE %s AS up
	
	SET %s = (COALESCE(up.%s, 0) * u.%s) + COALESCE(up.%s, 0),
	
	updated_at = NOW()
	
	FROM %s AS u
	
	WHERE up.user_id = u.id
	
	AND up.user_id = ?
	
	AND up.is_dollar = TRUE
	
	`, upTable, finalPriceCol, baseDollarCol, userDollarCol, rialCostsCol, userTable)
	
	
	
	if err := tx.Exec(raw, user.ID).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	}
	
	
	
	func (*UserRepository) CreateAdminAccess(ctx context.Context, dbSession interface{}, userID int64) (
	
	err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	var adminAccess *domain.AdminAccess
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", userID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	if adminAccess == nil {
	
	err = db.Create(&domain.AdminAccess{
	
	UserID: userID,
	
	}).Error
	
	if err != nil {
	
	return
	
	}
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (*UserRepository) GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
	
	adminAccess *domain.AdminAccess, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", adminID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return adminAccess, nil
	
	}
	
	
	
	func (*UserRepository) UpdateAdminAccess(ctx context.Context, dbSession interface{},
	
	adminAccess *domain.AdminAccess) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Where("user_id = ?", adminAccess.UserID).
	
	Select(
	
	"save_product",
	
	"change_user_state",
	
	"change_shop_state",
	
	"change_account_state",
	
	).Updates(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	اینا فایهای سمت سرور هستن اولا اینا را بخون و بررسی کن حالا فایلهای سمت فرانت را بهت میدم package repository
	
	
	
	import (
	
	"context"
	
	"fmt"
	
	"time"
	
	
	
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	
	"github.com/nerkhin/internal/core/domain"
	
	"gorm.io/gorm"
	
	)
	
	
	
	type UserRepository struct{}
	
	
	
	func (ur *UserRepository) CreateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	user.UpdatedAt = time.Now()
	
	err = db.Create(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Omit(
	
	"role",
	
	"created_at",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByID(ctx context.Context, dbSession interface{}, id int64) (
	
	user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	user = &domain.User{}
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	
	
	// فقط اشتراک‌های فعالِ کاربر، یک رکورد به‌ازای هر شهر (جدیدترین بر اساس expires_at)
	
	func (ur *UserRepository) GetUserSubscriptionsWithCity(
	
	ctx context.Context,
	
	dbSession interface{},
	
	userID int64,
	
	) (subs []domain.UserSubscriptionWithCity, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	// نسخه مخصوص Postgres با DISTINCT ON:
	
	// - فقط رکوردهای فعال: us.expires_at >= NOW()
	
	// - یکی به‌ازای هر شهر: DISTINCT ON (us.city_id)
	
	// - جدیدترین: ORDER BY us.city_id, us.expires_at DESC
	
	err = db.
	
	Table("user_subscription AS us").
	
	Select(`
	
	DISTINCT ON (us.city_id)
	
	us.id,
	
	us.user_id,
	
	us.city_id,
	
	c.name AS city,
	
	us.subscription_id,
	
	us.expires_at,
	
	us.created_at,
	
	us.updated_at
	
	`).
	
	Joins("LEFT JOIN city c ON c.id = us.city_id").
	
	Where("us.user_id = ? AND us.expires_at >= NOW()", userID).
	
	// توجه: ترتیب برای DISTINCT ON باید city_id اول بیاد
	
	Order("us.city_id, us.expires_at DESC").
	
	Scan(&subs).Error
	
	
	
	return
	
	}
	
	
	
	func (ur *UserRepository) GetDollarPrice(ctx context.Context, dbSession interface{}, id int64) (dollarPrice string, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Select("dollar_price").
	
	Take(&dollarPrice).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return dollarPrice, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByPhone(ctx context.Context, dbSession interface{},
	
	phone string) (user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{Phone: phone}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	func (ur *UserRepository) DeleteUser(ctx context.Context, dbSession interface{}, id int64) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	if id == 0 {
	
	return nil
	
	}
	
	
	
	err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	
	// -------------------------------------------------------
	
	// 1) پاک‌سازی همهٔ وابستگی‌ها
	
	// -------------------------------------------------------
	
	
	
	// -- Model-based (اگر مدل‌های دامنه را دارید این بخش را استفاده کنید)
	
	// محصولات ایجادشده توسط کاربر (مثلاً فیلد CreatedBy یا UserID)
	
	
	
	// پسندِ محصولات توسط کاربر
	
	
	
	// پسندِ فروشگاه‌ها توسط کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteAccount{}).Error; err != nil {
	
	return err
	
	}
	
	// تراکنش‌های مالی کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.ProductRequest{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.PaymentTransactionHistory{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.Report{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserSubscription{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	
	if err := tx.Where("id = ?", id).Delete(&domain.User{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	return err
	
	}
	
	
	
	
	
	
	
	func (ur *UserRepository) GetUsersByFilter(ctx context.Context, dbSession interface{},
	
	filter domain.UserFilter, limit int,
	
	offset int) (users []*domain.UserViewModel, totalCount int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	users = []*domain.UserViewModel{}
	
	query := db.Table("user_t AS u")
	
	countQuery := db.Table("user_t AS u")
	
	
	
	applyFilters := func(q *gorm.DB) *gorm.DB {
	
	if domain.IsUserRoleValid(filter.Role) {
	
	q = q.Where("u.role = ?", filter.Role)
	
	}
	
	if domain.IsUserStateValid(filter.State) {
	
	q = q.Where("u.state_c = ?", filter.State)
	
	}
	
	if filter.SearchText != "" {
	
	searchQuery := "%" + filter.SearchText + "%"
	
	q = q.Where("u.phone LIKE ? OR u.full_name LIKE ?", searchQuery, searchQuery)
	
	}
	
	if filter.CityID > 0 {
	
	q = q.Where("u.city_id = ?", filter.CityID)
	
	}
	
	return q
	
	}
	
	
	
	query = applyFilters(query)
	
	countQuery = applyFilters(countQuery)
	
	
	
	err = countQuery.Count(&totalCount).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	if totalCount == 0 {
	
	return users, 0, nil
	
	}
	
	
	
	err = query.
	
	Joins("JOIN city AS c ON c.id = u.city_id").
	
	Order("u.id DESC").
	
	Limit(limit).
	
	Offset(offset).
	
	Select(
	
	"u.*",
	
	"c.name AS city_name",
	
	"CASE WHEN u.state_c = 5 THEN TRUE ELSE FALSE END AS is_active",
	
	).
	
	Scan(&users).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	return users, totalCount, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateShop(ctx context.Context, dbSession interface{},
	
	user *domain.User) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	userModel, err := ur.GetUserByID(ctx, dbSession, user.ID)
	
	if err != nil {
	
	return
	
	}
	
	
	
	if user.ImageUrl == "" {
	
	user.ImageUrl = userModel.ImageUrl
	
	}
	
	
	
	err = db.Omit(
	
	"phone",
	
	"city_id",
	
	"role",
	
	"state_c",
	
	"full_name",
	
	"dollar_price",
	
	"created_at",
	
	).Select(
	
	"shop_name",
	
	"shop_address",
	
	"shop_phone1",
	
	"shop_phone2",
	
	"shop_phone3",
	
	"telegram_url",
	
	"instagram_url",
	
	"whatsapp_url",
	
	"website_url",
	
	"latitude",
	
	"longitude",
	
	"image_url",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateDollarPrice(
	
	ctx context.Context,
	
	dbSession interface{},
	
	user *domain.User,
	
	) error {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	// ====== تنظیم نام جداول/ستون‌ها مطابق دیتابیس خودت ======
	
	const (
	
	userTable = "user_t" // جدول کاربران شما
	
	upTable = "user_product" // جدول user_product(s) شما
	
	userDollarCol = "dollar_price" // 👈 نام واقعی ستون نرخ دلار در user_t (اگر ‘usd_rate’ است، همین را عوض کن)
	
	baseDollarCol = "dollar_price" // 👈 قیمت دلاری پایه هر محصول (اگر اسمش چیز دیگری است عوض کن)
	
	rialCostsCol = "other_costs" // 👈 هزینه‌های ریالی (در up)
	
	finalPriceCol = "final_price" // 👈 قیمت نهایی (در up)
	
	)
	
	
	
	return db.Transaction(func(tx *gorm.DB) error {
	
	// 1) آپدیت نرخ دلار خود کاربر
	
	if err := tx.Table(userTable).
	
	Where("id = ?", user.ID).
	
	Update(userDollarCol, user.DollarPrice).Error; err != nil {
	
	return err
	
	}
	
	
	
	// 2) بازمحاسبه قیمت همه محصولات دلاری این کاربر
	
	// final_price = (base_dollar_price * user_t.dollar) + rial_costs
	
	raw := fmt.Sprintf(`
	
	UPDATE %s AS up
	
	SET %s = (COALESCE(up.%s, 0) * u.%s) + COALESCE(up.%s, 0),
	
	updated_at = NOW()
	
	FROM %s AS u
	
	WHERE up.user_id = u.id
	
	AND up.user_id = ?
	
	AND up.is_dollar = TRUE
	
	`, upTable, finalPriceCol, baseDollarCol, userDollarCol, rialCostsCol, userTable)
	
	
	
	if err := tx.Exec(raw, user.ID).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	}
	
	
	
	func (*UserRepository) CreateAdminAccess(ctx context.Context, dbSession interface{}, userID int64) (
	
	err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	var adminAccess *domain.AdminAccess
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", userID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	if adminAccess == nil {
	
	err = db.Create(&domain.AdminAccess{
	
	UserID: userID,
	
	}).Error
	
	if err != nil {
	
	return
	
	}
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (*UserRepository) GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
	
	adminAccess *domain.AdminAccess, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", adminID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return adminAccess, nil
	
	}
	
	
	
	func (*UserRepository) UpdateAdminAccess(ctx context.Context, dbSession interface{},
	
	adminAccess *domain.AdminAccess) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Where("user_id = ?", adminAccess.UserID).
	
	Select(
	
	"save_product",
	
	"change_user_state",
	
	"change_shop_state",
	
	"change_account_state",
	
	).Updates(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	package repository
	
	
	
	import (
	
	"context"
	
	"fmt"
	
	"time"
	
	
	
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	
	"github.com/nerkhin/internal/core/domain"
	
	"gorm.io/gorm"
	
	)
	
	
	
	type UserRepository struct{}
	
	
	
	func (ur *UserRepository) CreateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	user.UpdatedAt = time.Now()
	
	err = db.Create(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateUser(ctx context.Context, dbSession interface{},
	
	user *domain.User) (id int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Omit(
	
	"role",
	
	"created_at",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	id = user.ID
	
	return id, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByID(ctx context.Context, dbSession interface{}, id int64) (
	
	user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	user = &domain.User{}
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	
	
	// فقط اشتراک‌های فعالِ کاربر، یک رکورد به‌ازای هر شهر (جدیدترین بر اساس expires_at)
	
	func (ur *UserRepository) GetUserSubscriptionsWithCity(
	
	ctx context.Context,
	
	dbSession interface{},
	
	userID int64,
	
	) (subs []domain.UserSubscriptionWithCity, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	// نسخه مخصوص Postgres با DISTINCT ON:
	
	// - فقط رکوردهای فعال: us.expires_at >= NOW()
	
	// - یکی به‌ازای هر شهر: DISTINCT ON (us.city_id)
	
	// - جدیدترین: ORDER BY us.city_id, us.expires_at DESC
	
	err = db.
	
	Table("user_subscription AS us").
	
	Select(`
	
	DISTINCT ON (us.city_id)
	
	us.id,
	
	us.user_id,
	
	us.city_id,
	
	c.name AS city,
	
	us.subscription_id,
	
	us.expires_at,
	
	us.created_at,
	
	us.updated_at
	
	`).
	
	Joins("LEFT JOIN city c ON c.id = us.city_id").
	
	Where("us.user_id = ? AND us.expires_at >= NOW()", userID).
	
	// توجه: ترتیب برای DISTINCT ON باید city_id اول بیاد
	
	Order("us.city_id, us.expires_at DESC").
	
	Scan(&subs).Error
	
	
	
	return
	
	}
	
	
	
	func (ur *UserRepository) GetDollarPrice(ctx context.Context, dbSession interface{}, id int64) (dollarPrice string, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{ID: id}).
	
	Select("dollar_price").
	
	Take(&dollarPrice).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return dollarPrice, nil
	
	}
	
	
	
	func (ur *UserRepository) GetUserByPhone(ctx context.Context, dbSession interface{},
	
	phone string) (user *domain.User, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.User{}).
	
	Where(&domain.User{Phone: phone}).
	
	Take(&user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return user, nil
	
	}
	
	func (ur *UserRepository) DeleteUser(ctx context.Context, dbSession interface{}, id int64) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	if id == 0 {
	
	return nil
	
	}
	
	
	
	err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
	
	// -------------------------------------------------------
	
	// 1) پاک‌سازی همهٔ وابستگی‌ها
	
	// -------------------------------------------------------
	
	
	
	// -- Model-based (اگر مدل‌های دامنه را دارید این بخش را استفاده کنید)
	
	// محصولات ایجادشده توسط کاربر (مثلاً فیلد CreatedBy یا UserID)
	
	
	
	// پسندِ محصولات توسط کاربر
	
	
	
	// پسندِ فروشگاه‌ها توسط کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteAccount{}).Error; err != nil {
	
	return err
	
	}
	
	// تراکنش‌های مالی کاربر
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.ProductRequest{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserProduct{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.PaymentTransactionHistory{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.Report{}).Error; err != nil {
	
	return err
	
	}
	
	if err := tx.Where("user_id = ?", id).Delete(&domain.UserSubscription{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	
	if err := tx.Where("id = ?", id).Delete(&domain.User{}).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	
	
	return err
	
	}
	
	
	
	
	
	
	
	func (ur *UserRepository) GetUsersByFilter(ctx context.Context, dbSession interface{},
	
	filter domain.UserFilter, limit int,
	
	offset int) (users []*domain.UserViewModel, totalCount int64, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	users = []*domain.UserViewModel{}
	
	query := db.Table("user_t AS u")
	
	countQuery := db.Table("user_t AS u")
	
	
	
	applyFilters := func(q *gorm.DB) *gorm.DB {
	
	if domain.IsUserRoleValid(filter.Role) {
	
	q = q.Where("u.role = ?", filter.Role)
	
	}
	
	if domain.IsUserStateValid(filter.State) {
	
	q = q.Where("u.state_c = ?", filter.State)
	
	}
	
	if filter.SearchText != "" {
	
	searchQuery := "%" + filter.SearchText + "%"
	
	q = q.Where("u.phone LIKE ? OR u.full_name LIKE ?", searchQuery, searchQuery)
	
	}
	
	if filter.CityID > 0 {
	
	q = q.Where("u.city_id = ?", filter.CityID)
	
	}
	
	return q
	
	}
	
	
	
	query = applyFilters(query)
	
	countQuery = applyFilters(countQuery)
	
	
	
	err = countQuery.Count(&totalCount).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	if totalCount == 0 {
	
	return users, 0, nil
	
	}
	
	
	
	err = query.
	
	Joins("JOIN city AS c ON c.id = u.city_id").
	
	Order("u.id DESC").
	
	Limit(limit).
	
	Offset(offset).
	
	Select(
	
	"u.*",
	
	"c.name AS city_name",
	
	"CASE WHEN u.state_c = 5 THEN TRUE ELSE FALSE END AS is_active",
	
	).
	
	Scan(&users).Error
	
	if err != nil {
	
	return nil, 0, err
	
	}
	
	
	
	return users, totalCount, nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateShop(ctx context.Context, dbSession interface{},
	
	user *domain.User) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	userModel, err := ur.GetUserByID(ctx, dbSession, user.ID)
	
	if err != nil {
	
	return
	
	}
	
	
	
	if user.ImageUrl == "" {
	
	user.ImageUrl = userModel.ImageUrl
	
	}
	
	
	
	err = db.Omit(
	
	"phone",
	
	"city_id",
	
	"role",
	
	"state_c",
	
	"full_name",
	
	"dollar_price",
	
	"created_at",
	
	).Select(
	
	"shop_name",
	
	"shop_address",
	
	"shop_phone1",
	
	"shop_phone2",
	
	"shop_phone3",
	
	"telegram_url",
	
	"instagram_url",
	
	"whatsapp_url",
	
	"website_url",
	
	"latitude",
	
	"longitude",
	
	"image_url",
	
	).Updates(user).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (ur *UserRepository) UpdateDollarPrice(
	
	ctx context.Context,
	
	dbSession interface{},
	
	user *domain.User,
	
	) error {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return err
	
	}
	
	
	
	// ====== تنظیم نام جداول/ستون‌ها مطابق دیتابیس خودت ======
	
	const (
	
	userTable = "user_t" // جدول کاربران شما
	
	upTable = "user_product" // جدول user_product(s) شما
	
	userDollarCol = "dollar_price" // 👈 نام واقعی ستون نرخ دلار در user_t (اگر ‘usd_rate’ است، همین را عوض کن)
	
	baseDollarCol = "dollar_price" // 👈 قیمت دلاری پایه هر محصول (اگر اسمش چیز دیگری است عوض کن)
	
	rialCostsCol = "other_costs" // 👈 هزینه‌های ریالی (در up)
	
	finalPriceCol = "final_price" // 👈 قیمت نهایی (در up)
	
	)
	
	
	
	return db.Transaction(func(tx *gorm.DB) error {
	
	// 1) آپدیت نرخ دلار خود کاربر
	
	if err := tx.Table(userTable).
	
	Where("id = ?", user.ID).
	
	Update(userDollarCol, user.DollarPrice).Error; err != nil {
	
	return err
	
	}
	
	
	
	// 2) بازمحاسبه قیمت همه محصولات دلاری این کاربر
	
	// final_price = (base_dollar_price * user_t.dollar) + rial_costs
	
	raw := fmt.Sprintf(`
	
	UPDATE %s AS up
	
	SET %s = (COALESCE(up.%s, 0) * u.%s) + COALESCE(up.%s, 0),
	
	updated_at = NOW()
	
	FROM %s AS u
	
	WHERE up.user_id = u.id
	
	AND up.user_id = ?
	
	AND up.is_dollar = TRUE
	
	`, upTable, finalPriceCol, baseDollarCol, userDollarCol, rialCostsCol, userTable)
	
	
	
	if err := tx.Exec(raw, user.ID).Error; err != nil {
	
	return err
	
	}
	
	
	
	return nil
	
	})
	
	}
	
	
	
	func (*UserRepository) CreateAdminAccess(ctx context.Context, dbSession interface{}, userID int64) (
	
	err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	var adminAccess *domain.AdminAccess
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", userID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	if adminAccess == nil {
	
	err = db.Create(&domain.AdminAccess{
	
	UserID: userID,
	
	}).Error
	
	if err != nil {
	
	return
	
	}
	
	}
	
	
	
	return nil
	
	}
	
	
	
	func (*UserRepository) GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
	
	adminAccess *domain.AdminAccess, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Model(&domain.AdminAccess{}).
	
	Where("user_id = ?", adminID).
	
	Scan(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}
	
	
	
	return adminAccess, nil
	
	}
	
	
	
	func (*UserRepository) UpdateAdminAccess(ctx context.Context, dbSession interface{},
	
	adminAccess *domain.AdminAccess) (err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	
	if err != nil {
	
	return
	
	}
	
	
	
	err = db.Where("user_id = ?", adminAccess.UserID).
	
	Select(
	
	"save_product",
	
	"change_user_state",
	
	"change_shop_state",
	
	"change_account_state",
	
	).Updates(&adminAccess).Error
	
	if err != nil {
	
	return
	
	}