package service

import (
	"context"
	"errors"
	"time"

	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/domain/translate"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
	"github.com/sinabakh/go-zarinpal-checkout"
)

type UserSubscriptionService struct {
	dbms      port.DBMS
	repo      port.UserSubscriptionRepository
	cityRepo  port.CityRepository
	subRepo   port.SubscriptionRepository
	userRepo  port.UserRepository
	appConfig config.App
}

func RegisterUserSubscriptionService(dbms port.DBMS, repo port.UserSubscriptionRepository,
	cityRepo port.CityRepository, subRepo port.SubscriptionRepository, userRepo port.UserRepository,
	appConfig config.App) *UserSubscriptionService {
	return &UserSubscriptionService{
		dbms,
		repo,
		cityRepo,
		subRepo,
		userRepo,
		appConfig,
	}
}

func (uss *UserSubscriptionService) FetchPaymentGatewayInfo(ctx context.Context,
	config *domain.PaymentConfig) (gatewayInfo *domain.PaymentGatewayInfo, err error) {
	db, err := uss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	gatewayInfo = &domain.PaymentGatewayInfo{}

	err = uss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if config.CallBackUrl == "" {
			return errors.New(msg.ErrCallBackUrlShouldNotBeEmpty)
		}

		currentUserSub, err := uss.repo.GetUserSubscription(ctx, txSession,
			config.CurrentUserID, config.CityID)
		if err != nil {
			return err
		}
		if currentUserSub != nil {
			if currentUserSub.ExpiresAt.After(time.Now()) {
				return errors.New(msg.ErrYouHaveAlreadyBoughtSubscriptionForThisCity)
			}
		}

		currentUser, err := uss.userRepo.GetUserByID(ctx, txSession, config.CurrentUserID)
		if err != nil {
			return err
		}

		sub, err := uss.subRepo.GetSubscriptionByID(ctx, txSession, config.SubscriptionID)
		if err != nil {
			return err
		}
		if sub == nil {
			return errors.New(msg.ErrSubscriptionPeriodIsNotValid)
		}

		city, err := uss.cityRepo.GetCityByID(ctx, txSession, config.CityID)
		if err != nil {
			return err
		}
		if city == nil {
			return errors.New(msg.ErrChosenSubscriptionIsNotValid)
		}

		amount := sub.Price
		if currentUser.CityID != config.CityID {
			amount = calculatePriceByCityType(sub.Price, city.Type)
		}

		zarinPay, err := zarinpal.NewZarinpal(uss.appConfig.ZarinPalMerchantID, false)
		if err != nil {
			return err
		}

		message, _ := translate.Translate(uss.appConfig.Lang, msg.SubscriptionPayment)
		url, auth, statusCode, err := zarinPay.NewPaymentRequest(
			int(amount.IntPart()), config.CallBackUrl, message, "", "")
		if err != nil {
			if statusCode == -3 {
				return err
			}

			return err
		}

		gatewayInfo.PaymentUrl = url
		gatewayInfo.Authority = auth

		tempAuth := &domain.TempAuthority{
			Authority:      auth,
			UserID:         config.CurrentUserID,
			CityID:         config.CityID,
			SubscriptionID: config.SubscriptionID,
		}

		_, err = uss.repo.CreateTempAuthority(ctx, txSession, tempAuth)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return gatewayInfo, nil
}

