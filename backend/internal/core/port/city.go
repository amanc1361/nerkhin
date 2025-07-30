package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type CityRepository interface {
	CreateCity(ctx context.Context, db interface{}, city *domain.City) (id int64, err error)
	UpdateCity(ctx context.Context, db interface{}, city *domain.City) (id int64, err error)
	GetCityByID(ctx context.Context, db interface{}, id int64) (city *domain.City, err error)
	BatchDeleteCities(ctx context.Context, db interface{}, ids []int64) (err error)
	GetAllCities(ctx context.Context, db interface{}) (cities []*domain.City, err error)
}

type CityService interface {
	CreateCity(ctx context.Context, city *domain.City) (id int64, err error)
	UpdateCity(ctx context.Context, city *domain.City) (id int64, err error)
	GetCityByID(ctx context.Context, id int64) (city *domain.City, err error)
	BatchDeleteCities(ctx context.Context, ids []int64) (err error)
	GetAllCities(ctx context.Context) (cities []*domain.City, err error)
}
