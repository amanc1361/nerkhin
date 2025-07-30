package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type UserSubscriptionRepository struct{}

func (usr *UserSubscriptionRepository) CreateUserSubscription(ctx context.Context, dbSession interface{},
	userSub *domain.UserSubscription) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&userSub).Error
	if err != nil {
		return
	}

	id = userSub.ID
	return id, nil
}

func (usr *UserSubscriptionRepository) CreatePaymentTransaction(ctx context.Context,
	dbSession interface{}, transaction *domain.PaymentTransactionHistory) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&transaction).Error
	if err != nil {
		return
	}

	id = transaction.ID
	return id, nil
}

func (*UserSubscriptionRepository) GetUserSubscription(ctx context.Context, dbSession interface{},
	userID, cityID int64) (userSubscription *domain.UserSubscription, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.UserSubscription{}).
		Where("user_id = ? AND city_id = ?", userID, cityID).
		Scan(&userSubscription).Error
	if err != nil {
		return
	}

	return userSubscription, nil
}

func (*UserSubscriptionRepository) DeleteUserSubscription(ctx context.Context,
	dbSession interface{}, userSubID int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.UserSubscription{}).
		Where("id = ?", userSubID).
		Delete(&domain.UserSubscription{}).Error
	if err != nil {
		return
	}

	return nil
}

func (*UserSubscriptionRepository) CreateTempAuthority(ctx context.Context, dbSession interface{},
	tempAuthority *domain.TempAuthority) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&tempAuthority).Error
	if err != nil {
		return
	}

	return id, nil
}

func (*UserSubscriptionRepository) GetTempAuthority(ctx context.Context, dbSession interface{}, authority string) (
	tempAuthority *domain.TempAuthority, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.TempAuthority{}).
		Where("authority = ?", authority).
		Scan(&tempAuthority).Error
	if err != nil {
		return
	}

	return tempAuthority, nil
}

func (*UserSubscriptionRepository) DeleteTempAuthority(ctx context.Context, dbSession interface{},
	authority string) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.TempAuthority{}).
		Where("authority = ?", authority).
		Delete(&domain.TempAuthority{}).Error
	if err != nil {
		return
	}

	return nil
}

func (usr *UserSubscriptionRepository) FetchUserPaymentTransactionsHistory(ctx context.Context,
	dbSession interface{}, userId int64) (paymentTransactions []*domain.PaymentTransactionHistoryViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_payment_transaction_history AS pth").
		Joins("JOIN user_t AS u ON u.id = pth.user_id").
		Joins("JOIN city AS c ON c.id = pth.city_id").
		Joins("JOIN user_subscription sub ON sub.user_id = u.id AND sub.city_id = c.id").
		Where("pth.user_id = ?", userId).
		Order("pth.id ASC").
		Select(
			"pth.*",
			"pth.cost_c 		AS cost",
			"u.full_name 		AS full_name",
			"c.name 			AS city",
			"sub.expires_at     AS expiration_date",
		).Scan(&paymentTransactions).Error
	if err != nil {
		return
	}
	if paymentTransactions == nil {
		paymentTransactions = []*domain.PaymentTransactionHistoryViewModel{}
	}

	return paymentTransactions, nil
}

func (usr *UserSubscriptionRepository) FetchUserSubscriptionList(ctx context.Context,
	dbSession interface{}, userId int64) (userSubscriptions []*domain.UserSubscriptionViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_subscription AS us").
		Joins("JOIN subscription AS s ON s.id = us.subscription_id").
		Where("us.user_id = ?", userId).
		Order("us.id ASC").
		Select(
			"us.*",
			"s.price AS price",
			"s.number_of_days AS number_of_days",
		).Scan(&userSubscriptions).Error
	if err != nil {
		return
	}
	if userSubscriptions == nil {
		userSubscriptions = []*domain.UserSubscriptionViewModel{}
	}

	return userSubscriptions, nil
}

func (*UserSubscriptionRepository) GetAllowedCities(ctx context.Context, dbSession interface{},
	currentUserID int64) (cityIDs []int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_subscription us").
		Where("us.user_id = ? AND us.expires_at > NOW()", currentUserID).
		Order("us.id ASC").
		Select("us.city_id").
		Scan(&cityIDs).Error
	if err != nil {
		return
	}
	if cityIDs == nil {
		return []int64{}, nil
	}

	return cityIDs, nil
}

func (*UserSubscriptionRepository) CheckUserAccessToCity(ctx context.Context, dbSession interface{},
	userID, cityID int64) (hasAccess bool, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_subscription us").
		Where("us.user_id = ? AND us.city_id = ? AND us.expires_at > NOW()",
			userID, cityID).
		Select("COUNT(*) > 0").
		Scan(&hasAccess).Error
	if err != nil {
		return
	}

	return hasAccess, nil
}

func (*UserSubscriptionRepository) GetPaymentTransaction(ctx context.Context, dbSession interface{},
	refID string) (transaction *domain.PaymentTransactionHistory, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.PaymentTransactionHistory{}).
		Where("ref_id = ?", refID).
		Scan(&transaction).Error
	if err != nil {
		return
	}

	return transaction, nil
}
