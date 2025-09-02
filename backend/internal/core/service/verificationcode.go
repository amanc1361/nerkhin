package service

import (
	"context"
	"errors"
	"fmt"

	//"github.com/kavenegar/kavenegar-go"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

var STATIC_CODE = "123456"
var CODE_LENGTH = 6

type VerificationCodeService struct {
	dbms      port.DBMS
	repo      port.VerificationCodeRepository
	userRepo  port.UserRepository
	appConfig config.App
}

func RegisterVerificationCodeService(
	dbms port.DBMS,
	repo port.VerificationCodeRepository,
	userRepo port.UserRepository,
	appConfig config.App) port.VerificationCodeService {
	// rand.Seed(time.Now().UnixNano()) // برای تولید کد رندوم واقعی (اگر می‌خواهید استفاده کنید)
	return &VerificationCodeService{
		dbms:      dbms,
		repo:      repo,
		userRepo:  userRepo,
		appConfig: appConfig,
	}
}

func (vc *VerificationCodeService) SendVerificationCode(ctx context.Context, phone string) (codeGenerated string, err error) {
	db, err := vc.dbms.NewDB(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get DB session for sending code: %w", err)
	}

	user, err := vc.userRepo.GetUserByPhone(ctx, db, phone)
	if err != nil {
		if errors.Is(err, errors.New(msg.ErrRecordNotFound)) {
			return "", errors.New(msg.ErrUserDoesNotExist)
		}
		return "", fmt.Errorf("failed to find user by phone before sending code: %w", err)
	}

	codeGenerated = STATIC_CODE

	err = vc.repo.SaveVerificationCode(ctx, db, user.ID, codeGenerated)
	if err != nil {
		return "", fmt.Errorf("failed to save verification code: %w", err)
	}

	// api := kavenegar.New(vc.appConfig.SmsApiKey)
	// receptor := phone
	// template := "otp-code"
	// params := &kavenegar.VerifyLookupParam{}

	// if _, errSend := api.Verify.Lookup(receptor, template, codeGenerated, params); errSend != nil {
	// 	return "", fmt.Errorf("failed to send SMS via Kavenegar: %w", errSend)
	// }

	return codeGenerated, nil
}

func (vc *VerificationCodeService) VerifyCode(ctx context.Context, phone, code string) (
	user *domain.User, adminAccess *domain.AdminAccess, err error) { // <--- تغییر در مقادیر بازگشتی

	db, err := vc.dbms.NewDB(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get DB session for verifying code: %w", err)
	}

	err = vc.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if len(code) != CODE_LENGTH {
			return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
		}

		localUser, txErr := vc.userRepo.GetUserByPhone(ctx, txSession, phone)
		if txErr != nil {
			if errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) { // یا خطای استاندارد "یافت نشد" شما
				return errors.New(msg.ErrUserDoesNotExist)
			}
			return fmt.Errorf("error getting user by phone in transaction: %w", txErr)
		}
		user = localUser

		localAdminAccess, txErr := vc.userRepo.GetAdminAccess(ctx, txSession, user.ID)
		if txErr != nil {
			if !errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) {
				return fmt.Errorf("error getting admin access in transaction: %w", txErr)
			}
		}
		adminAccess = localAdminAccess

		savedCode, txErr := vc.repo.GetVerificationCode(ctx, txSession, user.ID)
		if txErr != nil {
			if errors.Is(txErr, errors.New(msg.ErrRecordNotFound)) {
				return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
			}
			return fmt.Errorf("error getting saved verification code in transaction: %w", txErr)
		}

		if code != savedCode {
			return errors.New(msg.ErrCodeIsWrong)
		}

		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return user, adminAccess, nil
}
