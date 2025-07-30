package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type FavoriteProductRepository interface {
	CreateFavoriteProduct(ctx context.Context, dbSession interface{},
		favoriteProduct *domain.FavoriteProduct) (id int64, err error)
	BatchDeleteFavoriteProducts(ctx context.Context, dbSession interface{}, userID int64,
		productIDs []int64) (err error)
	GetFavoriteProducts(ctx context.Context, dbSession interface{}, userId int64) (
		favoriteProducts []*domain.FavoriteProductsViewModel, err error)
}

type FavoriteProductService interface {
	CreateFavoriteProduct(ctx context.Context, favoriteProduct *domain.FavoriteProduct) (
		id int64, err error)
	BatchDeleteFavoriteProducts(ctx context.Context, userID int64, productIDs []int64) (
		err error)
	GetFavoriteProducts(ctx context.Context, userId int64) (
		favoriteProducts []*domain.FavoriteProductsViewModel, err error)
}