func (uss *UserSubscriptionService) CreateUserSubscription(ctx context.Context, currentUserID int64,
	authority string) (id int64, err error) {
	db, err := uss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = uss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		tempAuth, err := uss.repo.GetTempAuthority(ctx, txSession, authority)
		if err != nil {
			return err
		}

		if tempAuth.UserID != currentUserID {
			return errors.New(msg.ErrDataIsNotValid)
		}

		err = validateTempAuth(ctx, &domain.UserSubscription{
			UserID:         tempAuth.UserID,
			CityID:         tempAuth.CityID,
			SubscriptionID: tempAuth.SubscriptionID,
		})
		if err != nil {
			return err
		}

		user, err := uss.userRepo.GetUserByID(ctx, txSession, tempAuth.UserID)
		if err != nil {
			return err
		}

		sub, err := uss.subRepo.GetSubscriptionByID(ctx, txSession, tempAuth.SubscriptionID)
		if err != nil {
			return err
		}
		if sub == nil {
			return errors.New(msg.ErrSubscriptionPeriodIsNotValid)
		}

		city, err := uss.cityRepo.GetCityByID(ctx, txSession, tempAuth.CityID)
		if err != nil {
			return err
		}
		if city == nil {
			return errors.New(msg.ErrChosenSubscriptionIsNotValid)
		}

		cost := sub.Price
		if user.CityID != tempAuth.CityID {
			cost = calculatePriceByCityType(sub.Price, city.Type)
		}

		refID, isKnownErr, err := verifyPayment(ctx, uss.appConfig.ZarinPalMerchantID, authority, cost)
		if err != nil {
			deleteErr := uss.repo.DeleteTempAuthority(ctx, txSession, authority)
			if deleteErr != nil {
				return deleteErr
			}

			if isKnownErr {
				return err
			} else {
				return errors.New(msg.ErrPaymentHasFailed)
			}
		}

		var firstTimeSubScription bool

		originalUserSub, err := uss.repo.GetUserSubscription(ctx, txSession,
			tempAuth.UserID, tempAuth.CityID)
		if err != nil {
			return err
		}
		if originalUserSub != nil {
			err = uss.repo.DeleteUserSubscription(ctx, txSession, originalUserSub.ID)
			if err != nil {
				return err
			}
		} else {
			firstTimeSubScription = true
		}

		expiresAt := calculateExpiresAt(sub.NumberOfDays)

		if firstTimeSubScription {
			expiresAt = expiresAt.Add(15 * 24 * time.Hour)
		}

		id, err = uss.repo.CreateUserSubscription(ctx, txSession, &domain.UserSubscription{
			UserID:         tempAuth.UserID,
			CityID:         tempAuth.CityID,
			SubscriptionID: tempAuth.SubscriptionID,
			ExpiresAt:      expiresAt,
		})
		if err != nil {
			return err
		}

		transaction := &domain.PaymentTransactionHistory{
			UserID:       tempAuth.UserID,
			CityID:       tempAuth.CityID,
			Cost:         cost,
			RefID:        refID,
			Authority:    authority,
			NumberOfDays: sub.NumberOfDays,
		}
		_, err = uss.repo.CreatePaymentTransaction(ctx, txSession, transaction)
		if err != nil {
			return err
		}

		err = uss.repo.DeleteTempAuthority(ctx, txSession, authority)
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

func (uss *UserSubscriptionService) GetUserSubscriptionsByCityID(ctx context.Context,
	currentUserId, cityID int64) (finalSubscriptions []*domain.Subscription, err error) {
	db, err := uss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = uss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		user, err := uss.userRepo.GetUserByID(ctx, txSession, currentUserId)
		if err != nil {
			return err
		}

		city, err := uss.cityRepo.GetCityByID(ctx, txSession, cityID)
		if err != nil {
			return err
		}

		subs, err := uss.subRepo.GetAllSubscriptions(ctx, txSession)
		if err != nil {
			return err
		}

		if user.CityID != cityID {
			for _, sub := range subs {
				sub.Price = calculatePriceByCityType(sub.Price, city.Type)
			}
		}

		finalSubscriptions = subs
		return nil
	})
	if err != nil {
		return
	}

	return finalSubscriptions, nil
}

func (uss *UserSubscriptionService) FetchUserPaymentTransactionsHistory(ctx context.Context, userId int64) (
	paymentTransactions []*domain.PaymentTransactionHistoryViewModel, err error) {
	db, err := uss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = uss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		paymentTransactions, err = uss.repo.FetchUserPaymentTransactionsHistory(ctx, txSession, userId)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return paymentTransactions, nil
}

func (uss *UserSubscriptionService) FetchUserSubscriptionList(ctx context.Context, userId int64) (
	userSubscriptions []*domain.UserSubscriptionViewModel, err error) {
	db, err := uss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = uss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		userSubscriptions, err = uss.repo.FetchUserSubscriptionList(ctx, txSession, userId)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return userSubscriptions, nil
}

func verifyPayment(_ context.Context, merchantID string,
	authority string, cost decimal.Decimal) (refID string, isKnownErr bool, err error) {
	zarinPay, err := zarinpal.NewZarinpal(merchantID, false)
	if err != nil {
		return
	}

	verified, refID, statusCode, err := zarinPay.PaymentVerification(
		int(cost.IntPart()), authority)
	if err != nil {
		if statusCode == 101 {
			return "", true, errors.New(msg.ErrPaymentTransactionIsAlreadyVerified)
		}

		return "", false, err
	}

	if !verified {
		return "", true, errors.New(msg.ErrPaymentTransactionIsNotVerified)
	}

	return refID, false, nil
}

func validateTempAuth(_ context.Context, userSub *domain.UserSubscription) (err error) {
	if userSub == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if userSub.UserID < 1 {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if userSub.CityID < 1 {
		return errors.New(msg.ErrUserSubscriptionCityIsNotSpecified)
	}

	if userSub.SubscriptionID < 1 {
		return errors.New(msg.ErrUserSubscriptionSubscriptionIsNotSpecified)
	}

	return nil
}

func calculatePriceByCityType(price decimal.Decimal, cityType domain.CityType) decimal.Decimal {
	coefficient := 1
	if cityType == domain.ImportantCity {
		coefficient = 2
	} else if cityType == domain.CountryCapital {
		coefficient = 4
	}

	return price.Mul(decimal.NewFromInt(int64(coefficient)))
}

func calculateExpiresAt(subscriptionPeriod domain.SubscriptionPeriod) time.Time {
	durationToBeAdded := 30 * 24 * time.Hour
	switch subscriptionPeriod {
	case domain.OneMonth:
		durationToBeAdded *= 1
	case domain.ThreeMonths:
		durationToBeAdded *= 3
	case domain.SixMonths:
		durationToBeAdded *= 6
	case domain.OneYear:
		durationToBeAdded *= 12
	default:
	}

	return time.Now().Add(durationToBeAdded)
}
