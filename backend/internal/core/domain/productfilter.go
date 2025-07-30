package domain

type ProductFilterData struct {
	Filter  *ProductFilter         `json:"filter"`
	Options []*ProductFilterOption `json:"options"`
}

type ProductFiltersData struct {
	ProductFilters   []*ProductFilterData `json:"productFilters"`
	SubcategoryTitle string               `json:"subcategoryTitle"`
	CategoryTitle    string               `json:"categoryTitle"`
}

type ProductFilter struct {
	ID          int64  `json:"id"`
	CategoryID  int64  `json:"categoryId"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
}

type ProductFilterOption struct {
	ID       int64  `json:"id"`
	FilterID int64  `json:"filterId"`
	Name     string `json:"name"`
}

type ProductFilterRelationViewModel struct {
	ProductFilterRelation
	FilterName       string `json:"filterName"`
	FilterOptionName string `json:"filterOptionName"`
}

type ProductFilterRelation struct {
	ID             int64 `json:"id"`
	ProductID      int64 `json:"productId"`
	FilterID       int64 `json:"filterId"`
	FilterOptionID int64 `json:"filterOptionId"`
	IsDefault      bool  `json:"isDefault"`
	Filter ProductFilter       `gorm:"foreignKey:FilterID"`
	Option ProductFilterOption `gorm:"foreignKey:FilterOptionID"`
}

type ProductFilterPayload struct {
	NewOptionIDs           []int64
	UpdatedFilterRelations []*ProductFilterRelation
	DeletedOptionIDs       []int64
	DefaultOptionID        int64
}

func (ProductFilter) TableName() string {
	return "product_filter"
}

func (ProductFilterOption) TableName() string {
	return "product_filter_option"
}

func (ProductFilterRelation) TableName() string {
	return "product_filter_relation"
}
