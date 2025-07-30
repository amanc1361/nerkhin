package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type LandingRepository struct{}

func (lr *LandingRepository) GetLandingPage(ctx context.Context, dbSession interface{}) (
	landingData *domain.Landing, err error) {
	landingData = &domain.Landing{}
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("product AS p").
		Count(&landingData.ProductCount).Error
	if err != nil {
		return
	}

	err = db.Table("user_t AS u").
		Where("u.state_c = ? AND u.role = ?", domain.ApprovedUser ,domain.Wholesaler ).
		Count(&landingData.WholesalerCount).Error
	if err != nil {
		return
	}

	err = db.Table("user_t AS u").
		Where("u.state_c = ? AND u.role = ?", domain.ApprovedUser ,domain.Retailer ).
		Count(&landingData.RetailerCount).Error
	if err != nil {
		return
	}

	return landingData, nil
}