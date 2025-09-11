package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type FavoriteAccountRepository struct{}

func (far *FavoriteAccountRepository) CreateFavoriteAccount(ctx context.Context, dbSession interface{},
	favoriteAccount *domain.FavoriteAccount) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&favoriteAccount).Error
	if err != nil {
		return
	}

	err = db.Exec("UPDATE user_t SET likes_count = likes_count + 1 WHERE id = ?",
		favoriteAccount.TargetUserID).Error
	if err != nil {
		return
	}

	id = favoriteAccount.ID

	return id, nil
}

func (far *FavoriteAccountRepository) DeleteFavoriteAccount(ctx context.Context,
	dbSession interface{}, currentUserID int64, targetUserIDs []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.FavoriteAccount{}).
		Where("user_id = ? AND target_user_id IN ?", currentUserID, targetUserIDs).
		Delete(&domain.FavoriteAccount{}).Error
	if err != nil {
		return
	}

	err = db.Exec("UPDATE user_t SET likes_count = likes_count - 1 WHERE id IN ?", targetUserIDs).Error
	if err != nil {
		return
	}

	return nil
}

func (far *FavoriteAccountRepository) GetFavoriteAccounts(ctx context.Context,
	dbSession interface{}, userId int64) (favoriteAccounts []*domain.FavoriteAccountViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("favorite_account AS fa").
		Joins("JOIN user_t AS tu ON tu.id = fa.target_user_id").
		Where("fa.user_id = ?", userId).
		Order("fa.id ASC").
		Select(
			"fa.*",
			"tu.id AS shop_id",
			"tu.image_url AS shop_image",
			"tu.shop_name AS shop_name",
			"tu.shop_address AS shop_address",
			"tu.shop_phone1 AS shop_phone1",
			"tu.likes_count AS shop_likes_count",
			"tu.created_at AS shop_creation_at",
		).Scan(&favoriteAccounts).Error
	if err != nil {
		return
	}
	if favoriteAccounts == nil {
		favoriteAccounts = []*domain.FavoriteAccountViewModel{}
	}

	return favoriteAccounts, nil
}

func (far *FavoriteAccountRepository) GetMyCustomers(ctx context.Context,
	dbSession interface{}, userId int64) (myCustomers []*domain.MyCustomersViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("favorite_account AS fa").
		Joins("JOIN user_t AS u ON u.id = fa.user_id").
		Where("fa.target_user_id = ?", userId).
		Order("fa.id ASC").
		Select(
			"fa.*",
			"u.full_name AS customer_name",
			"u.role AS customer_shop_type",
		).Scan(&myCustomers).Error
	if err != nil {
		return
	}
	if myCustomers == nil {
		myCustomers = []*domain.MyCustomersViewModel{}
	}

	return myCustomers, nil
}

func (*FavoriteAccountRepository) IsShopLiked(ctx context.Context, dbSession interface{},
	userID, shopID int64) (isLiked bool, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("favorite_account fa").
		Where("fa.user_id = ? AND fa.target_user_id = ?", userID, shopID).
		Select("COALESCE(fa.id, 0) > 0").
		Scan(&isLiked).Error
	if err != nil {
		return
	}

	return isLiked, nil
}
