package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
)

type UserProductHandler struct {
	service      port.UserProductService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterUserProductHandler(service port.UserProductService, tokenService port.TokenService,
	appConfig config.App) *UserProductHandler {
	return &UserProductHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createUserProductRequest struct {
	ProductID   int64  `json:"productId"`
	CategoryID  int64  `json:"categoryId"`
	BrandID     int64  `json:"brandId"`
	IsDollar    bool   `json:"isDollar"`
	DollarPrice string `json:"dollarPrice"`
	OtherCosts  string `json:"otherCosts"`
	FinalPrice  string `json:"finalPrice"`
}

type createUserProductResponse struct {
	ID int64 `json:"id" example:"1"`
}

func (uph *UserProductHandler) Create(c *gin.Context) {
	var req createUserProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	if req.DollarPrice == "" {
		req.DollarPrice = "0"
	}
	dollarPriceDecimal, err := decimal.NewFromString(req.DollarPrice)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	if req.OtherCosts == "" {
		req.OtherCosts = "0"
	}
	otherCostsDecimal, err := decimal.NewFromString(req.OtherCosts)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	if req.FinalPrice == "" {
		req.FinalPrice = "0"
	}
	finalPrice, err := decimal.NewFromString(req.FinalPrice)
	if err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	category := &domain.UserProduct{
		ProductID:  req.ProductID,
		UserID:     authPayload.UserID,
		CategoryID: req.CategoryID,
		BrandID:    req.BrandID,
		IsDollar:   req.IsDollar,
		DollarPrice: decimal.NullDecimal{
			Decimal: dollarPriceDecimal,
			Valid:   !dollarPriceDecimal.IsZero(),
		},
		OtherCosts: decimal.NullDecimal{
			Decimal: otherCostsDecimal,
			Valid:   !otherCostsDecimal.IsZero(),
		},
		FinalPrice: finalPrice,
	}

	id, err := uph.service.CreateUserProduct(ctx, category)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	resp := createUserProductResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

func (uph *UserProductHandler) FetchShopProducts(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	products, err := uph.service.FetchShopProducts(ctx, currentUserID, currentUserID, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, products)
}

type changeUserProductOrderRequest struct {
	TopProductID    int64 `json:"topProductId"`
	BottomProductID int64 `json:"bottomProductId"`
}

func (uph *UserProductHandler) ChangeOrder(c *gin.Context) {
	var req changeUserProductOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	err := uph.service.ChangeOrder(ctx, currentUserID, req.TopProductID, req.BottomProductID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, err)
}

type fetchProductsByFilterRequest struct {
	CategoryID int64  `json:"categoryId"`
	SearchText string `json:"searchText"`
}

func (uph *UserProductHandler) FetchProductsByFilter(c *gin.Context) {
	var req fetchProductsByFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	products, err := uph.service.GetProductsByFilter(ctx, currentUserId, &domain.UserProductFilter{
		CategoryID: req.CategoryID,
		SearchText: req.SearchText,
	})
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, products)
}

type fetchShopsRequest struct {
	ProductID int64 `uri:"productId"`
}

func (uph *UserProductHandler) FetchShops(c *gin.Context) {
	var req fetchShopsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	shops, err := uph.service.FetchRelatedShopProducts(ctx, req.ProductID, currentUserId)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, shops)
}

func (uph *UserProductHandler) FetchPriceList(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	priceList, err := uph.service.GetPriceList(ctx, currentUserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, priceList)
}

type fetchShopByUserIdRequest struct {
	UserID int64 `uri:"uid"`
}

func (uph *UserProductHandler) FetchShopByUserId(c *gin.Context) {
	var req fetchShopByUserIdRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserID := authPayload.UserID

	ctx := c.Request.Context()
	priceList, err := uph.service.FetchShopProducts(ctx, currentUserID, req.UserID, req.UserID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, priceList)
}

type updateUserProductRequest struct {
	ID          int64  `json:"id"`
	IsDollar    bool   `json:"isDollar"`
	DollarPrice string `json:"dollarPrice"`
	OtherCosts  string `json:"otherCosts"`
	FinalPrice  string `json:"finalPrice"`
}

func (uph *UserProductHandler) Update(c *gin.Context) {
	var req updateUserProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	userProduct := &domain.UserProduct{
		ID:       req.ID,
		UserID:   authPayload.UserID,
		IsDollar: req.IsDollar,
	}

	dollarPrice := decimal.NullDecimal{Valid: false}
	if req.DollarPrice != "" {
		dollarPriceDecimal, err := decimal.NewFromString(req.DollarPrice)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		dollarPrice.Decimal = dollarPriceDecimal
		dollarPrice.Valid = true
	}

	otherCostsPrice := decimal.NullDecimal{Valid: false}
	if req.OtherCosts != "" {
		otherCostsDecimal, err := decimal.NewFromString(req.OtherCosts)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		otherCostsPrice.Decimal = otherCostsDecimal
		otherCostsPrice.Valid = true
	}

	finalPrice := decimal.NullDecimal{Valid: false}
	if req.FinalPrice != "" {
		finalPriceDecimal, err := decimal.NewFromString(req.FinalPrice)
		if err != nil {
			validationError(c, err, uph.AppConfig.Lang)
			return
		}

		finalPrice.Decimal = finalPriceDecimal
		finalPrice.Valid = true
	}

	if dollarPrice.Valid {
		userProduct.DollarPrice = dollarPrice
	}

	if otherCostsPrice.Valid {
		userProduct.OtherCosts = otherCostsPrice
	}

	if finalPrice.Valid {
		userProduct.FinalPrice = finalPrice.Decimal
	}

	ctx := c.Request.Context()

	err := uph.service.UpdateUserProduct(ctx, userProduct)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchUserProductByIdRequest struct {
	UpID int64 `uri:"upId" example:"1"`
}

func (uph *UserProductHandler) Fetch(c *gin.Context) {
	var req fetchUserProductByIdRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	userProduct, err := uph.service.FetchUserProductById(ctx, req.UpID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, userProduct)
}

type deleteUserProductByIdRequest struct {
	Id int64 `uri:"id" binding:"required"`
}

func (uph *UserProductHandler) Delete(c *gin.Context) {
	var req deleteUserProductByIdRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := uph.service.BatchDeleteUserProduct(ctx, req.Id)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type changeVisibilityStatusRequest struct {
	UserProductID int64 `json:"userProductId"`
}

func (uph *UserProductHandler) ChangeVisibilityStatus(c *gin.Context) {
	var req changeVisibilityStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, uph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := uph.service.ChangeVisibilityStatus(ctx, req.UserProductID)
	if err != nil {
		HandleError(c, err, uph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}
