package dbms

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type PostgresDBMS struct {
	db *gorm.DB
}

var gormLogger = logger.New(
	log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
	logger.Config{
		SlowThreshold:             time.Second, // Slow SQL threshold
		LogLevel:                  logger.Info, // Log level
		IgnoreRecordNotFoundError: false,       // Ignore ErrRecordNotFound error for logger
		ParameterizedQueries:      false,       // Don't include params in the SQL log
		Colorful:                  true,        // Disable color
	},
)

func (p *PostgresDBMS) InitDB(ctx context.Context, dbConfig config.DBConfig) (err error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		dbConfig.Host,
		dbConfig.User,
		dbConfig.Password,
		dbConfig.DBName,
		dbConfig.Port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return
	}

	p.db = db
	return nil
}

func (p *PostgresDBMS) NewDB(ctx context.Context) (interface{}, error) {
	return p.db.Session(&gorm.Session{
		Context: ctx,
		Logger:  gormLogger,
	}), nil
}

func (p *PostgresDBMS) BeginTransaction(ctx context.Context, dbSession interface{},
	fn func(tx interface{}) error) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	tx := db.Begin()
	if err = tx.Error; err != nil {
		return
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	err = fn(tx)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit().Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}
