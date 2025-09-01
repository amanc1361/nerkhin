package domain

import (
	"time"
)

type ProductViewModel struct {
	Product
	SubCategoryID    int64                             `json:"subCategoryId"`
	SubCategoryTitle string                            `json:"subCategoryTitle"`
	CategoryTitle    string                            `json:"categoryTitle"`
	BrandTitle       string                            `json:"brandTitle"`
	IsLiked          bool                              `json:"isLiked"`
	FilterRelations  []*ProductFilterRelationViewModel `gorm:"-" json:"filterRelations"`
	Tags             []*ProductTag                     `gorm:"-" json:"tags"`
}
type PaginatedProductsViewModel struct {
	Products   []*ProductViewModel `json:"products"`
	TotalCount int64               `json:"totalCount"`
}
type Product struct {
	ID              int64        `json:"id"`
	ModelName       string       `json:"modelName"`
	BrandID         int64        `json:"brandId"`
	DefaultImageUrl string       `json:"defaultImageUrl"`
	ImagesCount     int          `json:"imagesCount"`
	Description     string       `json:"description"`
	State           ProductState `gorm:"column:state_c" json:"state"`
	LikesCount      int32        `json:"likesCount"`
	ShopsCount      int32        `json:"shopsCount"`
	CreatedAt       time.Time    `json:"createdAt"`
	UpdatedAt       time.Time    `json:"updatedAt"`
}

type ProductFilterQuery struct {
	SearchText string
	Limit      int
	CategoryID int64
	SortOrder  SortOrder
	BrandID    int64
	ModelID    int64
}

type ProductImage struct {
	ID        int64  `json:"id"`
	ProductID int64  `json:"productId"`
	Url       string `json:"url"`
	IsDefault bool   `json:"isDefault"`
}

type ProductTag struct {
	ID        int64  `json:"id"`
	ProductID int64  `json:"productId"`
	Tag       string `json:"tag"`
}

type ProductImagePayload struct {
	NewImages       []*ProductImage
	DeletedImageIDs []int64
}

type ProductTagPayload struct {
	NewTags     []*ProductTag
	DeletedTags []int64
}

type ProductState int16

const (
	Confirmed ProductState = iota + 1
)

func (Product) TableName() string {
	return "product"
}

func (ProductImage) TableName() string {
	return "product_image"
}

func (ProductTag) TableName() string {
	return "product_tag"
}
