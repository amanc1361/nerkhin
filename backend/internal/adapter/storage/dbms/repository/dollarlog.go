package repository

import (
	"context"
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type DollarLogRepository struct{}

func (r *DollarLogRepository) Insert(ctx context.Context, dbSession interface{}, price float64, source string) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	log := &domain.DollarLog{
		Price:  price,
		Source: source,
	}
	return db.Create(log).Error
}

func (r *DollarLogRepository) GetLatest(ctx context.Context, dbSession interface{}) (*domain.DollarLog, error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}
	var log domain.DollarLog
	if err := db.Order("id DESC").First(&log).Error; err != nil {
		return nil, err
	}
	return &log, nil
}
