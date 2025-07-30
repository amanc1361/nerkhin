package repository

import (
	"context"
		"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ProductCategoryRepository struct{}

func (pcr *ProductCategoryRepository) CreateProductCategory(ctx context.Context, dbSession interface{},
	category *domain.ProductCategory) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&category).Error
	if err != nil {
		return
	}

	id = category.ID
	return id, nil
}

func (pcr *ProductCategoryRepository) UpdateProductCategory(ctx context.Context,
	dbSession interface{}, category *domain.ProductCategory) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	
	err = db.Model(&domain.ProductCategory{ID: category.ID}).Updates(category).Error
	if err != nil {
		return
	}

	id = category.ID
	return id, nil
}

func (pcr *ProductCategoryRepository) GetProductCategoryByID(ctx context.Context, dbSession interface{},
	id int64) (category *domain.ProductCategory, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	
	err = db.Take(&category, id).Error
	if err != nil {
		return
	}

	return category, nil
}

func (pcr *ProductCategoryRepository) DeleteProductCategory(ctx context.Context, dbSession interface{},
	ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Delete(&domain.ProductCategory{}, "id IN ?", ids).Error
	if err != nil {
		return
	}

	return nil
}

// فایل: internal/adapter/storage/dbms/repository/product_category_repository.go

// GetCategoriesByFilter حالا فقط یک استراکت فیلتر مشخص می‌پذیرد
func (pcr *ProductCategoryRepository) GetCategoriesByFilter(ctx context.Context,
	dbSession interface{}, filter *domain.ProductCategoryFilter) (
	categories []*domain.ProductCategory, err error) {
	
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}

	query := db.Model(&domain.ProductCategory{})

	// اعمال فیلترها بر اساس فیلدهای استراکت
	if filter != nil {
		if filter.SearchText != "" {
			query = query.Where("title LIKE ?", "%"+filter.SearchText+"%")
		}
		// برای دریافت فقط دسته‌های اصلی
		if filter.OnlyMain {
			query = query.Where("parent_id IS NULL")
		}
		// برای دریافت زیردسته‌های یک والد خاص
		if filter.ParentID > 0 {
			query = query.Where("parent_id = ?", filter.ParentID)
		}
		// برای دریافت زیردسته‌های چندین والد
		if len(filter.ParentIDs) > 0 {
			query = query.Where("parent_id IN ?", filter.ParentIDs)
		}
	}
	
	err = query.Order("id ASC").Find(&categories).Error
	if err != nil {
		return nil, err
	}

	if categories == nil {
		categories = []*domain.ProductCategory{}
	}

	return categories, nil
}



