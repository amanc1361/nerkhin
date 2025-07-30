package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type FavoriteAccountRepository interface {
	CreateFavoriteAccount(ctx context.Context, db interface{}, favoriteAccount *domain.FavoriteAccount) (id int64, err error)
	DeleteFavoriteAccount(ctx context.Context, db interface{},
		currentUserID int64, targetUserIDs []int64) (err error)
	GetFavoriteAccounts(ctx context.Context, db interface{}, userId int64) (
		favoriteAccounts []*domain.FavoriteAccountViewModel, err error)
	GetMyCustomers(ctx context.Context, db interface{}, userId int64) (
		myCustomers []*domain.MyCustomersViewModel, err error)
	IsShopLiked(ctx context.Context, db interface{}, userID, shopID int64) (isLiked bool, err error)
}

type FavoriteAccountService interface {
	CreateFavoriteAccount(ctx context.Context, favoriteAccount *domain.FavoriteAccount) (id int64, err error)
	DeleteFavoriteAccount(ctx context.Context, currentUserID int64,
		targetUserIDs []int64) (err error)
	GetFavoriteAccounts(ctx context.Context, userId int64) (
		favoriteAccounts []*domain.FavoriteAccountViewModel, err error)
	GetMyCustomers(ctx context.Context, userId int64) (
		myCustomers []*domain.MyCustomersViewModel, err error)
}
