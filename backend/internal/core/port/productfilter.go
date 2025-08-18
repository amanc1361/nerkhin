package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ProductFilterRepository interface {
	CreateProductFilter(ctx context.Context, dbSession interface{},
		filterData *domain.ProductFilterData) (filterID int64, err error)
	CreateProductFilterOption(ctx context.Context, dbSession interface{}, filterOption *domain.ProductFilterOption) (filterOptionId int64, err error)
	UpdateProductFilter(ctx context.Context, dbSession interface{},
		filterData *domain.ProductFilterData) (err error)
	GetAllProductFilters(ctx context.Context, dbSession interface{}, categoryID int64) (
		data []*domain.ProductFilterData, err error)
	BatchDeleteProductFilters(ctx context.Context, dbSession interface{}, filterID int64) (
		err error)
	BatchDeleteProductFilterOptions(ctx context.Context, dbSession interface{},
		filterOptionID int64) (err error)
	GetFilterOptionsByIDs(ctx context.Context, dbSession interface{}, filterOptionIDs []int64) (
		filterOptions []*domain.ProductFilterOption, err error)
	CreateProductFilterRelations(ctx context.Context, dbSession interface{},
		relations []*domain.ProductFilterRelation) (err error)
	UpdateProductFilterRelations(ctx context.Context, dbSession interface{},
		updatedFilterRelations []*domain.ProductFilterRelation, defaultOptionID int64) (err error)
	DeleteProductFilterRelations(ctx context.Context, dbSession interface{},
		deletedOptionID int64) (err error)
	GetProductFilterRelations(ctx context.Context, dbSession interface{}, productID int64) (
		filterRelations []*domain.ProductFilterRelationViewModel, err error)
	GetProductFiltersMapByProductIDs(ctx context.Context, dbSession interface{}, productIDs []int64) (
		dataMap map[int64][]*domain.ProductFilterData, err error)
	GetProductFilterRelationsMapByProductIDs(ctx context.Context, dbSession interface{},
		productIDs []int64) (
		filterRelationsMap map[int64]*domain.ProductFilterRelationViewModel, err error)
	GetFiltersByFilterOptionIDs(ctx context.Context, dbSession interface{},
		filterOptionsIDs []int64) (filters []*domain.ProductFilter, err error)
}

type ProductFilterService interface {
	CreateProductFilter(ctx context.Context, categoryID int64, filterName, filterDisplayName string,
		options []string) (filterID int64, err error)
	CreateProductFilterOption(ctx context.Context, filterOption *domain.ProductFilterOption) (ID int64, err error)
	UpdateProductFilter(ctx context.Context, updatedFilterData *domain.ProductFilterData) (err error)
	GetAllProductFilters(ctx context.Context, categoryID int64) (
		data *domain.ProductFiltersData, err error)
	BatchDeleteProductFilters(ctx context.Context, filterID int64) (err error)
	BatchDeleteProductFilterOptions(ctx context.Context, filterOptionID int64) (err error)
	GetProductFilterRelations(ctx context.Context, txSession interface{}, productID int64) (
		filterRelations []*domain.ProductFilterRelationViewModel, err error)
}
