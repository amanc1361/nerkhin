package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ProductRequestRepository struct{}

func (prr *ProductRequestRepository) CreateProductRequest(ctx context.Context, dbSession interface{},
	request *domain.ProductRequest) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&request).Error
	if err != nil {
		return
	}

	id = request.ID
	return id, nil
}

func (prr *ProductRequestRepository) UpdateProductRequest(ctx context.Context, dbSession interface{},
	request *domain.ProductRequest) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Select(
		"description",
		"state_c",
	).Updates(request).Error
	if err != nil {
		return
	}

	return nil
}

func (prr *ProductRequestRepository) GetProductRequestByID(ctx context.Context,
	dbSession interface{}, id int64) (
	request *domain.ProductRequestViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("product_request AS pr").
		Joins("JOIN user_t AS u ON u.id = pr.user_id").
		Joins("JOIN city AS c ON c.id = u.city_id").
		Where("pr.id = ?", id).
		Order("pr.id ASC").
		Select(
			"pr.*",
			"u.full_name    AS user_name",
			"u.phone    	AS phone_number",
			"u.role    		AS user_type",
			"pr.description 	AS description",
			"c.name 		AS city",
		).Take(&request).Error
	if err != nil {
		return
	}

	return request, nil
}

func (prr *ProductRequestRepository) DeleteProductRequest(ctx context.Context, dbSession interface{},
	ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductRequest{}).
		Where("id IN ?", ids).
		Delete(&domain.ProductRequest{}).Error
	if err != nil {
		return
	}

	return nil
}

func (br *ProductRequestRepository) GetAllProductRequests(ctx context.Context, dbSession interface{}) (
	productRequests []*domain.ProductRequest, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductRequest{}).
		Order("id ASC").
		Scan(&productRequests).Error
	if err != nil {
		return
	}
	if productRequests == nil {
		productRequests = []*domain.ProductRequest{}
	}

	return productRequests, nil
}
