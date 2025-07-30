package handler

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type ProductBrandHandler struct {
	service      port.ProductBrandService
	TokenService port.TokenService
	AppConfig    config.App
}

type saveProductBrandRequest struct {
	ID         int64  `json:"id"`
	CategoryID int64  `json:"categoryId"`
	Title      string `json:"title"`
}

type saveProductBrandResponse struct {
	ID int64 `json:"id" example:"1"`
}

type fetchProductBrandRequest struct {
	ID int64 `uri:"id" example:"1"`
}

type fetchProductBrandResponse struct {
	ID    int64  `json:"id" example:"1"`
	Title string `json:"title" example:"TFi-60"`
}

type deleteProductBrandRequest struct {
	Ids []int64 `json:"ids" example:"[1, 2]"`
}

func RegisterProductBrandHandler(service port.ProductBrandService, tokenService port.TokenService,
	appConfig config.App) *ProductBrandHandler {
	return &ProductBrandHandler{
		service,
		tokenService,
		appConfig,
	}
}

func (pbh *ProductBrandHandler) Create(c *gin.Context) {
	var req saveProductBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pbh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	brand := &domain.ProductBrand{
		CategoryID: req.CategoryID,
		Title:      req.Title,
	}

	id, err := pbh.service.CreateProductBrand(ctx, brand)
	if err != nil {
		HandleError(c, err, pbh.AppConfig.Lang)
		return
	}

	resp := saveProductBrandResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

func (pbh *ProductBrandHandler) Update(c *gin.Context) {
	var req saveProductBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pbh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	brand := &domain.ProductBrand{
		ID:    req.ID,
		Title: req.Title,
	}

	id, err := pbh.service.UpdateProductBrand(ctx, brand)
	if err != nil {
		HandleError(c, err, pbh.AppConfig.Lang)
		return
	}

	resp := saveProductBrandResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

func (pbh *ProductBrandHandler) Fetch(c *gin.Context) {
	var req fetchProductBrandRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pbh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	brand, err := pbh.service.GetProductBrandByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, pbh.AppConfig.Lang)
		return
	}

	handleSuccess(c, brand)
}

func (pbh *ProductBrandHandler) Delete(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		validationError(c, err, pbh.AppConfig.Lang)
		return
	}
	ctx := c.Request.Context()

	err = pbh.service.DeleteProductBrand(ctx, int64(id))
	if err != nil {
		HandleError(c, err, pbh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchAllBrandsRequest struct {
	CategoryID int64 `uri:"categoryId"`
}

func (bh *ProductBrandHandler) FetchAll(c *gin.Context) {
	var req fetchAllBrandsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, bh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	brands, err := bh.service.GetAllProductBrands(ctx, req.CategoryID)
	if err != nil {
		HandleError(c, err, bh.AppConfig.Lang)
		return
	}

	handleSuccess(c, brands)
}

type fetchBrandsRequest struct {
	CategoryID int64 `uri:"categoryId"`
}

func (bh *ProductBrandHandler) FetchBrands(c *gin.Context) {
	var req fetchBrandsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, bh.AppConfig.Lang)
		return
	}
	fmt.Println("---------------------------------")
	fmt.Println(req)
	ctx := c.Request.Context()

	brands, err := bh.service.GetBrandByCategoryId(ctx, req.CategoryID)
	fmt.Printf("get brands:")
	fmt.Println(brands)
	if err != nil {
		HandleError(c, err, bh.AppConfig.Lang)
		return
	}

	handleSuccess(c, brands)
}
