package handler

import (
	"encoding/json"
	"fmt"

	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"github.com/nerkhin/internal/pkg/pagination"
)

const PRODUCT_IMAGES_LIMIT int = 6

type ProductHandler struct {
	service      port.ProductService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterProductHandler(service port.ProductService, tokenService port.TokenService,
	appConfig config.App) *ProductHandler {
	return &ProductHandler{
		service:      service,
		TokenService: tokenService,
		AppConfig:    appConfig,
	}
}

// createProductRequest is simplified to only require ModelID.
type createProductRequest struct {
	ModelName         string   `json:"modelName" binding:"required"`
	BrandID           int64    `json:"brandId" binding:"required"`
	Description       string   `json:"description"`
	DefaultImageIndex int      `json:"defaultImageIndex"`
	FilterOptionIDs   []int64  `json:"filterOptionIds"`
	DefaultOptionID   int64    `json:"defaultOptionId"`
	Tags              []string `json:"tags"`
}
type updateProductRequest struct {
	ID                int64    `json:"id" binding:"required"`
	ModelName         string   `json:"modelName" binding:"required"`
	BrandID           int64    `json:"brandId" binding:"required"`
	Description       string   `json:"description"`
	DefaultImageIndex int      `json:"defaultImageIndex"`
	FilterOptionIDs   []int64  `json:"filterOptionIds"`
	DefaultOptionID   int64    `json:"defaultOptionId"`
	Tags              []string `json:"tags"`
}

type createProductResponse struct {
	ID int64 `json:"id"`
}

func (ph *ProductHandler) Create(c *gin.Context) {
	var req createProductRequest
	jsonData := c.PostForm("data")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, ph.AppConfig.Lang)
		return
	}

	// فایل‌های عکس را بخوان
	formFiles, err := c.MultipartForm()
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}
	files := formFiles.File["images"]
	if len(files) > PRODUCT_IMAGES_LIMIT {
		HandleError(c, fmt.Errorf("حداکثر %d تصویر مجاز است", PRODUCT_IMAGES_LIMIT), ph.AppConfig.Lang)
		return
	}

	// ساخت محصول اولیه و قرار دادن تعداد عکس‌ها
	product := &domain.Product{
		ModelName:   req.ModelName,
		BrandID:     req.BrandID,
		Description: req.Description,
		ImagesCount: len(files),
	}

	// پر کردن imagePayload بعد از ذخیره عکس‌ها (در service انجام می‌شود)
	// فیلد defaultImageUrl نیز در service مشخص می‌شود

	// ساخت فیلتر و تگ (بدون تغییر)
	filterPayload := &domain.ProductFilterPayload{
		NewOptionIDs:    req.FilterOptionIDs,
		DefaultOptionID: req.DefaultOptionID,
	}

	tagPayload := &domain.ProductTagPayload{NewTags: []*domain.ProductTag{}}
	for _, tag := range req.Tags {
		tagPayload.NewTags = append(tagPayload.NewTags, &domain.ProductTag{Tag: tag})
	}

	// صدا زدن همان متد CreateProduct
	ctx := c.Request.Context()
	id, err := ph.service.CreateProduct(ctx, product, files, req.DefaultImageIndex, ph.AppConfig.ImageBasePath, filterPayload, tagPayload)
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}

	handleSuccess(c, &createProductResponse{ID: id})
}

type updatedFilterRelation struct {
	ID             int64 `json:"id"`
	FilterOptionID int64 `json:"filterOptionId"`
}

func (ph *ProductHandler) Update(c *gin.Context) {
	var req updateProductRequest
	jsonData := c.PostForm("data")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, ph.AppConfig.Lang)
		return
	}

	formFiles, err := c.MultipartForm()
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}
	files := formFiles.File["images"]
	if len(files) > PRODUCT_IMAGES_LIMIT {
		HandleError(c, fmt.Errorf("حداکثر %d تصویر مجاز است", PRODUCT_IMAGES_LIMIT), ph.AppConfig.Lang)
		return
	}

	product := &domain.Product{
		ID:          req.ID,
		ModelName:   req.ModelName,
		BrandID:     req.BrandID,
		Description: req.Description,
		ImagesCount: len(files),
	}

	filterPayload := &domain.ProductFilterPayload{
		NewOptionIDs:    req.FilterOptionIDs,
		DefaultOptionID: req.DefaultOptionID,
	}

	tagPayload := &domain.ProductTagPayload{NewTags: []*domain.ProductTag{}}
	for _, tag := range req.Tags {
		tagPayload.NewTags = append(tagPayload.NewTags, &domain.ProductTag{Tag: tag})
	}

	err = ph.service.UpdateProduct(c.Request.Context(), product, files, req.DefaultImageIndex, ph.AppConfig.ImageBasePath, filterPayload, tagPayload)
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

