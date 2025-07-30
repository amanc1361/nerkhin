package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type CityService struct {
	dbms port.DBMS
	repo port.CityRepository
}

func RegisterCityService(dbms port.DBMS,
	repo port.CityRepository) *CityService {
	return &CityService{
		dbms,
		repo,
	}
}

func (cs *CityService) CreateCity(ctx context.Context, city *domain.City) (
	id int64, err error) {
	db, err := cs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = cs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if city == nil || city.ID > 0 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		err = validateCity(ctx, city)
		if err != nil {
			return err
		}

		id, err = cs.repo.CreateCity(ctx, txSession, city)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (cs *CityService) UpdateCity(ctx context.Context, city *domain.City) (
	id int64, err error) {
	db, err := cs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = cs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if city == nil || city.ID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		err = validateCity(ctx, city)
		if err != nil {
			return err
		}

		id, err = cs.repo.UpdateCity(ctx, txSession, city)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (cs *CityService) GetCityByID(ctx context.Context, id int64) (
	city *domain.City, err error) {
	db, err := cs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = cs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if id < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		city, err = cs.repo.GetCityByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return city, nil
}

func (cs *CityService) BatchDeleteCities(ctx context.Context, ids []int64) (err error) {
	db, err := cs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = cs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = cs.repo.BatchDeleteCities(ctx, txSession, ids)
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

func (cs *CityService) GetAllCities(ctx context.Context) (
	cities []*domain.City, err error) {
	db, err := cs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = cs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		cities, err = cs.repo.GetAllCities(ctx, txSession)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return cities, nil
}

func validateCity(_ context.Context, city *domain.City) (err error) {
	if !domain.IsValidCityType(int16(city.Type)) {
		return errors.New(msg.ErrCityTypeIsNotValid)
	}

	return nil
}
