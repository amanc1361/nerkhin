package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ProductBrandRepository interface {
	CreateProductBrand(ctx context.Context, dbSession interface{}, brand *domain.ProductBrand) (
		id int64, err error)
	UpdateProductBrand(ctx context.Context, dbSession interface{}, brand *domain.ProductBrand) (
		id int64, err error)
	GetProductBrandByID(ctx context.Context, dbSession interface{}, id int64) (
		brand *domain.ProductBrand, err error)
	DeleteProductBrand(ctx context.Context, dbSession interface{}, ids int64) (err error)
	GetAllProductBrands(ctx context.Context, dbSession interface{}, categoryID int64) (
		brands []*domain.ProductBrand, err error)
	GetProductBrandsByIDs(ctx context.Context, dbSession interface{}, ids []int64) (
		brands []*domain.ProductBrand, err error)
	GetExistingProductBrandIDs(ctx context.Context, dbSession interface{}, categoryID int64) (
		brandIDs []int64, err error)
	GetBrandByCategoryId(ctx context.Context, dbSession interface{}, CategoryID int64) ([]*domain.ProductBrand, error)
	GetProductBrandByTitleAndCategory(ctx context.Context, dbSession interface{}, title string, categoryID int64) (*domain.ProductBrand, error)
}

type ProductBrandService interface {
	CreateProductBrand(ctx context.Context, brand *domain.ProductBrand) (id int64, err error)
	UpdateProductBrand(ctx context.Context, brand *domain.ProductBrand) (id int64, err error)
	GetProductBrandByID(ctx context.Context, id int64) (brand *domain.ProductBrand, err error)
	DeleteProductBrand(ctx context.Context, ids int64) (err error)
	GetAllProductBrands(ctx context.Context, categoryID int64) (
		brands *domain.ProductBrands, err error)
	GetProductBrands(ctx context.Context, categoryID int64) (brands []*domain.ProductBrand, err error)
	GetBrandByCategoryId(ctx context.Context, CategoryID int64) ([]*domain.ProductBrand, error)
}
