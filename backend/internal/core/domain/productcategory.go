package domain

import (
	"database/sql"
)

type ProductCategoryViewModel struct {
	ProductCategory
	SubCategories []*ProductCategory `json:"subCategories"`
}

type ProductCategory struct {
	ID       int64         `json:"id"`
	ParentID sql.NullInt64 `json:"parentId"`
	Title    string        `json:"title"`
	ImageUrl string        `json:"imageUrl"`
}

type BrandModels struct {
	Brand  *ProductBrand   `json:"brand"`
	Models []*ProductModel `json:"models"`
}

func (ProductCategory) TableName() string {
	return "product_category"
}

type ProductCategoryFilter struct {
	SearchText string
	OnlyMain   bool
	ParentIDs  []int64
	ParentID   int64
}