// FetchProductsByFilter now accepts pagination parameters.
type fetchProductsRequest struct {
	SearchText string           `form:"searchText"`
	CategoryID int64            `form:"categoryId"`
	BrandID    int64            `form:"brandId"`
	ModelID    int64            `form:"modelId"`
	SortOrder  domain.SortOrder `form:"sortOrder"`
	Page       int              `form:"page"`
	Limit      int              `form:"limit"`
}

func (ph *ProductHandler) FetchProductsByFilter(c *gin.Context) {
	var req fetchProductsRequest
	if err := c.ShouldBindQuery(&req); err != nil { // Use ShouldBindQuery for GET requests
		validationError(c, err, ph.AppConfig.Lang)
		return
	}

	sortOrder := domain.None
	if domain.IsSortOrderValid(int(req.SortOrder)) {
		sortOrder = req.SortOrder
	}

	ctx := c.Request.Context()
	products, err := ph.service.GetProductsByFilter(ctx, &domain.ProductFilterQuery{
		SearchText: req.SearchText,
		CategoryID: req.CategoryID,
		SortOrder:  sortOrder,
		BrandID:    req.BrandID,
		ModelID:    req.ModelID,
	}, req.Page, req.Limit)
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}

	handleSuccess(c, products)
}

// Fetch (GetProductByID) remains largely the same.
type fetchProductRequest struct {
	ID int64 `uri:"id" binding:"required"`
}

func (ph *ProductHandler) Fetch(c *gin.Context) {
	var req fetchProductRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, ph.AppConfig.Lang)
		return
	}
	ctx := c.Request.Context()
	productViewModel, err := ph.service.GetProductByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}
	handleSuccess(c, productViewModel)
}

func (ph *ProductHandler) Delete(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		validationError(c, err, ph.AppConfig.Lang)
		return
	}
	ctx := c.Request.Context()
	err = ph.service.DeleteProduct(ctx, int64(id))
	if err != nil {
		HandleError(c, err, ph.AppConfig.Lang)
		return
	}
	handleSuccess(c, nil)
}

// GET /models/:modelID/products?page=1&page_size=20
func (h *ProductHandler) ListByModel(c *gin.Context) {
	modelID, err := strconv.Atoi(c.Param("modelId"))
	if err != nil {
		validationError(c, err, h.AppConfig.Lang)

		return
	}

	// Bind & validate query
	var q struct {
		Page     int `form:"page,default=1"      validate:"gte=1"`
		PageSize int `form:"page_size,default=20" validate:"gte=1,lte=100"`
	}
	if err := c.ShouldBindQuery(&q); err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}

	pag := pagination.Pagination{
		Page:     q.Page,
		PageSize: q.PageSize,
	}

	res, err := h.service.ListByModel(c.Request.Context(), int64(modelID), pag)
	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}
	handleSuccess(c, res)
}
func (h *ProductHandler) GetByBrand(c *gin.Context) {
	brandIDStr := c.Param("brandId")
	brandID, err := strconv.ParseInt(brandIDStr, 10, 64)
	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}

	// کوئری‌استرینگ page و page_size
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	result, err := h.service.GetProductsByBrandIDPaginated(
		c.Request.Context(),
		brandID,
		pagination.Pagination{Page: page, PageSize: pageSize},
	)
	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}

	handleSuccess(c, result)
}

func (h *ProductHandler) GetByCategory(c *gin.Context) {
	categoryID, err := strconv.Atoi(c.Param("categoryId"))

	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}

	// مقادیر پیش‌فرض برای pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	search := c.Query("search") // optional

	result, err := h.service.ListProductsByCategoryWithSearch(
		c.Request.Context(),
		int64(categoryID),
		search,
		pagination.Pagination{
			Page:     page,
			PageSize: pageSize,
		},
	)

	if err != nil {
		validationError(c, err, h.AppConfig.Lang)
		return
	}

	handleSuccess(c, result)
}
