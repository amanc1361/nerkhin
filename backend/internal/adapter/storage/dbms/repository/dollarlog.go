package repository

import (
	"context"
	"fmt"

	"github.com/shopspring/decimal"
)

type DollarLogRepository struct{}

func (r *DollarLogRepository) CreateLog(ctx context.Context, price decimal.Decimal, apiURL string) (int64, error) {

	query := `INSERT INTO dollar_price_logs (price, source_api) VALUES ($1, $2) RETURNING id`
	//err := db.QueryRowContext(ctx, query, price, apiURL).Scan(&id)
	fmt.Println(query)
	return 0, nil
}
