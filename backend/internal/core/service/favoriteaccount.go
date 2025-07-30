package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type FavoriteAccountService struct {
	dbms port.DBMS
	repo port.FavoriteAccountRepository
}

func RegisterFavoriteAccountService(dbms port.DBMS,
	repo port.FavoriteAccountRepository) *FavoriteAccountService {
	return &FavoriteAccountService{
		dbms,
		repo,
	}
}

func (fas *FavoriteAccountService) CreateFavoriteAccount(ctx context.Context, favoriteAccount *domain.FavoriteAccount) (
	id int64, err error) {
	db, err := fas.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fas.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateFavoriteAccount(ctx, favoriteAccount)
		if err != nil {
			return err
		}

		id, err = fas.repo.CreateFavoriteAccount(ctx, txSession, favoriteAccount)
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

func (fas *FavoriteAccountService) DeleteFavoriteAccount(ctx context.Context,
	currentUserID int64, targetUserIDs []int64) (err error) {
	db, err := fas.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fas.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = fas.repo.DeleteFavoriteAccount(ctx, txSession, currentUserID, targetUserIDs)
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

func (fas *FavoriteAccountService) GetFavoriteAccounts(ctx context.Context, userId int64) (
	favoriteAccounts []*domain.FavoriteAccountViewModel, err error) {
	db, err := fas.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fas.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		favoriteAccounts, err = fas.repo.GetFavoriteAccounts(ctx, txSession, userId)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return favoriteAccounts, nil
}

func (fas *FavoriteAccountService) GetMyCustomers(ctx context.Context, userId int64) (
	myCustomers []*domain.MyCustomersViewModel, err error) {
	db, err := fas.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fas.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		myCustomers, err = fas.repo.GetMyCustomers(ctx, txSession, userId)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return myCustomers, nil
}

func validateFavoriteAccount(_ context.Context, favoriteAccount *domain.FavoriteAccount) (err error) {
	if favoriteAccount == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if favoriteAccount.UserID == favoriteAccount.TargetUserID {
		return errors.New(msg.ErrLikingOwnShopIsForbidden)
	}

	return nil
}
