package domain

type ProductBrand struct {
	ID         int64  `json:"id"`
	CategoryID int64  `json:"categoryId"`
	Title      string `json:"title"`
}

type ProductBrands struct {
	Brands           []*ProductBrand `json:"brands"`
	CategoryTitle    string          `json:"categoryTitle"`
	SubcategoryTitle string          `json:"subcategoryTitle"`
}

func (ProductBrand) TableName() string {
	return "product_brand"
}
