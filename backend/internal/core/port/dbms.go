package port

import (
	"context"

	"github.com/nerkhin/internal/adapter/config"
)

type DBMS interface {
	InitDB(ctx context.Context, dbConfig config.DBConfig) (err error)
	NewDB(ctx context.Context) (db interface{}, err error)
	BeginTransaction(ctx context.Context, db interface{}, fn func(txSession interface{}) error) error
	MigrateUp(ctx context.Context, dbConfig config.DBConfig) (err error)
}
