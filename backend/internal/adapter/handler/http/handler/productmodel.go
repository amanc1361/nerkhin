package handler

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type ProductModelHandler struct {
	service      port.ProductModelService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterProductModelHandler(service port.ProductModelService, token port.TokenService,
	appConfig config.App) *ProductModelHandler {
	return &ProductModelHandler{
		service:      service,
		AppConfig:    appConfig,
		TokenService: token,
	}
}

// createModelRequest now requires a BrandID instead of CategoryID.
type createModelRequest struct {
	BrandID int64  `json:"brandId" binding:"required"`
	Title   string `json:"title" binding:"required"`
}

type modelResponse struct {
	ID int64 `json:"id"`
}

func (pmh *ProductModelHandler) Create(c *gin.Context) {
	var req createModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pmh.AppConfig.Lang)
		return
	}

	model := &domain.ProductModel{
		BrandID: req.BrandID,
		Title:   req.Title,
	}

	ctx := c.Request.Context()
	id, err := pmh.service.CreateProductModel(ctx, model)
	if err != nil {
		HandleError(c, err, pmh.AppConfig.Lang)
		return
	}

	handleSuccess(c, &modelResponse{ID: id})
}

// updateModelRequest also requires a BrandID to ensure context.
type updateModelRequest struct {
	ID      int64  `json:"id" binding:"required"`
	BrandID int64  `json:"brandId" binding:"required"`
	Title   string `json:"title" binding:"required"`
}

func (pmh *ProductModelHandler) Update(c *gin.Context) {
	var req updateModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pmh.AppConfig.Lang)
		return
	}

	model := &domain.ProductModel{
		ID:      req.ID,
		BrandID: req.BrandID, // While you typically don't change a model's brand, it's needed for validation in the service.
		Title:   req.Title,
	}

	ctx := c.Request.Context()
	_, err := pmh.service.UpdateProductModel(ctx, model)
	if err != nil {
		HandleError(c, err, pmh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchModelRequest struct {
	ID int64 `uri:"id" binding:"required"`
}

func (pmh *ProductModelHandler) Fetch(c *gin.Context) {
	
	var req fetchModelRequest
	if err := c.ShouldBindUri(&req); err != nil {
		
		validationError(c, err, pmh.AppConfig.Lang)
		return
	}
	
	ctx := c.Request.Context()
	model, err := pmh.service.GetProductModelByID(ctx, req.ID)
	if err != nil {
	
		HandleError(c, err, pmh.AppConfig.Lang)
		return
	}

	handleSuccess(c, model)
}

type deleteModelRequest struct {
	Ids []int64 `json:"ids" binding:"required"`
}

func (pmh *ProductModelHandler) Delete(c *gin.Context) {
	var req deleteModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pmh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	err := pmh.service.DeleteProductModel(ctx, req.Ids)
	if err != nil {
		HandleError(c, err, pmh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

// fetchAllModelsRequest now accepts a brandID from the query string.
type fetchAllModelsRequest struct {
	BrandID int64 `form:"brandId" binding:"required"`
}

func (mh *ProductModelHandler) FetchModelsByBrandID(c *gin.Context) {
	fmt.Println("in get model by brand id")
	brandID, err := strconv.Atoi(c.Param("brandId"))
	if err != nil {
		validationError(c, err, mh.AppConfig.Lang)
		return
	}
	fmt.Println("--------------------------------")
	fmt.Println(brandID)

	ctx := c.Request.Context()
	models, err := mh.service.GetProductModelByBrandId(ctx, int64(brandID))
	if err != nil {
		HandleError(c, err, mh.AppConfig.Lang)
		return
	}
	fmt.Println("end  get model")
	handleSuccess(c, models)
}
func (mh *ProductModelHandler) FetchAll(c *gin.Context) {
	var req fetchAllModelsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		validationError(c, err, mh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	models, err := mh.service.GetAllProductModels(ctx, req.BrandID)
	if err != nil {
		HandleError(c, err, mh.AppConfig.Lang)
		return
	}

	handleSuccess(c, models)
}

// fetchModelsRequest gets existing models in use for a category.
type fetchModelsRequest struct {
	CategoryID int64 `uri:"categoryId" binding:"required"`
}

func (mh *ProductModelHandler) FetchModels(c *gin.Context) {
	var req fetchModelsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, mh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	models, err := mh.service.GetProductModels(ctx, req.CategoryID)
	if err != nil {
		HandleError(c, err, mh.AppConfig.Lang)
		return
	}

	handleSuccess(c, models)
}
