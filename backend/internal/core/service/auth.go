package service

import (
	"context"
	"errors"
	"regexp"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type AuthService struct {
	dbms      port.DBMS
	userRepo  port.UserRepository
	vcService port.VerificationCodeService
	vcRepo    port.VerificationCodeRepository
}

func RegisterAuthService(dbms port.DBMS, repo port.UserRepository,
	vc port.VerificationCodeService, vcRepo port.VerificationCodeRepository) *AuthService {
	return &AuthService{
		dbms,
		repo,
		vc,
		vcRepo,
	}
}

func (as *AuthService) Login(ctx context.Context, phone string) (
	userID int64, err error) {
	db, err := as.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = as.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = validateUserLogin(ctx, phone)
		if err != nil {
			return err
		}

		user, err := as.userRepo.GetUserByPhone(ctx, txSession, phone)
		if err != nil {
			if err.Error() == msg.ErrRecordNotFound {
				return errors.New(msg.ErrUserDoesNotExist)
			}

			return err
		}

		if user.State != domain.ApprovedUser {
			return errors.New(msg.ErrUserIsNotApprovedYet)
		}

		code, err := as.vcService.SendVerificationCode(ctx, user.Phone)
		if err != nil {
			return errors.New(msg.ErrSendingVerificationCodeFailed)
		}

		err = as.vcRepo.SaveVerificationCode(ctx, txSession, user.ID, code)
		if err != nil {
			return err
		}
		
		if user.Role == domain.Admin {
			err := as.userRepo.CreateAdminAccess(ctx, txSession, user.ID)
			if err != nil {
				return err
			}
		}

		userID = user.ID
		return nil
	})
	if err != nil {
		return
	}

	return userID, nil
}
func (as *AuthService) GetUserByID(ctx context.Context, userID int64) (*domain.User, error) {
	// دریافت یک اتصال دیتابیس (بدون تراکنش، فقط برای خواندن)
	db, err := as.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	// اگر از GORM استفاده می‌کنید، NewDB احتمالاً *gorm.DB را برمی‌گرداند

	// فراخوانی متد ریپازیتوری با اتصال دیتابیس معتبر
	return as.userRepo.GetUserByID(ctx, db, userID)
}

func validateUserLogin(_ context.Context, phone string) (err error) {
	match, err := regexp.MatchString(`^(\+98|0)?9\d{9}$`, phone)
	if err != nil {
		return err
	}
	if !match {
		return errors.New(msg.ErrPhoneIsNotValid)
	}

	return nil
}
