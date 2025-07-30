package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type ProductFilterHandler struct {
	service      port.ProductFilterService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterProductFilterHandler(service port.ProductFilterService, ts port.TokenService,
	appConfig config.App) *ProductFilterHandler {
	return &ProductFilterHandler{
		service,
		ts,
		appConfig,
	}
}

type createProductFilterRequest struct {
	CategoryID  int64    `json:"categoryId"`
	Name        string   `json:"name"`
	DisplayName string   `json:"displayName"`
	Options     []string `json:"options"`
}

type createProductFilterResponse struct {
	ID int64 `json:"id"`
}

func (pfh *ProductFilterHandler) CreateFilteroption(c *gin.Context) {
	filterOption := &domain.ProductFilterOption{}
	if err := c.ShouldBindJSON(&filterOption); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}
	ctx := c.Request.Context()
	id, err := pfh.service.CreateProductFilterOption(ctx, filterOption)
	if err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
	}
	handleSuccess(c, id)
}
func (pfh *ProductFilterHandler) Create(c *gin.Context) {
	var req createProductFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	filterID, err := pfh.service.CreateProductFilter(ctx, req.CategoryID, req.Name,
		req.DisplayName, req.Options)
	if err != nil {
		HandleError(c, err, pfh.AppConfig.Lang)
		return
	}

	resp := &createProductFilterResponse{
		ID: filterID,
	}

	handleSuccess(c, resp)
}

type updateProductFilterRequest struct {
	Filter  *domain.ProductFilter         `json:"filter"`
	Options []*domain.ProductFilterOption `json:"options"`
}

type updateProductFilterResponse struct {
}

func (pfh *ProductFilterHandler) Update(c *gin.Context) {
	var req *domain.ProductFilterData
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := pfh.service.UpdateProductFilter(ctx, req)
	if err != nil {
		HandleError(c, err, pfh.AppConfig.Lang)
		return
	}

	resp := &updateProductFilterResponse{}

	handleSuccess(c, resp)
}

type fetchAllFiltersRequest struct {
	CategoryID int64 `uri:"categoryId"`
}

func (pfh *ProductFilterHandler) FetchAll(c *gin.Context) {
	var req fetchAllFiltersRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	filters, err := pfh.service.GetAllProductFilters(ctx, req.CategoryID)
	if err != nil {
		HandleError(c, err, pfh.AppConfig.Lang)
		return
	}

	handleSuccess(c, filters)
}

type batchDeleteProductFilterRequest struct {
	IDs []int64 `json:"ids"`
}

type batchDeleteProductFilterResponse struct{}

func (pfh *ProductFilterHandler) BatchDeleteProductFilters(c *gin.Context) {
	var req batchDeleteProductFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := pfh.service.BatchDeleteProductFilters(ctx, req.IDs)
	if err != nil {
		HandleError(c, err, pfh.AppConfig.Lang)
		return
	}

	resp := &batchDeleteProductFilterResponse{}

	handleSuccess(c, resp)
}

type batchDeleteProductFilterOptionsRequest struct {
	IDs []int64 `json:"ids"`
}

type batchDeleteProductFilterOptionsResponse struct{}

func (pfh *ProductFilterHandler) BatchDeleteProductFilterOptions(c *gin.Context) {
	var req batchDeleteProductFilterOptionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pfh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := pfh.service.BatchDeleteProductFilterOptions(ctx, req.IDs)
	if err != nil {
		HandleError(c, err, pfh.AppConfig.Lang)
		return
	}

	resp := &batchDeleteProductFilterResponse{}

	handleSuccess(c, resp)
}
