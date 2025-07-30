package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type FavoriteProductHandler struct {
	service      port.FavoriteProductService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterFavoriteProductHandler(service port.FavoriteProductService, tokenService port.TokenService,
	appConfig config.App) *FavoriteProductHandler {
	return &FavoriteProductHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createFavoriteProductRequest struct {
	ProductID int64 `json:"productId"`
}

type createFavoriteProductResponse struct {
	ID int64 `json:"id"`
}

func (fph *FavoriteProductHandler) Create(c *gin.Context) {
	var req createFavoriteProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, fph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	favoriteProduct := &domain.FavoriteProduct{
		UserID:    authPayload.UserID,
		ProductID: req.ProductID,
	}

	ctx := c.Request.Context()
	id, err := fph.service.CreateFavoriteProduct(ctx, favoriteProduct)
	if err != nil {
		HandleError(c, err, fph.AppConfig.Lang)
		return
	}

	resp := createFavoriteProductResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type deleteFavoriteProductRequest struct {
	ProductIDs []int64 `json:"productIds"`
}

func (fph *FavoriteProductHandler) Delete(c *gin.Context) {
	var req deleteFavoriteProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, fph.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	userID := authPayload.UserID

	ctx := c.Request.Context()
	err := fph.service.BatchDeleteFavoriteProducts(ctx, userID, req.ProductIDs)
	if err != nil {
		HandleError(c, err, fph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func (fph *FavoriteProductHandler) GetFavoriteProducts(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	favoriteProducts, err := fph.service.GetFavoriteProducts(ctx, currentUserId)
	if err != nil {
		HandleError(c, err, fph.AppConfig.Lang)
		return
	}

	handleSuccess(c, favoriteProducts)
}
