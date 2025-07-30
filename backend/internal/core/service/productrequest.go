package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type ProductRequestService struct {
	dbms port.DBMS
	repo port.ProductRequestRepository
	userRepo port.UserRepository
	cityRepo port.CityRepository
}

func RegisterProductRequestService(
	dbms port.DBMS,
	repo port.ProductRequestRepository,
	userRepo port.UserRepository,
	cityRepo port.CityRepository,
	) *ProductRequestService {
	return &ProductRequestService{
		dbms,
		repo,
		userRepo,
		cityRepo,
	}
}

func (prs *ProductRequestService) CreateProductRequest(ctx context.Context,
	request *domain.ProductRequest) (id int64, err error) {
	db, err := prs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = prs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateProductRequest(ctx, request)
		if err != nil {
			return err
		}

		id, err = prs.repo.CreateProductRequest(ctx, txSession, request)
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

func (prs *ProductRequestService) GetProductRequestByID(ctx context.Context, id int64, userId int64) (
	request *domain.ProductRequestViewModel, err error) {
	db, err := prs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = prs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		request, err = prs.repo.GetProductRequestByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return request, nil
}

func (prs *ProductRequestService) DeleteProductRequest(ctx context.Context, ids []int64) (
	err error) {
	db, err := prs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = prs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = prs.repo.DeleteProductRequest(ctx, txSession, ids)
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

func (prs *ProductRequestService) GetAllProductRequests(ctx context.Context) (
	productRequests []*domain.ProductRequest, err error) {
	db, err := prs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = prs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		productRequests, err = prs.repo.GetAllProductRequests(ctx, txSession)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return productRequests, nil
}

func (prs *ProductRequestService) MarkProductRequestAsChecked(ctx context.Context,
	productRequestID int64) (err error) {
	db, err := prs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = prs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		productRequest, err := prs.repo.GetProductRequestByID(ctx, txSession, productRequestID)
		if err != nil {
			return err
		}

		productRequest.State = domain.Checked
		err = prs.repo.UpdateProductRequest(ctx, txSession, &productRequest.ProductRequest)
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

func validateProductRequest(_ context.Context, request *domain.ProductRequest) (err error) {
	if request == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	return nil
}
