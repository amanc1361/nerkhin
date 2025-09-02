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
	Service   port.ProductFilterImportService
	Token     port.TokenService // اگر لازم نبود، می‌تونی استفاده نکنی
	AppConfig config.App

}


func RegisterProductFilterImportHandler(
	svc port.ProductFilterImportService,
	tokenSvc port.TokenService,
	appCfg config.App,
) *ProductFilterImportHandler {
	return &ProductFilterImportHandler{
		Service:   svc,
		Token:     tokenSvc,
		AppConfig: appCfg,
	}
}

// این متد توسط http.NewRouter فراخوانی می‌شود


// فرم‌دیتا: file, categoryId, brandCol?, modelCol?, startFilterColIndex?
func (h *ProductFilterImportHandler) ImportCSV(c *gin.Context) {
	ctx := c.Request.Context()

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

	header, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot read csv header"})
		return
	}
	for i := range header {
		header[i] = strings.TrimSpace(strings.TrimPrefix(header[i], "\uFEFF"))
	}

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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("cannot find brandCol=%q or modelCol=%q in header", brandCol, modelCol),
		})
		return
	}

	if startFilterColIndex < 0 {
		startFilterColIndex = 2 // از ستون سوم به بعد
	}

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
		"notFoundProducts": res.NotFoundProducts,
		"warnings":         res.Warnings,
	})
}

func equalFa(a, b string) bool {
	return strings.TrimSpace(a) == strings.TrimSpace(b)
}
