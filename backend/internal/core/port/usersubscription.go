package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type UserSubscriptionRepository interface {
	CreateUserSubscription(ctx context.Context, db interface{}, userSub *domain.UserSubscription) (id int64,
		err error)
	CreatePaymentTransaction(ctx context.Context, db interface{},
		transaction *domain.PaymentTransactionHistory) (id int64, err error)
	GetUserSubscription(ctx context.Context, dbSession interface{}, userID, cityID int64) (
		userSubscription *domain.UserSubscription, err error)
	DeleteUserSubscription(ctx context.Context, dbSession interface{}, userSubID int64) (err error)
	CreateTempAuthority(ctx context.Context, dbSession interface{},
		tempAuthority *domain.TempAuthority) (id int64, err error)
	GetTempAuthority(ctx context.Context, dbSession interface{}, authority string) (
		tempAuthority *domain.TempAuthority, err error)
	DeleteTempAuthority(ctx context.Context, dbSession interface{}, authority string) (err error)
	FetchUserPaymentTransactionsHistory(ctx context.Context, dbSession interface{}, userId int64) (
		paymentTransactions []*domain.PaymentTransactionHistoryViewModel, err error)
	FetchUserSubscriptionList(ctx context.Context, dbSession interface{}, userId int64) (
		userSubscriptions []*domain.UserSubscriptionViewModel, err error)
	GetAllowedCities(ctx context.Context, dbSession interface{}, currentUserID int64) (
		cityIDs []int64, err error)
	CheckUserAccessToCity(ctx context.Context, dbSession interface{}, userID, cityID int64) (
		hasAccess bool, err error)
}

type UserSubscriptionService interface {
	FetchPaymentGatewayInfo(ctx context.Context, config *domain.PaymentConfig) (
		gatewayInfo *domain.PaymentGatewayInfo, err error)
	CreateUserSubscription(ctx context.Context, currentUserID int64, authority string) (
		id int64, err error)
	GetUserSubscriptionsByCityID(ctx context.Context, userId, cityID int64) (
		userSubs []*domain.Subscription, err error)
	FetchUserPaymentTransactionsHistory(ctx context.Context, userId int64) (
		paymentTransactions []*domain.PaymentTransactionHistoryViewModel, err error)
	FetchUserSubscriptionList(ctx context.Context, userId int64) (
		userSubscriptions []*domain.UserSubscriptionViewModel, err error)
}
