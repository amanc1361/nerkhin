package handler

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"strings"

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
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "200"))

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

// --- CSV Import ---

// POST /v1/products/import-csv
// multipart/form-data: file=<csv>
// اختیاری: categoryId (برای یافتن/ساختن برند در همان کتگوری) ، skipExisting=true|false (پیش‌فرض true)
// POST /v1/products/import-csv
// multipart/form-data: file=<csv>
// اختیاری: skipExisting=true|false (پیش‌فرض true)
func (ph *ProductHandler) ImportFromCSV(c *gin.Context) {
	ctx := c.Request.Context()

	// فقط skipExisting از فرم خوانده می‌شود؛ categoryId دیگر از روت/فرم گرفته نمی‌شود
	skipExistingStr := strings.ToLower(strings.TrimSpace(c.DefaultPostForm("skipExisting", c.DefaultQuery("skipExisting", "true"))))
	skipExisting := !(skipExistingStr == "false" || skipExistingStr == "0")

	fileHeader, err := c.FormFile("file")
	if err != nil {
		validationError(c, fmt.Errorf("فایل CSV یافت نشد: %w", err), ph.AppConfig.Lang)
		return
	}
	f, err := fileHeader.Open()
	if err != nil {
		HandleError(c, fmt.Errorf("خطا در بازکردن CSV: %w", err), ph.AppConfig.Lang)
		return
	}
	defer f.Close()

	reader := csv.NewReader(bomAwareReader{r: f})
	reader.FieldsPerRecord = -1

	header, err := reader.Read()
	if err != nil {
		HandleError(c, fmt.Errorf("خطا در خواندن هدر CSV: %w", err), ph.AppConfig.Lang)
		return
	}

	// نگاشت ستون‌ها (category_id از «زیر دسته»)
	idx := map[string]int{
		"زیر دسته":  -1, // ← category_id
		"برند":      -1,
		"مدل":       -1,
		"توضیحات":   -1,
		"نام پوشه":  -1,
		"تعداد عکس": -1,
		"تگ":        -1,
	}
	for i, h := range header {
		h = strings.TrimSpace(h)
		if _, ok := idx[h]; ok {
			idx[h] = i
		}
	}
	// ستون‌های ضروری
	for _, k := range []string{"زیر دسته", "برند", "مدل", "نام پوشه", "تعداد عکس"} {
		if idx[k] < 0 {
			validationError(c, fmt.Errorf("ستون «%s» در CSV پیدا نشد", k), ph.AppConfig.Lang)
			return
		}
	}

	type rowError struct {
		Row   int    `json:"row"`
		Error string `json:"error"`
	}
	type importResult struct {
		Total     int        `json:"total"`
		Inserted  int        `json:"inserted"`
		Skipped   int        `json:"skipped"`
		Failed    int        `json:"failed"`
		RowErrors []rowError `json:"rowErrors,omitempty"`
	}

	res := importResult{}
	rowNum := 1

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		rowNum++
		if err != nil {
			res.Failed++
			res.RowErrors = append(res.RowErrors, rowError{Row: rowNum, Error: fmt.Sprintf("خطای CSV: %v", err)})
			continue
		}
		res.Total++

		// category_id از «زیر دسته» (الزامی و سخت‌گیرانه)
		subCatRaw := normalizeDigits(strings.TrimSpace(record[idx["زیر دسته"]]))
		if subCatRaw == "" {
			validationError(c, fmt.Errorf("ردیف %d: «زیر دسته» خالی است؛ فرآیند متوقف شد", rowNum), ph.AppConfig.Lang)
			return
		}
		categoryIDRow, err := strconv.ParseInt(subCatRaw, 10, 64)
		if err != nil || categoryIDRow <= 0 {
			validationError(c, fmt.Errorf("ردیف %d: «زیر دسته» عدد معتبر نیست (%q)؛ فرآیند متوقف شد", rowNum, subCatRaw), ph.AppConfig.Lang)
			return
		}

		brandTitle := strings.TrimSpace(record[idx["برند"]])
		modelName := strings.TrimSpace(record[idx["مدل"]])
		desc := safeGet(record, idx["توضیحات"])

		folderRaw := normalizeDigits(strings.TrimSpace(record[idx["نام پوشه"]]))
		folderID, err := strconv.ParseInt(folderRaw, 10, 64)
		if err != nil || folderID <= 0 {
			res.Failed++
			res.RowErrors = append(res.RowErrors, rowError{Row: rowNum, Error: "«نام پوشه» عدد معتبر نیست"})
			continue
		}

		imagesCountRaw := normalizeDigits(strings.TrimSpace(record[idx["تعداد عکس"]]))
		imagesCount, err := strconv.Atoi(imagesCountRaw)
		if err != nil || imagesCount < 0 {
			res.Failed++
			res.RowErrors = append(res.RowErrors, rowError{Row: rowNum, Error: "«تعداد عکس» عدد معتبر نیست"})
			continue
		}

		// جلوگیری از درج تکراری بر اساس ID = نام پوشه
		if skipExisting {
			if _, err := ph.service.GetProductByID(ctx, folderID); err == nil {
				res.Skipped++
				continue
			}
		}

		// استفاده از categoryIDRow (از فایل) برای یافتن/ساختن برند
		brandID, err := ph.service.EnsureBrandByTitle(ctx, categoryIDRow, brandTitle)
		if err != nil {
			res.Failed++
			res.RowErrors = append(res.RowErrors, rowError{
				Row:   rowNum,
				Error: fmt.Sprintf("برند «%s» (category_id=%d): %v", brandTitle, categoryIDRow, err),
			})
			continue
		}

		product := &domain.Product{
			ID:          folderID, // = نام پوشه
			ModelName:   modelName,
			BrandID:     brandID,
			Description: desc,
			ImagesCount: imagesCount, // فقط تعداد ذخیره می‌شود
		}

		// تگ‌ها
		tagList := splitTags(safeGet(record, idx["تگ"]))
		tagPayload := &domain.ProductTagPayload{NewTags: make([]*domain.ProductTag, 0, len(tagList))}
		for _, t := range tagList {
			if t != "" {
				tagPayload.NewTags = append(tagPayload.NewTags, &domain.ProductTag{Tag: t})
			}
		}

		if _, err := ph.service.CreateProductDirect(ctx, product, tagPayload); err != nil {
			res.Failed++
			res.RowErrors = append(res.RowErrors, rowError{Row: rowNum, Error: fmt.Sprintf("درج محصول ID=%d: %v", product.ID, err)})
			continue
		}
		res.Inserted++
	}

	handleSuccess(c, res)
}

