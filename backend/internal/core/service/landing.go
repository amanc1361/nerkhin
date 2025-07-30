package service

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type LandingService struct {
	dbms port.DBMS
	repo port.LandingRepository
}

func RegisterLandingService(dbms port.DBMS,
	repo port.LandingRepository) *LandingService {
	return &LandingService{
		dbms,
		repo,
	}
}



func (ls *LandingService) GetLandingPage(ctx context.Context) (
	landingData *domain.Landing, err error) {
	db, err := ls.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ls.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		landingData, err = ls.repo.GetLandingPage(ctx, txSession)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return landingData, nil
}