package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type UserSubscriptionHandler struct {
	service      port.UserSubscriptionService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterUserSubscriptionHandler(service port.UserSubscriptionService,
	tokenService port.TokenService, appConfig config.App) *UserSubscriptionHandler {
	return &UserSubscriptionHandler{
		service,
		tokenService,
		appConfig,
	}
}

type fetchPaymentGatewayInfoRequest struct {
	CityID         int64  `json:"cityId"`
	SubscriptionID int64  `json:"subscriptionId"`
	CallBackUrl    string `json:"callBackUrl"`
}

func (ush *UserSubscriptionHandler) FetchPaymentGatewayInfo(c *gin.Context) {
	var req fetchPaymentGatewayInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, ush.AppConfig.Lang)
		return
	}
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	config := &domain.PaymentConfig{
		CurrentUserID:  currentUserId,
		CityID:         req.CityID,
		SubscriptionID: req.SubscriptionID,
		CallBackUrl:    req.CallBackUrl,
	}

	ctx := c.Request.Context()
	gatewayInfo, err := ush.service.FetchPaymentGatewayInfo(ctx, config)
	if err != nil {
		HandleError(c, err, ush.AppConfig.Lang)
		return
	}

	handleSuccess(c, gatewayInfo)
}

type createUserSubscriptionRequest struct {
	Authority string `json:"authority"`
}

type createUserSubscriptionResponse struct {
	ID int64 `json:"id"`
}

func (ush *UserSubscriptionHandler) Create(c *gin.Context) {
	var req createUserSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, ush.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	id, err := ush.service.CreateUserSubscription(ctx, currentUserId, req.Authority)
	if err != nil {
		HandleError(c, err, ush.AppConfig.Lang)
		return
	}

	resp := createUserSubscriptionResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type fetchUserSubscriptionRequest struct {
	CityID int64 `uri:"cityId"`
}

func (ush *UserSubscriptionHandler) Fetch(c *gin.Context) {
	var req fetchUserSubscriptionRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, ush.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	userId := authPayload.UserID
	cityId := req.CityID

	ctx := c.Request.Context()
	subs, err := ush.service.GetUserSubscriptionsByCityID(ctx, userId, cityId)
	if err != nil {
		HandleError(c, err, ush.AppConfig.Lang)
		return
	}

	handleSuccess(c, subs)
}

func (ush *UserSubscriptionHandler) FetchPaymentTransactionsHistory(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	paymentTransactions, err := ush.service.FetchUserPaymentTransactionsHistory(ctx, currentUserId)
	if err != nil {
		HandleError(c, err, ush.AppConfig.Lang)
		return
	}

	handleSuccess(c, paymentTransactions)
}

func (ush *UserSubscriptionHandler) FetchUserSubscription(c *gin.Context) {
	authPayload := httputil.GetAuthPayload(c)
	currentUserId := authPayload.UserID

	ctx := c.Request.Context()
	userSubscriptions, err := ush.service.FetchUserSubscriptionList(ctx, currentUserId)
	if err != nil {
		HandleError(c, err, ush.AppConfig.Lang)
		return
	}

	handleSuccess(c, userSubscriptions)
}
