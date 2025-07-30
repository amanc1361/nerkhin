package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type ProductRequestHandler struct {
	service      port.ProductRequestService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterProductRequestHandler(service port.ProductRequestService,
	tokenService port.TokenService, appConfig config.App) *ProductRequestHandler {
	return &ProductRequestHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createProductRequestRequest struct {
	Description string `json:"description"`
}

type createProductRequestResponse struct {
	ID int64 `json:"id"`
}

func (prh *ProductRequestHandler) Create(c *gin.Context) {
	var req createProductRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, prh.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	userID := authPayload.UserID

	ctx := c.Request.Context()
	request := &domain.ProductRequest{
		UserID:      userID,
		Description: req.Description,
		State:       domain.NewRequest,
	}

	id, err := prh.service.CreateProductRequest(ctx, request)
	if err != nil {
		HandleError(c, err, prh.AppConfig.Lang)
		return
	}

	resp := createProductRequestResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type fetchProductRequestRequest struct {
	ID int64 `uri:"id"`
}

func (prh *ProductRequestHandler) Fetch(c *gin.Context) {
	var req fetchProductRequestRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, prh.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)
	userID := authPayload.UserID

	ctx := c.Request.Context()
	productRequest, err := prh.service.GetProductRequestByID(ctx, req.ID, userID)
	if err != nil {
		HandleError(c, err, prh.AppConfig.Lang)
		return
	}

	handleSuccess(c, productRequest)
}

type deleteProductRequestRequest struct {
	Ids []int64 `json:"ids"`
}

func (prh *ProductRequestHandler) Delete(c *gin.Context) {
	var req deleteProductRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, prh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := prh.service.DeleteProductRequest(ctx, req.Ids)
	if err != nil {
		HandleError(c, err, prh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func (prh *ProductRequestHandler) FetchAll(c *gin.Context) {
	ctx := c.Request.Context()

	allProductRequests, err := prh.service.GetAllProductRequests(ctx)
	if err != nil {
		HandleError(c, err, prh.AppConfig.Lang)
		return
	}

	handleSuccess(c, allProductRequests)
}

type markAsCheckedRequest struct {
	ProductRequestID int64 `json:"productRequestId"`
}

func (prh *ProductRequestHandler) MarkAsChecked(c *gin.Context) {
	var req markAsCheckedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, prh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := prh.service.MarkProductRequestAsChecked(ctx, req.ProductRequestID)
	if err != nil {
		HandleError(c, err, prh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}
