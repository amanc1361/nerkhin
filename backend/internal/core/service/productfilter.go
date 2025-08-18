package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type ProductFilterService struct {
	dbms         port.DBMS
	repo         port.ProductFilterRepository
	categoryRepo port.ProductCategoryRepository
}

func RegisterProductFilterService(dbms port.DBMS,
	repo port.ProductFilterRepository,
	categoryRepo port.ProductCategoryRepository) *ProductFilterService {
	return &ProductFilterService{
		dbms,
		repo,
		categoryRepo,
	}
}

func (pfs *ProductFilterService) CreateProductFilter(ctx context.Context, categoryID int64,
	filterName, filterDisplayName string, options []string) (filterID int64, err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = pfs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if categoryID < 1 {
			return errors.New(msg.ErrFilterCategoryCannotBeEmpty)
		}

		category, err := pfs.categoryRepo.GetProductCategoryByID(ctx, txSession, categoryID)
		if err != nil {
			return err
		}
		if !category.ParentID.Valid {
			return errors.New(msg.ErrFilterCategoryShouldBeSubCategory)
		}

		filterOptions := []*domain.ProductFilterOption{}
		for _, option := range options {
			filterOptions = append(filterOptions, &domain.ProductFilterOption{
				Name: option,
			})
		}

		displayName := filterDisplayName
		if displayName == "" {
			displayName = filterName
		}
		filterData := &domain.ProductFilterData{
			Filter: &domain.ProductFilter{
				CategoryID:  categoryID,
				Name:        filterName,
				DisplayName: displayName,
			},
			Options: filterOptions,
		}

		err = validateFilterData(ctx, filterData)
		if err != nil {
			return err
		}

		id, err := pfs.repo.CreateProductFilter(ctx, txSession, filterData)
		if err != nil {
			return err
		}

		filterID = id
		return nil
	})
	if err != nil {
		return
	}

	return filterID, nil
}

func (pfs *ProductFilterService) CreateProductFilterOption(ctx context.Context, filterOption *domain.ProductFilterOption) (ID int64, err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	id, err := pfs.repo.CreateProductFilterOption(ctx, db, filterOption)
	if err != nil {
		return 0, err
	}
	return id, nil
}
func (pfs *ProductFilterService) UpdateProductFilter(ctx context.Context,
	updatedFilterData *domain.ProductFilterData) (err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = pfs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateFilterData(ctx, updatedFilterData)
		if err != nil {
			return err
		}

		err := pfs.repo.UpdateProductFilter(ctx, txSession, updatedFilterData)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}

func (pfs *ProductFilterService) GetAllProductFilters(ctx context.Context, categoryID int64) (
	filters *domain.ProductFiltersData, err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	filters = &domain.ProductFiltersData{
		ProductFilters: []*domain.ProductFilterData{},
	}

	err = pfs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if categoryID < 1 {
			return errors.New(msg.ErrFilterCategoryCannotBeEmpty)
		}

		filters.ProductFilters, err = pfs.repo.GetAllProductFilters(ctx, txSession, categoryID)
		if err != nil {
			return err
		}

		subCategory, err := pfs.categoryRepo.GetProductCategoryByID(ctx, txSession, categoryID)
		if err != nil {
			return err
		}
		filters.SubcategoryTitle = subCategory.Title

		category, err := pfs.categoryRepo.GetProductCategoryByID(ctx, txSession, subCategory.ParentID.Int64)
		if err != nil {
			return err
		}
		filters.CategoryTitle = category.Title

		return nil
	})
	if err != nil {
		return
	}

	return filters, nil
}

func (pfs *ProductFilterService) BatchDeleteProductFilters(ctx context.Context, filterID int64) (
	err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = pfs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = pfs.repo.BatchDeleteProductFilters(ctx, txSession, filterID)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return
}

func (pfs *ProductFilterService) BatchDeleteProductFilterOptions(ctx context.Context,
	filterOptionID int64) (err error) {
	db, err := pfs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = pfs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = pfs.repo.BatchDeleteProductFilterOptions(ctx, txSession, filterOptionID)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return
}

func (pfs *ProductFilterService) GetProductFilterRelations(ctx context.Context,
	txSession interface{}, productID int64) (filterRelations []*domain.ProductFilterRelationViewModel,
	err error) {
	if txSession == nil {
		txSession, err = pfs.dbms.NewDB(ctx)
		if err != nil {
			return
		}
	}

	filterRelations, err = pfs.repo.GetProductFilterRelations(ctx, txSession, productID)
	if err != nil {
		return
	}

	return filterRelations, nil
}

func validateFilterData(_ context.Context, filterData *domain.ProductFilterData) (err error) {
	if filterData.Filter.Name == "" {
		return errors.New(msg.ErrFilterNameCannotBeEmpty)
	}

	for _, option := range filterData.Options {
		if option.Name == "" {
			return errors.New(msg.ErrFilterOptionNameCannotBeEmpty)
		}
	}

	return
}
