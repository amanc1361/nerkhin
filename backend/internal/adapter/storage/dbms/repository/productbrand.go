package repository

import (
	"context"
	"fmt"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ProductBrandRepository struct{}

func (pbr *ProductBrandRepository) CreateProductBrand(ctx context.Context, dbSession interface{},
	brand *domain.ProductBrand) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Create(&brand).Error
	if err != nil {
		return
	}
	id = brand.ID
	return id, nil
}

func (pbr *ProductBrandRepository) UpdateProductBrand(ctx context.Context, dbSession interface{},
	brand *domain.ProductBrand) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Model(&domain.ProductBrand{ID: brand.ID}).Updates(brand).Error
	if err != nil {
		return
	}
	return brand.ID, nil
}

func (pbr *ProductBrandRepository) GetProductBrandByID(
	ctx context.Context,
	dbSession interface{},
	id int64,
) (*domain.ProductBrand, error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}

	brand := &domain.ProductBrand{}
	err = db.Take(brand, id).Error
	if err != nil {
		return nil, err
	}

	return brand, nil
}

func (pbr *ProductBrandRepository) DeleteProductBrand(ctx context.Context, dbSession interface{},
	ids int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Delete(&domain.ProductBrand{}, "id =?", ids).Error
	if err != nil {
		return
	}
	return nil
}

func (pbr *ProductBrandRepository) GetAllProductBrands(ctx context.Context, dbSession interface{},
	categoryID int64) (brands []*domain.ProductBrand, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Model(&domain.ProductBrand{}).
		Where("category_id = ?", categoryID).
		Order("id ASC").
		Find(&brands).Error
	if err != nil {
		return
	}
	if brands == nil {
		brands = []*domain.ProductBrand{}
	}
	return brands, nil
}

func (pbr *ProductBrandRepository) GetProductBrandsByIDs(ctx context.Context, dbSession interface{},
	ids []int64) (brands []*domain.ProductBrand, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Model(&domain.ProductBrand{}).
		Where("id IN ?", ids).
		Order("id ASC").
		Find(&brands).Error
	if err != nil {
		return
	}
	if brands == nil {
		brands = []*domain.ProductBrand{}
	}
	return brands, nil
}

func (pbr *ProductBrandRepository) GetExistingProductBrandIDs(ctx context.Context,
	dbSession interface{}, categoryID int64) (brandIDs []int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	query := db.Table("product AS p").
		Joins("JOIN product_model AS pm ON pm.id = p.model_id").
		Joins("JOIN product_brand AS pb ON pb.id = pm.brand_id").
		Select("DISTINCT(pm.brand_id)") // انتخاب ID های برند منحصر به فرد

	if categoryID > 0 {
		query = query.Where("pb.category_id = ?", categoryID)
	}

	err = query.Pluck("pm.brand_id", &brandIDs).Error
	if err != nil {
		return nil, err
	}

	if brandIDs == nil {
		return []int64{}, nil
	}

	return brandIDs, nil
}
func (pbr *ProductBrandRepository) GetBrandByCategoryId(ctx context.Context, dbSession interface{}, categoryId int64) (brands []*domain.ProductBrand, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}
	fmt.Println("category id in repository")
	fmt.Println(categoryId)
	err = db.Model(&domain.ProductBrand{}).
		Where("category_id=?", categoryId).
		Order("id ASC").
		Find(&brands).Error
	if err != nil {
		return
	}

	return brands, nil
}
