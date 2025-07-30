package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type SubscriptionService struct {
	dbms port.DBMS
	repo port.SubscriptionRepository
}

func RegisterSubscriptionService(dbms port.DBMS,
	repo port.SubscriptionRepository) *SubscriptionService {
	return &SubscriptionService{
		dbms,
		repo,
	}
}

func (ss *SubscriptionService) CreateSubscription(ctx context.Context, sub *domain.Subscription) (
	id int64, err error) {
	db, err := ss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateSubscription(ctx, sub)
		if err != nil {
			return err
		}

		id, err = ss.repo.CreateSubscription(ctx, txSession, sub)
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

func (s *SubscriptionService) UpdateSubscription(ctx context.Context, sub *domain.Subscription) (
	err error) {
	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = s.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateUpdateSubscription(ctx, sub)
		if err != nil {
			return err
		}

		err = s.repo.UpdateSubscription(ctx, txSession, sub)
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

func (ss *SubscriptionService) GetSubscriptionByID(ctx context.Context, id int64) (
	sub *domain.Subscription, err error) {
	db, err := ss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		sub, err = ss.repo.GetSubscriptionByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return sub, nil
}

func (ss *SubscriptionService) BatchDeleteSubscriptions(ctx context.Context, ids []int64) (
	err error) {
	db, err := ss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = ss.repo.BatchDeleteSubscriptions(ctx, txSession, ids)
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

func (ss *SubscriptionService) GetAllSubscriptions(ctx context.Context) (
	subscriptions []*domain.Subscription, err error) {
	db, err := ss.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ss.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		subscriptions, err = ss.repo.GetAllSubscriptions(ctx, txSession)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return subscriptions, nil
}

func validateSubscription(_ context.Context, sub *domain.Subscription) (err error) {
	if sub == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if sub.Price.IsZero() {
		return errors.New(msg.ErrPriceIsNotValid)
	}

	if !domain.IsPeriodValid(int16(sub.NumberOfDays)) {
		return errors.New(msg.ErrSubscriptionPeriodIsNotValid)
	}

	return nil
}

func validateUpdateSubscription(_ context.Context, sub *domain.Subscription) (err error) {
	if sub == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if sub.Price.IsZero() {
		return errors.New(msg.ErrPriceIsNotValid)
	}

	return nil
}
