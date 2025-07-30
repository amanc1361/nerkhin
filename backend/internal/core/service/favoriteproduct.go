package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
)

type FavoriteProductService struct {
	dbms            port.DBMS
	repo            port.FavoriteProductRepository
	productRepo     port.ProductRepository
	userProductRepo port.UserProductRepository
}

func RegisterFavoriteProductService(dbms port.DBMS, repo port.FavoriteProductRepository,
	productRepo port.ProductRepository,
	userProductRepo port.UserProductRepository) *FavoriteProductService {
	return &FavoriteProductService{
		dbms,
		repo,
		productRepo,
		userProductRepo,
	}
}

func (fps *FavoriteProductService) CreateFavoriteProduct(ctx context.Context,
	favoriteProduct *domain.FavoriteProduct) (id int64, err error) {
	db, err := fps.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fps.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateFavoriteProduct(ctx, favoriteProduct)
		if err != nil {
			return err
		}

		id, err = fps.repo.CreateFavoriteProduct(ctx, txSession, favoriteProduct)
		if err != nil {
			return err
		}

		targetProduct, err := fps.productRepo.GetProductByID(ctx, txSession, favoriteProduct.ProductID)
		if err != nil {
			return err
		}
		targetProduct.LikesCount++

		err = fps.productRepo.UpdateProduct(ctx, txSession, &targetProduct.Product)
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

func (s *FavoriteProductService) BatchDeleteFavoriteProducts(ctx context.Context, userID int64,
	productIDs []int64) (err error) {
	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = s.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		products, err := s.productRepo.GetProductsByIDs(ctx, txSession, productIDs)
		if err != nil {
			return err
		}

		for _, prod := range products {
			prod.LikesCount--
			err = s.productRepo.UpdateProduct(ctx, txSession, prod)
			if err != nil {
				return err
			}
		}

		err = s.repo.BatchDeleteFavoriteProducts(ctx, txSession, userID, productIDs)
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

func (fps *FavoriteProductService) GetFavoriteProducts(ctx context.Context, userId int64) (
	favoriteProducts []*domain.FavoriteProductsViewModel, err error) {
	db, err := fps.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = fps.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		favoriteProducts, err = fps.repo.GetFavoriteProducts(ctx, txSession, userId)
		if err != nil {
			return err
		}

		productIDs := []int64{}
		for _, fp := range favoriteProducts {
			productIDs = append(productIDs, fp.ProductID)
		}

		productPricesMap, err := fps.userProductRepo.GetProductsPricesMap(ctx, txSession,
			productIDs, []int64{})
		if err != nil {
			return err
		}

		for _, fp := range favoriteProducts {
			price, ok := productPricesMap[fp.ProductID]
			if ok {
				fp.ProductPrice = price
			} else {
				fp.ProductPrice = decimal.Zero
			}
		}

		return nil
	})

	if err != nil {
		return
	}

	return favoriteProducts, nil
}

func validateFavoriteProduct(_ context.Context, favoriteProduct *domain.FavoriteProduct) (err error) {
	if favoriteProduct == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if favoriteProduct.UserID < 1 {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if favoriteProduct.ProductID < 1 {
		return errors.New(msg.ErrDataIsNotValid)
	}

	return nil
}
