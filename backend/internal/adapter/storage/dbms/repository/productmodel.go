package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ProductModelRepository struct{}

func (pmr *ProductModelRepository) CreateProductModel(ctx context.Context, dbSession interface{},
	model *domain.ProductModel) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&model).Error
	if err != nil {
		return
	}

	id = model.ID
	return id, nil
}

func (pmr *ProductModelRepository) UpdateProductModel(ctx context.Context, dbSession interface{},
	model *domain.ProductModel) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductModel{ID: model.ID}).Updates(model).Error
	if err != nil {
		return
	}

	return model.ID, nil
}

func (pmr *ProductModelRepository) GetProductModelByID(ctx context.Context,
	dbSession interface{}, id int64) (
	model *domain.ProductModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Take(&model, id).Error
	if err != nil {
		return
	}

	return model, nil
}

func (pmr *ProductModelRepository) DeleteProductModel(ctx context.Context, dbSession interface{},
	ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	
	err = db.Delete(&domain.ProductModel{}, "id IN ?", ids).Error
	if err != nil {
		return
	}

	return nil
}

func (pmr *ProductModelRepository) GetAllProductModels(ctx context.Context, dbSession interface{},
	brandID int64) (models []*domain.ProductModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	query := db.Model(&domain.ProductModel{})

	if brandID > 0 {
		query = query.Where("brand_id = ?", brandID)
	}

	err = query.Order("id ASC").Find(&models).Error
	if err != nil {
		return
	}

	if models == nil {
		models = []*domain.ProductModel{}
	}

	return models, nil
}

func (pmr *ProductModelRepository) GetProductModelsByIDs(ctx context.Context, dbSession interface{},
	ids []int64) (models []*domain.ProductModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductModel{}).
		Where("id IN ?", ids).
		Order("id ASC").
		Find(&models).Error
	if err != nil {
		return
	}

	return models, nil
}
func (pmr *ProductModelRepository) GetProductModelsByBrandIDs(ctx context.Context, dbSession interface{},
	brandID int64) (models []*domain.ProductModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	

	err = db.Model(&domain.ProductModel{}).
		Where("brand_id = ?", brandID).
		Order("id ASC").
		Find(&models).Error
	if err != nil {
		return
	}

	return models, nil
}
func (pmr *ProductModelRepository) GetExistingProductModelIDs(ctx context.Context,
	dbSession interface{}, categoryID int64) (modelIDs []int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	query := db.Table("product AS p").
		Joins("JOIN product_model AS pm ON pm.id = p.model_id").
		Select("DISTINCT(p.model_id)") 
	if categoryID > 0 {
		query = query.Joins("JOIN product_brand AS pb ON pb.id = pm.brand_id").
			Where("pb.category_id = ?", categoryID)
	}

	err = query.Pluck("p.model_id", &modelIDs).Error
	if err != nil {
		return nil, err
	}

	if modelIDs == nil {
		return []int64{}, nil
	}

	return modelIDs, nil
}