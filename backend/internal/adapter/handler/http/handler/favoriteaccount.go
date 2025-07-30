package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type FavoriteAccountHandler struct {
	service      port.FavoriteAccountService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterFavoriteAccountHandler(service port.FavoriteAccountService, tokenService port.TokenService,
	appConfig config.App) *FavoriteAccountHandler {
	return &FavoriteAccountHandler{
		service,
		tokenService,
		appConfig,
	}
}

type saveFavoriteAccountRequest struct {
	TargetUserID int64 `json:"targetUserId" example:"1"`
}

type saveFavoriteAccountResponse struct {
	ID int64 `json:"id" example:"1"`
}

func (fph *FavoriteAccountHandler) Create(c *gin.Context) {
	var req saveFavoriteAccountRequest

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, fph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	brand := &domain.FavoriteAccount{
		UserID:       currentUserId,
		TargetUserID: req.TargetUserID,
	}

	id, err := fph.service.CreateFavoriteAccount(ctx, brand)
	if err != nil {
		HandleError(c, err, fph.AppConfig.Lang)
		return
	}

	resp := saveFavoriteAccountResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type deleteFavoriteAccountRequest struct {
	Ids []int64 `json:"ids"`
}

func (fph *FavoriteAccountHandler) Delete(c *gin.Context) {
	var req deleteFavoriteAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, fph.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	currentUserID := httputil.GetAuthPayload(c).UserID

	err := fph.service.DeleteFavoriteAccount(ctx, currentUserID, req.Ids)
	if err != nil {
		HandleError(c, err, fph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func (fah *FavoriteAccountHandler) GetFavoriteAccounts(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	favoriteAccounts, err := fah.service.GetFavoriteAccounts(ctx, currentUserId)
	if err != nil {
		HandleError(c, err, fah.AppConfig.Lang)
		return
	}

	handleSuccess(c, favoriteAccounts)
}

func (fah *FavoriteAccountHandler) GetMyCustomers(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	myCustomers, err := fah.service.GetMyCustomers(ctx, currentUserId)
	if err != nil {
		HandleError(c, err, fah.AppConfig.Lang)
		return
	}

	handleSuccess(c, myCustomers)
}
