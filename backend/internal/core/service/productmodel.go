package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

// ProductModelService حالا شامل categoryRepo نیز هست
type ProductModelService struct {
	dbms         port.DBMS
	repo         port.ProductModelRepository
	brandRepo    port.ProductBrandRepository
	productRepo  port.ProductRepository
	categoryRepo port.ProductCategoryRepository // <--- وابستگی جدید اضافه شد
}

var _ port.ProductModelService = (*ProductModelService)(nil)

// RegisterProductModelService حالا categoryRepo را نیز به عنوان ورودی دریافت می‌کند
func RegisterProductModelService(dbms port.DBMS,
	repo port.ProductModelRepository,
	brandRepo port.ProductBrandRepository,
	productRepo port.ProductRepository,
	categoryRepo port.ProductCategoryRepository, // <--- پارامتر جدید اضافه شد
) port.ProductModelService {
	return &ProductModelService{
		dbms:         dbms,
		repo:         repo,
		brandRepo:    brandRepo,
		productRepo:  productRepo,
		categoryRepo: categoryRepo, // <--- وابستگی جدید مقداردهی شد
	}
}

// CreateProductModel با منطق اعتبارسنجی جدید
func (pms *ProductModelService) CreateProductModel(ctx context.Context,
	model *domain.ProductModel) (id int64, err error) {

	if err := validateProductModel(ctx, model); err != nil {
		return 0, err
	}
	db, err := pms.dbms.NewDB(ctx)
	if err != nil {
		return 0, err
	}

	return id, pms.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if model.BrandID < 1 {
			return errors.New(msg.ErrModelBrandCannotBeEmpty)
		}
		// بررسی وجود برند والد
		_, err := pms.brandRepo.GetProductBrandByID(ctx, txSession, model.BrandID)
		if err != nil {
			return fmt.Errorf("brand with id %d not found for model: %w", model.BrandID, err)
		}

		id, err = pms.repo.CreateProductModel(ctx, txSession, model)
		return err
	})
}

// UpdateProductModel
func (pms *ProductModelService) UpdateProductModel(ctx context.Context,
	model *domain.ProductModel) (
	id int64, err error) {

	if err := validateProductModel(ctx, model); err != nil {
		return 0, err
	}
	if model.ID == 0 {
		return 0, errors.New(msg.ErrDataIsNotValid)
	}

	// منطق آپدیت در ریپازیتوری انجام می‌شود
	return pms.repo.UpdateProductModel(ctx, nil, model)
}

// GetProductModelByID
func (pms *ProductModelService) GetProductModelByID(ctx context.Context, id int64) (
	model *domain.ProductModel, err error) {
	db, err := pms.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pms.repo.GetProductModelByID(ctx, db, id)
}
func (pms *ProductModelService) GetProductModelByBrandId(ctx context.Context, brandid int64) (models []*domain.ProductModel, err error) {
	db, err := pms.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pms.repo.GetProductModelsByBrandIDs(ctx, db, brandid)
}

// DeleteProductModel با بررسی وابستگی محصول
func (pms *ProductModelService) DeleteProductModel(ctx context.Context, ids []int64) (err error) {
	return pms.dbms.BeginTransaction(ctx, nil, func(txSession interface{}) error {
		for _, modelID := range ids {
			// بررسی اینکه آیا محصولی به این مدل وابسته است یا خیر
			_, totalCount, err := pms.productRepo.GetProductsByFilter(ctx, txSession, &domain.ProductFilterQuery{ModelID: modelID}, 1, 0)
			if err != nil {
				return err
			}
			if totalCount > 0 {
				return fmt.Errorf("%s: model ID %d has %d associated products", msg.ErrModelHasProducts, modelID, totalCount)
			}
		}
		return pms.repo.DeleteProductModel(ctx, txSession, ids)
	})
}

// GetAllProductModels حالا به درستی از categoryRepo استفاده می‌کند
func (pms *ProductModelService) GetAllProductModels(ctx context.Context, brandID int64) (
	models *domain.ProductModels, err error) {
	db, err := pms.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	if brandID < 1 {
		return nil, errors.New(msg.ErrModelBrandCannotBeEmpty)
	}

	modelsList, err := pms.repo.GetAllProductModels(ctx, db, brandID)
	if err != nil {
		return nil, err
	}

	brand, err := pms.brandRepo.GetProductBrandByID(ctx, db, brandID)
	if err != nil {
		return nil, err
	}

	// حالا pms.categoryRepo در دسترس است و می‌توان از آن استفاده کرد
	category, err := pms.categoryRepo.GetProductCategoryByID(ctx, db, brand.CategoryID)
	if err != nil {
		// اگر دسته یافت نشد، بهتر است خطا را برگردانیم تا مشکل مشخص شود
		return nil, fmt.Errorf("could not find category for brand %s: %w", brand.Title, err)
	}

	return &domain.ProductModels{
		Models:        modelsList,
		BrandTitle:    brand.Title,
		CategoryTitle: category.Title,
	}, nil
}

// GetProductModels
func (pms *ProductModelService) GetProductModels(ctx context.Context, categoryID int64) (
	models []*domain.ProductModel, err error) {
	db, err := pms.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	existingModelIDs, err := pms.repo.GetExistingProductModelIDs(ctx, db, categoryID)
	if err != nil {
		return
	}
	if len(existingModelIDs) == 0 {
		return []*domain.ProductModel{}, nil
	}

	return pms.repo.GetProductModelsByIDs(ctx, db, existingModelIDs)
}

// تابع کمکی برای اعتبارسنجی
func validateProductModel(_ context.Context, model *domain.ProductModel) (err error) {
	if model == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}
	if model.Title == "" {
		return errors.New(msg.ErrModelTitleCannotBeEmpty)
	}
	return nil
}
