package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
)

type SubscriptionHandler struct {
	service      port.SubscriptionService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterSubscriptionHandler(service port.SubscriptionService, tokenService port.TokenService,
	appConfig config.App) *SubscriptionHandler {
	return &SubscriptionHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createSubscriptionRequest struct {
	Price        string `json:"price"`
	NumberOfDays int16  `json:"numberOfDays"`
}

type createSubscriptionResponse struct {
	ID int64 `json:"id"`
}

func (pch *SubscriptionHandler) Create(c *gin.Context) {
	var req createSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	price, err := decimal.NewFromString(req.Price)
	if err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	sub := &domain.Subscription{
		NumberOfDays: domain.SubscriptionPeriod(req.NumberOfDays),
		Price:        price,
	}

	ctx := c.Request.Context()
	id, err := pch.service.CreateSubscription(ctx, sub)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := createSubscriptionResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type updateSubscriptionRequest struct {
	ID    int64  `json:"id"`
	Price string `json:"price"`
}

func (pch *SubscriptionHandler) Update(c *gin.Context) {
	var req updateSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	price, err := decimal.NewFromString(req.Price)
	if err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	sub := &domain.Subscription{
		ID:    req.ID,
		Price: price,
	}

	ctx := c.Request.Context()
	err = pch.service.UpdateSubscription(ctx, sub)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchSubscriptionRequest struct {
	ID int64 `uri:"id" example:"1"`
}

func (pch *SubscriptionHandler) Fetch(c *gin.Context) {
	var req fetchSubscriptionRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	sub, err := pch.service.GetSubscriptionByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, sub)
}

type deleteSubscriptionRequest struct {
	Ids []int64 `json:"ids" example:"[1, 2]"`
}

func (pch *SubscriptionHandler) BatchDelete(c *gin.Context) {
	var req deleteSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := pch.service.BatchDeleteSubscriptions(ctx, req.Ids)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func (sh *SubscriptionHandler) FetchAllSubscriptions(c *gin.Context) {
	ctx := c.Request.Context()
	subscriptions, err := sh.service.GetAllSubscriptions(ctx)
	if err != nil {
		HandleError(c, err, sh.AppConfig.Lang)
		return
	}

	handleSuccess(c, subscriptions)
}
