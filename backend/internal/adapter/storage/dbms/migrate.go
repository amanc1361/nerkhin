package dbms

import (
	"context"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/nerkhin/internal/adapter/config"
)

func (p *PostgresDBMS) MigrateUp(ctx context.Context, dbConfig config.DBConfig) (err error) {
	sourceUrl := fmt.Sprintf("file://%v", dbConfig.MigrationsPath)
	databaseUrl := fmt.Sprintf("postgres://%v:%v@%v:%v/%v?sslmode=disable",
		dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.DBName)

	m, err := migrate.New(sourceUrl, databaseUrl)
	if err != nil {
		return
	}

	err = m.Up()
	if err != nil {
		if err.Error() == migrate.ErrNoChange.Error() {
			return nil
		}

		return
	}

	return nil
}
