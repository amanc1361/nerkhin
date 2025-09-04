package domain

import "github.com/shopspring/decimal"

type SortUpdated string

// "asc" | "desc" (مثل نمونهٔ خودت)

type UserProductSearchQuery struct {
	// صفحه‌بندی
	Limit  int
	Offset int

	// سورت
	SortUpdated SortUpdated // asc | desc
	SortBy      string      // "updated" | "order" (default: updated)

	// فیلترها (همه اختیاری)
	CategoryID    int64 // دستهٔ اصلی (category_id روی brand)
	SubCategoryID int64 // اگر ستون زیر‌دسته روی product داری
	BrandIDs      []int64
	IsDollar      *bool
	Search        string
	TagList       []string
	FilterIDs     []int64 // ANY
	OptionIDs     []int64 // ANY
	CityID        *int64  // شهر فروشنده

	// نمایش
	OnlyVisible *bool // default: true -> up.is_hidden=false

	// محدودسازی به سابسکرایب‌های بیننده (اختیاری)
	EnforceSubscription bool  // اگر true باشد، باید ViewerID ست شود
	ViewerID            int64 // کاربر بیننده برای uss (user_subscription)

	// فقط اگر لازم داری نقش کاربر فروشنده را محدود کنی:
	RequireWholesalerRole bool
	PriceMin              *decimal.Decimal `json:"priceMin,omitempty"` // صفر یا nil یعنی بدون حد پایین
	PriceMax              *decimal.Decimal `json:"priceMax,omitempty"` // صفر یا nil یعنی بدون حد بالا
}

type UserProductMarketView struct {
	// از user_product:
	ID          int64   `json:"id" gorm:"column:id"`
	ProductID   int64   `json:"productId" gorm:"column:product_id"`
	UserID      int64   `json:"userId" gorm:"column:user_id"`
	IsDollar    bool    `json:"isDollar" gorm:"column:is_dollar"`
	FinalPrice  string  `json:"finalPrice" gorm:"column:final_price"`   // decimal::text
	DollarPrice *string `json:"dollarPrice" gorm:"column:dollar_price"` // nullable::text
	Order       int64   `json:"order" gorm:"column:order_c"`

	// از product:
	ModelName       string `json:"modelName"`
	BrandID         int64  `json:"brandId"`
	DefaultImageUrl string `json:"defaultImageUrl"`
	ImagesCount     int    `json:"imagesCount"`
	Description     string `json:"description"`

	// از brand/category:
	CategoryID    int64  `json:"categoryId"`
	CategoryTitle string `json:"categoryTitle"`
	BrandTitle    string `json:"brandTitle"`

	// از user_t:
	ShopName string `json:"shopName"`
	CityID   int64  `json:"cityId"`
	CityName string `json:"cityName"`

	// زمان مرتب‌سازی
	UpdatedAt  string `json:"updatedAt"`
	IsFavorite bool   `json:"isFavorite" gorm:"column:is_favorite"`
}
type MarketSearchResult struct {
	Items []*UserProductMarketView `json:"items"`
	Total int64                    `json:"total"`
}
