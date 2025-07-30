package handler

import (
	"encoding/json"

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

type registerUserResponse struct{}

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

	_, err := uh.service.RegisterUser(ctx, &user)
	if err != nil {
		HandleError(ctx, err, uh.AppConfig.Lang)
		return
	}

	rsp := &registerUserResponse{}

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

type deleteUsersRequest struct {
	Ids []int64 `json:"ids" example:"[1, 2]"`
}

func (uh *UserHandler) BatchDelete(ctx *gin.Context) {
	var req deleteUsersRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		validationError(ctx, err, uh.AppConfig.Lang)
		return
	}

	err := uh.service.BatchDeleteUsers(ctx, req.Ids)
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
	Page       int             `json:"page"`  
	Limit      int             `json:"limit"` 
}
type fetchUsersByFilterResponse struct {
	Users      []*domain.UserViewModel `json:"users"`
	TotalCount int64                   `json:"totalCount"`
}

// func (uh *UserHandler) FetchUsersByFilter(c *gin.Context) {
// 	var req fetchUsersByFilterRequest
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		validationError(c, err, uh.AppConfig.Lang)
// 		return
// 	}

// 	ctx := c.Request.Context()

// 	users, err := uh.service.GetUsersByFilter(ctx, domain.UserFilter{
// 		Role:       domain.UserRole(req.Role),
// 		State:      domain.UserState(req.State),
// 		SearchText: req.SearchText,
// 		CityID:     req.CityID,
// 	})
// 	if err != nil {
// 		HandleError(c, err, uh.AppConfig.Lang)
// 		return
// 	}

// 	handleSuccess(c, users)
// }

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

	handleSuccess(c,  responsePayload)
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
	var req updateShopRequest
	jsonData := c.PostForm("data")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, uh.AppConfig.Lang)
		return
	}

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

	imageFileNames, err := saveAndGetImageFileNames(c, "images",
		uh.AppConfig.ImageBasePath, USER_IMAGES_LIMIT)
	if err != nil {
		return
	}

	if len(imageFileNames) > 0 {
		shop.ImageUrl = imageFileNames[0]
	}

	ctx := c.Request.Context()
	err = uh.service.UpdateShop(ctx, shop)
	if err != nil {
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

type fetchUserInfoResponse struct {
	domain.User
	AdminAccessInfo *domain.AdminAccess
}

func (uh *UserHandler) FetchUserInfo(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	UserId := authPayload.UserID

	ctx := c.Request.Context()
	fetchedUser, adminAccessInfo, err := uh.service.FetchUserInfo(ctx, UserId)
	if err != nil {
		HandleError(c, err, uh.AppConfig.Lang)
		return
	}

	response := &fetchUserInfoResponse{
		*fetchedUser,
		adminAccessInfo,
	}

	handleSuccess(c, response)
}

type updateDollarPriceRequest struct {
	DollarPrice string `json:"dollarPrice"`
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
		Valid:   !dollarPriceDecimal.IsZero(),
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
	SaveProduct        bool `json:"saveProduct"`
	ChangeUserState    bool `json:"changeUserState"`
	ChangeShopState    bool `json:"changeShopState"`
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
