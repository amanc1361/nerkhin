package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type SubscriptionRepository struct{}

func (pcr *SubscriptionRepository) CreateSubscription(ctx context.Context, dbSession interface{},
	sub *domain.Subscription) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&sub).Error
	if err != nil {
		return
	}

	id = sub.ID
	return id, nil
}

func (pcr *SubscriptionRepository) UpdateSubscription(ctx context.Context, dbSession interface{},
	sub *domain.Subscription) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Select(
		"price",
	).Updates(sub).Error
	if err != nil {
		return
	}

	return nil
}

func (pcr *SubscriptionRepository) GetSubscriptionByID(ctx context.Context, dbSession interface{},
	id int64) (sub *domain.Subscription, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.Subscription{}).
		Where(&domain.Subscription{ID: id}).
		Take(&sub).Error
	if err != nil {
		return
	}

	return sub, nil
}

func (pcr *SubscriptionRepository) BatchDeleteSubscriptions(ctx context.Context,
	dbSession interface{}, ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.Subscription{}).
		Where("id IN ?", ids).
		Delete(&domain.Subscription{}).Error
	if err != nil {
		return
	}

	return nil
}

func (sr *SubscriptionRepository) GetAllSubscriptions(ctx context.Context,
	dbSession interface{}) (subscriptions []*domain.Subscription, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	subscriptions = []*domain.Subscription{}
	err = db.Model(&domain.Subscription{}).
		Order("number_of_days ASC").
		Scan(&subscriptions).Error
	if err != nil {
		return
	}

	return subscriptions, nil
}
