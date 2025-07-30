package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type LandingRepository interface {
	GetLandingPage(ctx context.Context, dbSession interface{}) (landingData *domain.Landing, err error)
}

type LandingService interface {
	GetLandingPage(ctx context.Context) (landingData *domain.Landing, err error)
}
