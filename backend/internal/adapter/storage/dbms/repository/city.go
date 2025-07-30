package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type CityRepository struct{}

func (cr *CityRepository) CreateCity(ctx context.Context, dbSession interface{},
	city *domain.City) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&city).Error
	if err != nil {
		return
	}

	id = city.ID
	return id, nil
}

func (cr *CityRepository) UpdateCity(ctx context.Context, dbSession interface{},
	city *domain.City) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Updates(city).Error
	if err != nil {
		return
	}

	id = city.ID
	return id, nil
}

func (cr *CityRepository) GetCityByID(ctx context.Context,
	dbSession interface{}, id int64) (
	city *domain.City, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.City{}).
		Where(&domain.City{ID: id}).
		Take(&city).Error
	if err != nil {
		return
	}

	return city, nil
}

func (cr *CityRepository) BatchDeleteCities(ctx context.Context, dbSession interface{},
	ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.City{}).
		Where("id IN ?", ids).
		Delete(&domain.City{}).Error
	if err != nil {
		return
	}

	return nil
}

func (cr *CityRepository) GetAllCities(ctx context.Context, dbSession interface{}) (
	cities []*domain.City, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.City{}).
		Order("id ASC").
		Scan(&cities).Error
	if err != nil {
		return
	}

	return cities, nil
}
