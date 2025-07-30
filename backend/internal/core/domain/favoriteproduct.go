package domain

import (
	"time"

	"github.com/shopspring/decimal"
)

type FavoriteProduct struct {
	ID        int64 `json:"id"`
	UserID    int64 `json:"userId"`
	ProductID int64 `json:"productId"`
}

type FavoriteProductsViewModel struct {
	FavoriteProduct
	ProductCategoryTitle   string          `json:"productCategoryTitle"`
	ProductBrandTitle      string          `json:"productBrandTitle"`
	ProductModelTitle      string          `json:"productModelTitle"`
	ProductShopsCount      int64           `json:"productShopCount"`
	ProductPrice           decimal.Decimal `json:"productPrice"`
	ProductDefaultImageUrl string          `json:"productDefaultImageUrl"`
	ProductCreationAt      time.Time       `json:"productCreationAt"`
}

func (FavoriteProduct) TableName() string {
	return "favorite_product"
}
