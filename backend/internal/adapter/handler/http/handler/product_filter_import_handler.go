// internal/adapter/handler/http/product_filter_import_handler.go
package handler

import (
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/port"
)

type ProductFilterImportHandler struct {
	Service   port.ProductFilterImportService // اینترفیس سرویس (پایین تعریف شده)
	AppConfig config.App
}

func RegisterProductFilterImportHandler(router *gin.Engine, svc port.ProductFilterImportService, appCfg config.App) {
	h := &ProductFilterImportHandler{Service: svc, AppConfig: appCfg}

	api := router.Group("/product-filter")
	{
		// POST /product-filter/import-csv
		api.POST("/import-csv", h.ImportCSV)
	}
}

// فرم دیتا: file=..., categoryId=..., brandCol=برند, modelCol=مدل
func (h *ProductFilterImportHandler) ImportCSV(c *gin.Context) {
	ctx := c.Request.Context()

	// دسته الزامیست
	categoryIDStr := c.PostForm("categoryId")
	if categoryIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "categoryId is required"})
		return
	}
	categoryID, err := strconv.ParseInt(categoryIDStr, 10, 64)
	if err != nil || categoryID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid categoryId"})
		return
	}

	brandCol := c.PostForm("brandCol")
	if brandCol == "" {
		brandCol = "برند"
	}
	modelCol := c.PostForm("modelCol")
	if modelCol == "" {
		modelCol = "مدل"
	}
	// “از ستون سوم به بعد فیلتر هستند”: اگر headerها معلوم‌اند، از هدرها استفاده می‌کنیم؛
	// در غیر اینصورت می‌توانیم startFilterColIndex را هم به‌عنوان گزینه اضافه کنیم (اختیاری)
	startFilterColIndex := -1
	if s := c.PostForm("startFilterColIndex"); s != "" {
		if v, err := strconv.Atoi(s); err == nil && v >= 0 {
			startFilterColIndex = v
		}
	}

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1
	reader.TrimLeadingSpace = true

	// خواندن هدر
	header, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot read csv header"})
		return
	}
	for i := range header {
		header[i] = strings.TrimSpace(strings.TrimPrefix(header[i], "\uFEFF")) // حذف BOM احتمالی
	}

	// یافتن ایندکس ستون‌های برند و مدل
	colIdx := func(name string) int {
		for i, h := range header {
			if equalFa(h, name) {
				return i
			}
		}
		return -1
	}
	brandIdx := colIdx(brandCol)
	modelIdx := colIdx(modelCol)
	if brandIdx < 0 || modelIdx < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("cannot find brandCol=%q or modelCol=%q in header", brandCol, modelCol)})
		return
	}

	// مشخص‌کردن شروع فیلترها: اگر کاربر مشخص نکرده، طبق گفتۀ شما از ستون سوم (index=2) به بعد
	if startFilterColIndex < 0 {
		startFilterColIndex = 2
	}

	// لیست سطرها
	var rows [][]string
	for {
		rec, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "error while reading csv rows"})
			return
		}
		rows = append(rows, rec)
	}

	// فراخوانی سرویس
	res, err := h.Service.ImportCSV(ctx, port.ImportCSVArgs{
		CategoryID:          categoryID,
		Header:              header,
		Rows:                rows,
		BrandColIndex:       brandIdx,
		ModelColIndex:       modelIdx,
		StartFilterColIndex: startFilterColIndex,
	})
	if err != nil {
		HandleError(c, err, h.AppConfig.Lang)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"createdFilters":   res.CreatedFilters,
		"createdOptions":   res.CreatedOptions,
		"createdRelations": res.CreatedRelations,
		"skippedEmpty":     res.SkippedEmpty,
		"notFoundProducts": res.NotFoundProducts, // [{brand:"...", model:"..."}]
		"warnings":         res.Warnings,
	})
}

func equalFa(a, b string) bool {
	return strings.TrimSpace(a) == strings.TrimSpace(b)
}
