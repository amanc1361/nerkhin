// internal/core/port/product_filter_import_service.go
package port

import "context"

type ImportCSVArgs struct {
	CategoryID          int64
	Header              []string
	Rows                [][]string
	BrandColIndex       int
	ModelColIndex       int
	StartFilterColIndex int
}

type ImportCSVResult struct {
	CreatedFilters   int
	CreatedOptions   int
	CreatedRelations int
	SkippedEmpty     int
	NotFoundProducts []map[string]string // [{brand, model}]
	Warnings         []string
}

type ProductFilterImportService interface {
	ImportCSV(ctx context.Context, args ImportCSVArgs) (ImportCSVResult, error)
}