// کمک‌متدها (لوکال به هندلر)
type bomAwareReader struct{ r io.Reader }

func (b bomAwareReader) Read(p []byte) (int, error) {
	n, err := b.r.Read(p)
	if n >= 3 && p[0] == 0xEF && p[1] == 0xBB && p[2] == 0xBF {
		copy(p, p[3:n])
		n -= 3
	}
	return n, err
}
func safeGet(rec []string, i int) string {
	if i < 0 || i >= len(rec) {
		return ""
	}
	return strings.TrimSpace(rec[i])
}
func normalizeDigits(s string) string {
	repl := strings.NewReplacer(
		"۰", "0", "۱", "1", "۲", "2", "۳", "3", "۴", "4",
		"۵", "5", "۶", "6", "۷", "7", "۸", "8", "۹", "9",
		"٠", "0", "١", "1", "٢", "2", "٣", "3", "٤", "4",
		"٥", "5", "٦", "6", "٧", "7", "٨", "8", "٩", "9",
	)
	return repl.Replace(strings.TrimSpace(s))
}
func splitTags(s string) []string {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	for _, sep := range []rune{',', '،', '|', ';', '/'} {
		s = strings.ReplaceAll(s, string(sep), ",")
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if v := strings.TrimSpace(p); v != "" {
			out = append(out, v)
		}
	}
	return out
}
