package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ProductCategoryRepository interface {
	CreateProductCategory(ctx context.Context, db interface{}, category *domain.ProductCategory) (
		id int64, err error)
	UpdateProductCategory(ctx context.Context, db interface{}, category *domain.ProductCategory) (
		id int64, err error)
	GetProductCategoryByID(ctx context.Context, db interface{}, id int64) (
		category *domain.ProductCategory, err error)
	DeleteProductCategory(ctx context.Context, db interface{}, ids []int64) (err error)

	GetCategoriesByFilter(ctx context.Context, dbSession interface{}, filter *domain.ProductCategoryFilter) (categories []*domain.ProductCategory, err error)
  

}

type ProductCategoryService interface {
	CreateProductCategory(ctx context.Context, category *domain.ProductCategory) (id int64, err error)
	UpdateProductCategory(ctx context.Context, category *domain.ProductCategory) (id int64, err error)
	GetProductCategoryByID(ctx context.Context, id int64) (
		category *domain.ProductCategory, err error)
	DeleteProductCategory(ctx context.Context, ids []int64) (err error)
	GetMainCategories(ctx context.Context) (categories []*domain.ProductCategoryViewModel, err error)
	GetCategoriesByFilter(ctx context.Context, filter *domain.ProductCategoryFilter) (
		categories []*domain.ProductCategory, err error)
	GetSubCategoriesByParentID(ctx context.Context, id int64) (
		categories []*domain.ProductCategory, err error)
	GetRelatedBrandModels(ctx context.Context, categoryID int64) (
		brandModels []*domain.BrandModels, err error)
	GetSubCategoriesByParentIDForPanel(ctx context.Context, id int64) (
		categories *domain.ProductCategoryViewModel, err error)
}
