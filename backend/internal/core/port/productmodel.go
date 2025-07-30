package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ProductModelRepository interface {
	CreateProductModel(ctx context.Context, dbSession interface{}, model *domain.ProductModel) (
		id int64, err error)
	UpdateProductModel(ctx context.Context, dbSession interface{}, model *domain.ProductModel) (
		id int64, err error)
	GetProductModelByID(ctx context.Context, dbSession interface{}, id int64) (
		model *domain.ProductModel, err error)
	DeleteProductModel(ctx context.Context, dbSession interface{}, ids []int64) (err error)
	GetAllProductModels(ctx context.Context, dbSession interface{}, categoryID int64) (
		models []*domain.ProductModel, err error)
	GetProductModelsByIDs(ctx context.Context, dbSession interface{}, ids []int64) (
		models []*domain.ProductModel, err error)
	GetExistingProductModelIDs(ctx context.Context, dbSession interface{}, categoryID int64) (
		modelIDs []int64, err error)
	GetProductModelsByBrandIDs(ctx context.Context, dbSession interface{}, id int64) (models []*domain.ProductModel, err error)
}

type ProductModelService interface {
	CreateProductModel(ctx context.Context, model *domain.ProductModel) (id int64, err error)
	UpdateProductModel(ctx context.Context, model *domain.ProductModel) (id int64, err error)
	GetProductModelByID(ctx context.Context, id int64) (model *domain.ProductModel, err error)
	DeleteProductModel(ctx context.Context, ids []int64) (err error)
	GetAllProductModels(ctx context.Context, categoryID int64) (
		models *domain.ProductModels, err error)
	GetProductModels(ctx context.Context, categoryID int64) (
		models []*domain.ProductModel, err error)
	GetProductModelByBrandId(ctx context.Context,barndId int64)(models []*domain.ProductModel,err error)	
}
