package domain

import (
	"database/sql"
	"time"

	"github.com/shopspring/decimal"
)

// internal/core/domain/userproduct_query.go

type SortDir string

const (
	SortAsc  SortDir = "asc"
	SortDesc SortDir = "desc"
)

type UserProductQuery struct {
	ShopID int64 `json:"shopId"`

	BrandIDs      []int64 `json:"brandIds"`      // فیلتر براساس چند برند
	CategoryID    int64   `json:"categoryId"`    // دستهٔ اصلی (pb.category_id)
	SubCategoryID int64   `json:"subCategoryId"` // اگر در اسکیمای شما روی product هست: p.sub_category_id

	IsDollar *bool `json:"isDollar"`

	Search string `json:"search"`

	SortUpdated SortDir `json:"sortUpdated"` // asc|desc (پیش‌فرض desc)

	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type UserProductView struct {
	UserProduct
	ProductCategory string                          `json:"productCategory"`
	ProductBrand    string                          `json:"productBrand"`
	ProductModel    string                          `json:"productModel"`
	Description     string                          `json:"description"`
	DefaultImageUrl string                          `json:"defaultImageUrl"`
	DefaultFilter   *ProductFilterRelationViewModel `gorm:"-" json:"defaultFilter"`
	IsLiked         bool                            `json:"isLiked"`
	ShopsCount      int32                           `json:"shopsCount"`
}

type ShopViewModel struct {
	ShopInfo *User              `json:"shopInfo"`
	Products []*UserProductView `json:"products"`
}
type SearchProductsData struct {
	ProductItems []*SearchProductViewModel `json:"productItems"`
	Filters      []*ProductFilterData      `json:"filters"`
	Brands       []*ProductBrand           `json:"brands"`
	Models       []*ProductModel           `json:"models"`
	TotalCount   int64                     `json:"totalCount"` // <--- این فیلد اضافه شد
}

type UserProductFilter struct {
	AllowedProductIDs []int64
	CategoryID        int64
	SearchText        string
	Limit             int
	Offset            int
	BrandIDs          int64
	ModelIDs          int64
	SortOrder         SortOrder
}

type SearchProductViewModel struct {
	Product
	CategoryTitle           string          `json:"categoryTitle"`
	BrandTitle              string          `json:"brandTitle"`
	ModelTitle              string          `json:"modelTitle"`
	IsLiked                 bool            `json:"isLiked"`
	Tags                    []*ProductTag   `gorm:"-" json:"tags"`
	FilterOptionIds         []int64         `gorm:"-" json:"filterOptionIds"`
	Price                   decimal.Decimal `gorm:"-" json:"price"`
	LastPriceUpdateDateTime time.Time       `json:"lastPriceUpdateDateTime"`
}

type ShopProduct struct {
	UserProduct
	DefaultImageUrl string `json:"defaultImageUrl"`
	ShopCity        string `json:"shopCity"`
	ShopPhone1      string `json:"shopPhone1"`
	ShopPhone2      string `json:"shopPhone2"`
	ShopPhone3      string `json:"shopPhone3"`
	ShopName        string `json:"shopName"`
	IsLiked         bool   `json:"isLiked"`
	LikesCount      int64  `json:"likesCount"`
}

type ProductShop struct {
	ID              int64           `json:"id"`
	UserID          int64           `json:"userId"`
	FinalPrice      decimal.Decimal `json:"finalPrice"`
	DefaultImageUrl string          `json:"defaultImageUrl"`
	ShopCity        string          `json:"shopCity"`
	ShopPhone1      string          `json:"shopPhone1"`
	ShopPhone2      string          `json:"shopPhone2"`
	ShopPhone3      string          `json:"shopPhone3"`
	ShopName        string          `json:"shopName"`
	IsLiked         bool            `json:"isLiked"`
	LikesCount      int64           `json:"likesCount"`
	UpdatedAt       time.Time       `json:"updatedAt"`
}

type ProductInfoViewModel struct {
	ShopProducts []*ProductShop    `json:"shopProducts"`
	ProductInfo  *ProductViewModel `json:"productInfo"`
}

type ShopsProductViewModel struct {
	ShopProducts []*ShopProduct    `json:"shopProducts"`
	ProductInfo  *ProductViewModel `json:"productInfo"`
}

type ProductPrice struct {
	ProductID int64
	MinPrice  decimal.Decimal
}

type UserProduct struct {
	ID        int64 `json:"id"`
	UserID    int64 `json:"userId" gorm:"not null;index:idx_user_product_unique,unique,priority:1"`
	ProductID int64 `json:"productId" gorm:"not null;index:idx_user_product_unique,unique,priority:2"`

	BrandID    int64  `json:"brandId"     gorm:"->"`
	CategoryID int64  `json:"categoryId"  gorm:"->"`
	ModelName  string `json:"modelName"   gorm:"->;column:model_name"`

	IsDollar    bool                `json:"isDollar"`
	DollarPrice decimal.NullDecimal `json:"dollarPrice"`
	OtherCosts  decimal.NullDecimal `json:"otherCosts"`
	FinalPrice  decimal.Decimal     `json:"finalPrice"`

	Order     int64        `json:"order"   gorm:"column:order_c"`
	IsHidden  bool         `json:"isHidden"`
	CreatedAt time.Time    `json:"createdAt"`
	UpdatedAt sql.NullTime `json:"updatedAt"`
}

func (UserProduct) TableName() string {
	return "user_product"
}
