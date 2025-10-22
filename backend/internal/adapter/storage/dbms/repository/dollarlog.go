package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"github.com/shopspring/decimal"
)

type DollarLogRepository struct{}

// CreateLog creates a new dollar price log entry
func (r *DollarLogRepository) CreateLog(ctx context.Context, dbSession interface{},
	price decimal.Decimal, apiURL string) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return 0, err
	}

	logEntry := &domain.DollarPriceLog{
		Price:     price,
		SourceAPI: apiURL,
	}

	err = db.Create(logEntry).Error
	if err != nil {
		return 0, err
	}

	return logEntry.ID, nil
}
