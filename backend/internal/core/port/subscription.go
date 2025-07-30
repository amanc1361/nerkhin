package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type SubscriptionRepository interface {
	CreateSubscription(ctx context.Context, db interface{}, sub *domain.Subscription) (id int64,
		err error)
	UpdateSubscription(ctx context.Context, db interface{}, sub *domain.Subscription) (err error)
	GetSubscriptionByID(ctx context.Context, db interface{}, id int64) (sub *domain.Subscription,
		err error)
	BatchDeleteSubscriptions(ctx context.Context, db interface{}, ids []int64) (err error)
	GetAllSubscriptions(ctx context.Context, dbSession interface{}) (
		subscriptions []*domain.Subscription, err error)
}

type SubscriptionService interface {
	CreateSubscription(ctx context.Context, sub *domain.Subscription) (id int64, err error)
	UpdateSubscription(ctx context.Context, sub *domain.Subscription) (err error)
	GetSubscriptionByID(ctx context.Context, id int64) (sub *domain.Subscription, err error)
	BatchDeleteSubscriptions(ctx context.Context, ids []int64) (err error)
	GetAllSubscriptions(ctx context.Context) (subscriptions []*domain.Subscription, err error)
}
