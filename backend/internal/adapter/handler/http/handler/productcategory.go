package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

const CATEGORY_IMAGES_LIMIT int = 1

type ProductCategoryHandler struct {
	service      port.ProductCategoryService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterProductCategoryHandler(service port.ProductCategoryService,
	tokenService port.TokenService, appConfig config.App) *ProductCategoryHandler {
	return &ProductCategoryHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createProductCategoryRequest struct {
	ParentID int64  `json:"parentId"`
	Title    string `json:"title"`
}

type createProductCategoryResponse struct {
	ID int64 `json:"id"`
}

func (pch *ProductCategoryHandler) Create(c *gin.Context) {
	var req createProductCategoryRequest
	jsonData := c.PostForm("data")

	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	category := &domain.ProductCategory{
		ParentID: sql.NullInt64{
			Int64: req.ParentID,
			Valid: req.ParentID > 0,
		},
		Title: req.Title,
	}

	imageFileNames, err := saveAndGetImageFileNames(c, "images",
		pch.AppConfig.ImageBasePath, CATEGORY_IMAGES_LIMIT)
	if err != nil {

		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	if len(imageFileNames) > 0 {
		category.ImageUrl = imageFileNames[0]
	}

	ctx := c.Request.Context()

	id, err := pch.service.CreateProductCategory(ctx, category)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := createProductCategoryResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type updateProductCategoryRequest struct {
	ID       int64  `json:"id"`
	ParentID int64  `json:"parentId"`
	Title    string `json:"title"`
}

type updateProductCategoryResponse struct {
	ID int64 `json:"id"`
}

func (pch *ProductCategoryHandler) Update(c *gin.Context) {
	var req updateProductCategoryRequest
	jsonData := c.PostForm("data")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	category := &domain.ProductCategory{
		ID: req.ID,
		ParentID: sql.NullInt64{
			Int64: req.ParentID,
			Valid: req.ParentID > 0,
		},
		Title: req.Title,
	}

	imageFileNames, err := saveAndGetImageFileNames(c, "images",
		pch.AppConfig.ImageBasePath, CATEGORY_IMAGES_LIMIT)
	if err != nil {
		return
	}

	if len(imageFileNames) > 0 {
		category.ImageUrl = imageFileNames[0]
	}

	id, err := pch.service.UpdateProductCategory(ctx, category)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := updateProductCategoryResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type fetchProductCategoryRequest struct {
	ID int64 `uri:"id"`
}

type fetchProductCategoryResponse struct {
	ID       int64  `json:"id"`
	ParentID int64  `json:"parentId"`
	Title    string `json:"title"`
	ImageUrl string `json:"imageUrl"`
}

type fetchProductCategoryVMResponse struct {
	ID            int64                          `json:"id"`
	ParentID      int64                          `json:"parentId"`
	Title         string                         `json:"title"`
	ImageUrl      string                         `json:"imageUrl"`
	SubCategories []fetchProductCategoryResponse `json:"subCategories"`
}

func (pch *ProductCategoryHandler) Fetch(c *gin.Context) {
	var req fetchProductCategoryRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	category, err := pch.service.GetProductCategoryByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := toFetchProductCategoryResponse(category)

	handleSuccess(c, resp)
}

type deleteProductCategoryRequest struct {
	Ids []int64 `json:"ids"`
}

type deleteProductCategoryResponse struct{}

func (pch *ProductCategoryHandler) Delete(c *gin.Context) {
	// 1. خواندن ID از پارامتر URL (مثلاً /product-category/123)
	idStr := c.Param("id") // فرض می‌کنیم نام پارامتر در روت شما "id" است
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		// اگر ID در URL یک عدد معتبر نباشد، خطای Bad Request برگردان
		validationError(c, errors.New("invalid category ID in URL"), pch.AppConfig.Lang)
		return
	}

	// 2. سرویس ما انتظار یک اسلایس از ID ها را دارد، پس ما یک اسلایس با همین یک ID می‌سازیم
	idsToDelete := []int64{id}

	// 3. فراخوانی سرویس
	ctx := c.Request.Context()
	err = pch.service.DeleteProductCategory(ctx, idsToDelete)
	if err != nil {
		// مدیریت خطاهای منطقی که از سرویس می‌آیند (مثلاً دسته دارای زیردسته است)
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	// 4. ارسال پاسخ موفقیت‌آمیز
	// برای DELETE معمولاً پاسخ 200 OK یا 204 No Content مناسب است
	handleSuccess(c, id)
}

func (pch *ProductCategoryHandler) FetchMainCategories(c *gin.Context) {
	ctx := c.Request.Context()

	categories, err := pch.service.GetMainCategories(ctx)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, categories)
}

type fetchSubCategoriesRequest struct {
	ID int64 `uri:"id"`
}

func (pch *ProductCategoryHandler) FetchSubCategories(c *gin.Context) {
	var req fetchSubCategoriesRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	categories, err := pch.service.GetSubCategoriesByParentID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := []fetchProductCategoryResponse{}
	for _, category := range categories {
		resp = append(resp, toFetchProductCategoryResponse(category))
	}

	handleSuccess(c, resp)
}

type fetchCategoriesByFilterRequest struct {
	SearchText string `json:"searchText"`
}

func (pch *ProductCategoryHandler) FetchCategoriesByFilter(c *gin.Context) {
	var req fetchCategoriesByFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	categories, err := pch.service.GetCategoriesByFilter(ctx, &domain.ProductCategoryFilter{
		SearchText: req.SearchText,
	})
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	resp := []fetchProductCategoryResponse{}
	for _, category := range categories {
		categoryResponse := toFetchProductCategoryResponse(category)
		resp = append(resp, categoryResponse)
	}

	handleSuccess(c, resp)
}

type fetchRelatedBrandModelsRequest struct {
	CategoryID int64 `uri:"categoryId"`
}

func (pch *ProductCategoryHandler) FetchRelatedBrandModels(c *gin.Context) {
	var req fetchRelatedBrandModelsRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	response, err := pch.service.GetRelatedBrandModels(ctx, req.CategoryID)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, response)
}

func (pch *ProductCategoryHandler) FetchSubcategoriesForPanel(c *gin.Context) {
	var req fetchSubCategoriesRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, pch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	categories, err := pch.service.GetSubCategoriesByParentIDForPanel(ctx, req.ID)
	if err != nil {
		HandleError(c, err, pch.AppConfig.Lang)
		return
	}

	handleSuccess(c, categories)
}

func toFetchProductCategoryResponse(category *domain.ProductCategory) fetchProductCategoryResponse {
	return fetchProductCategoryResponse{
		ID:       category.ID,
		ParentID: category.ParentID.Int64,
		Title:    category.Title,
		ImageUrl: category.ImageUrl,
	}
}

func toFetchProductCategoryVMResponse(
	category *domain.ProductCategoryViewModel) fetchProductCategoryVMResponse {
	subCategories := []fetchProductCategoryResponse{}
	for _, sub := range category.SubCategories {
		subCategories = append(subCategories, toFetchProductCategoryResponse(sub))
	}

	return fetchProductCategoryVMResponse{
		ID:            category.ID,
		ParentID:      category.ParentID.Int64,
		Title:         category.Title,
		ImageUrl:      category.ImageUrl,
		SubCategories: subCategories,
	}
}
