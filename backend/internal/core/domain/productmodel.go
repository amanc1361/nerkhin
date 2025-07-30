package domain

type ProductModel struct {
	ID      int64  `json:"id"`
	BrandID int64  `json:"brandId"`
	Title   string `json:"title"`
}

type ProductModels struct {
	Models        []*ProductModel `json:"models"`
	BrandTitle    string          `json:"brandTitle"` // <--- حالا مربوط به برند است
	CategoryTitle string          `json:"categoryTitle"`
}

func (ProductModel) TableName() string {
	return "product_model"
}
