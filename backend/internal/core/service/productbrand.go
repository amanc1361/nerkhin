package service

import (
	"context"
	"errors"
	"fmt" // For more detailed errors

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type ProductBrandService struct {
	dbms         port.DBMS
	repo         port.ProductBrandRepository
	categoryRepo port.ProductCategoryRepository
	modelRepo    port.ProductModelRepository // Dependency added for dependency checks
}

// Ensure the service implements the interface at compile time
var _ port.ProductBrandService = (*ProductBrandService)(nil)

func RegisterProductBrandService(
	dbms port.DBMS,
	repo port.ProductBrandRepository,
	categoryRepo port.ProductCategoryRepository,
	modelRepo port.ProductModelRepository, // Add new dependency
) *ProductBrandService {
	return &ProductBrandService{
		dbms:         dbms,
		repo:         repo,
		categoryRepo: categoryRepo,
		modelRepo:    modelRepo, // Add new dependency
	}
}

// CreateProductBrand validates the category before creating a brand.
func (pbs *ProductBrandService) CreateProductBrand(ctx context.Context, brand *domain.ProductBrand) (id int64, err error) {
	if err := validateProductBrand(ctx, brand); err != nil {
		return 0, err
	}
	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return 0, err
	}
	return id, pbs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if brand.CategoryID < 1 {
			return errors.New(msg.ErrBrandCategoryCannotBeEmpty)
		}

		// It's good practice to ensure the category exists before associating a brand with it.
		_, err := pbs.categoryRepo.GetProductCategoryByID(ctx, txSession, brand.CategoryID)
		if err != nil {
			return fmt.Errorf("category with ID %d not found: %w", brand.CategoryID, err)
		}

		id, err = pbs.repo.CreateProductBrand(ctx, txSession, brand)
		return err
	})
}

// UpdateProductBrand updates an existing brand.
func (pbs *ProductBrandService) UpdateProductBrand(ctx context.Context, brand *domain.ProductBrand) (id int64, err error) {
	if err := validateProductBrand(ctx, brand); err != nil {
		return 0, err
	}
	if brand.ID == 0 {
		return 0, errors.New(msg.ErrDataIsNotValid)
	}

	// Transaction is recommended for updates as well if there are multiple steps.
	err = pbs.dbms.BeginTransaction(ctx, nil, func(txSession interface{}) error {
		// This call is now simpler as the repo handles the update directly.
		id, err = pbs.repo.UpdateProductBrand(ctx, txSession, brand)
		return err
	})
	return id, err
}

// GetProductBrandByID fetches a brand by its ID.
func (pbs *ProductBrandService) GetProductBrandByID(ctx context.Context, id int64) (*domain.ProductBrand, error) {
	// A simple read operation might not need a transaction.
	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pbs.repo.GetProductBrandByID(ctx, db, id)
}

// DeleteProductBrand adds a dependency check before deletion.
func (pbs *ProductBrandService) DeleteProductBrand(ctx context.Context, id int64) error {
	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return err
	}
	return pbs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		// Business Logic: Prevent deleting a brand if it has product models associated with it.

		models, err := pbs.modelRepo.GetAllProductModels(ctx, txSession, id)
		if err != nil {
			return err // Error checking for models
		}
		if len(models) > 0 {
			return fmt.Errorf("%s: brand ID %d has %d associated models", msg.ErrProductCategoryHasSubCategories, id, len(models))
		}

		// If no dependencies are found, proceed with deletion.
		return pbs.repo.DeleteProductBrand(ctx, txSession, id)
	})
}

// GetAllProductBrands fetches all brands for a given category.
func (pbs *ProductBrandService) GetAllProductBrands(ctx context.Context, categoryID int64) (*domain.ProductBrands, error) {
	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	var brands *domain.ProductBrands

	brandsList, err := pbs.repo.GetAllProductBrands(ctx, db, categoryID)
	if err != nil {
		return nil, err
	}

	subCategory, err := pbs.categoryRepo.GetProductCategoryByID(ctx, db, categoryID)
	if err != nil {
		return nil, err
	}

	brands = &domain.ProductBrands{
		Brands:           brandsList,
		SubcategoryTitle: subCategory.Title,
	}

	if subCategory.ParentID.Valid {
		category, err := pbs.categoryRepo.GetProductCategoryByID(ctx, db, subCategory.ParentID.Int64)
		if err == nil { // Only assign if the parent is found
			brands.CategoryTitle = category.Title
		}
	}

	return brands, nil
}

// GetProductBrands fetches only brands that have existing products.
func (pbs *ProductBrandService) GetProductBrands(ctx context.Context, categoryID int64) ([]*domain.ProductBrand, error) {
	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	existingBrandIDs, err := pbs.repo.GetExistingProductBrandIDs(ctx, db, categoryID)
	if err != nil {
		return nil, err
	}
	if len(existingBrandIDs) == 0 {
		return []*domain.ProductBrand{}, nil
	}

	return pbs.repo.GetProductBrandsByIDs(ctx, db, existingBrandIDs)
}

// Private helper function for basic validation
func validateProductBrand(_ context.Context, brand *domain.ProductBrand) error {
	if brand == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}
	if brand.Title == "" {
		return errors.New(msg.ErrBrandTitleCannotBeEmpty) // Example of a more specific error
	}
	return nil
}

func (pbs *ProductBrandService) GetBrandByCategoryId(ctx context.Context, CategoryID int64) ([]*domain.ProductBrand, error) {

	db, err := pbs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pbs.repo.GetBrandByCategoryId(ctx, db, CategoryID)
}
