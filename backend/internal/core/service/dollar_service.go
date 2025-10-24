package service

import (
	"context"
	"encoding/json"
	"errors"

	"io"
	"net/http"

	"github.com/nerkhin/internal/adapter/storage/dbms/repository"
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/port"
)

type DollarService struct {
	dbms        port.DBMS
	repo        *repository.DollarLogRepository
	userRepo    port.UserRepository
	productRepo *repository.ProductRepository
}

func RegisterDollarService(
	dbms port.DBMS,
	repo *repository.DollarLogRepository,
	userRepo port.UserRepository,
	productRepo *repository.ProductRepository,
) *DollarService {
	return &DollarService{
		dbms:        dbms,
		repo:        repo,
		userRepo:    userRepo,
		productRepo: productRepo,
	}
}

// FetchAndUpdateDollar دریافت قیمت دلار از وب‌سرویس، ثبت لاگ و بروزرسانی قیمت‌ها
func (s *DollarService) FetchAndUpdateDollar(ctx context.Context) error {
	resp, err := http.Get("https://webservice.tgnsrv.ir/Pr/Get/nerrkhin1224/n09122751224n")
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var payload map[string]interface{}
	if err := json.Unmarshal(body, &payload); err != nil {
		return err
	}

	priceVal, ok := payload["Dollar"]
	if !ok {
		return errors.New("price not found in response")
	}

	priceFloat, ok := priceVal.(float64)
	if !ok {
		return errors.New("invalid price format")
	}

	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return err
	}

	// همه در یک تراکنش
	return s.dbms.BeginTransaction(ctx, db, func(tx interface{}) error {
		if err := s.repo.Insert(ctx, tx, priceFloat, "tgnsrv.ir"); err != nil {
			return err
		}
		if err := s.updateUsersDollar(ctx, tx, priceFloat); err != nil {
			return err
		}

		// var users []*domain.User
		// db, err := gormutil.CastToGORM(ctx, tx)
		// if err != nil {
		// 	return err
		// }
		// err = db.Table("user_t").
		// 	Where("dollar_update = TRUE").
		// 	Find(&users).Error
		// if err != nil {
		// 	return err
		// }
		// for _, user := range users {
		// 	if !user.DollarPrice.Valid {
		// 		continue
		// 	}

		// 	// آپدیت نرخ دلار در حافظه
		// 	user.DollarPrice.Decimal = decimal.NewFromFloat(priceFloat)

		// 	// بروزرسانی قیمت محصولات دلاری کاربر
		// 	if err := s.userRepo.UpdateDollarPrice(ctx, db, user); err != nil {
		// 		continue
		// 	}
		// }

		return nil
	})
}

// --- private helper ---
func (s *DollarService) updateUsersDollar(ctx context.Context, tx interface{}, price float64) error {
	db, err := gormutil.CastToGORM(ctx, tx)
	if err != nil {
		return err
	}
	// فقط کاربرانی که is_dollar=true هستند
	return db.Exec(`UPDATE user_t SET dollar_price=?, updated_at=NOW() WHERE dollar_update=TRUE`, price).Error
}
