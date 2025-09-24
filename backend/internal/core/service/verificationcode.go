package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/kavenegar/kavenegar-go"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

var CODE_LENGTH = 6

type VerificationCodeService struct {
	dbms      port.DBMS
	repo      port.VerificationCodeRepository
	userRepo  port.UserRepository // CHANGED: userRepo is needed
	appConfig config.App
}

func RegisterVerificationCodeService(
	dbms port.DBMS,
	repo port.VerificationCodeRepository,
	userRepo port.UserRepository, // CHANGED
	appConfig config.App) port.VerificationCodeService {
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
		// This part is correct, if user does not exist, they cannot log in.
		return "", errors.New(msg.ErrUserDoesNotExist)
	}

	codeGenerated = GenerateRandomCode(CODE_LENGTH)

	err = vc.repo.SaveVerificationCode(ctx, db, user.ID, codeGenerated)
	if err != nil {
		return "", fmt.Errorf("failed to save verification code: %w", err)
	}
	api := kavenegar.New(vc.appConfig.SmsApiKey)
	receptor := phone
	template := "otp-code"
	params := &kavenegar.VerifyLookupParam{}

	if _, errSend := api.Verify.Lookup(receptor, template, codeGenerated, params); errSend != nil {
		return "", fmt.Errorf("failed to send SMS via Kavenegar: %w", errSend)
	}

	return codeGenerated, nil
}

// CHANGED: Function signature and logic
func (vc *VerificationCodeService) VerifyCode(ctx context.Context, phone, code, deviceID, userAgent, ipAddress string) (
	user *domain.User, adminAccess *domain.AdminAccess, err error) {

	db, err := vc.dbms.NewDB(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get DB session for verifying code: %w", err)
	}

	err = vc.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if len(code) != CODE_LENGTH {
			return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
		}

		// 1. Get user and verify code (existing logic)
		localUser, txErr := vc.userRepo.GetUserByPhone(ctx, txSession, phone)
		if txErr != nil {
			return errors.New(msg.ErrUserDoesNotExist)
		}
		user = localUser

		savedCode, txErr := vc.repo.GetVerificationCode(ctx, txSession, user.ID)
		if txErr != nil {
			return errors.New(msg.ErrVerificationCodeLengthIsNotValid)
		}

		if code != savedCode {
			return errors.New(msg.ErrCodeIsWrong)
		}

		// 2. NEW LOGIC: Device verification
		activeDevices, txErr := vc.userRepo.GetUserActiveDevices(ctx, txSession, user.ID)
		if txErr != nil {
			return fmt.Errorf("could not check active devices: %w", txErr)
		}

		isDeviceRegistered := false
		var currentDevice *domain.ActiveDevice
		for _, device := range activeDevices {
			if device.DeviceID == deviceID {
				isDeviceRegistered = true
				currentDevice = device
				break
			}
		}

		if isDeviceRegistered {
			// Device is known, just update its last login time
			currentDevice.LastLoginAt = time.Now()
			currentDevice.IPAddress = ipAddress
			currentDevice.UserAgent = userAgent
			if txErr := vc.userRepo.UpdateDeviceLastLogin(ctx, txSession, currentDevice); txErr != nil {
				// Log this error but don't block login
				fmt.Printf("Warning: could not update last login for user %d: %v\n", user.ID, txErr)
			}
		} else {
			// This is a new device, check the limit
			// User's DeviceLimit can be 0, default to 2 in that case.
			limit := user.DeviceLimit
			if limit <= 0 {
				limit = 2
			}

			if len(activeDevices) >= limit {
				// Use a specific error message for this
				return errors.New("شما به حداکثر تعداد دستگاه‌های مجاز برای ورود رسیده‌اید")
			}

			// There's room, register the new device
			newDevice := &domain.ActiveDevice{
				UserID:      user.ID,
				DeviceID:    deviceID,
				UserAgent:   userAgent,
				IPAddress:   ipAddress,
				LastLoginAt: time.Now(),
				CreatedAt:   time.Now(),
			}
			if txErr := vc.userRepo.RegisterNewDevice(ctx, txSession, newDevice); txErr != nil {
				return fmt.Errorf("could not register new device: %w", txErr)
			}
		}

		// 3. Get admin access (existing logic)
		if user.Role == domain.Admin || user.Role == domain.SuperAdmin {
			localAdminAccess, txErr := vc.userRepo.GetAdminAccess(ctx, txSession, user.ID)
			if txErr != nil {
				// If an admin user does not have an access record, it's a critical error.
				return fmt.Errorf("failed to get access record for admin user ID %d: %w", user.ID, txErr)
			}
			adminAccess = localAdminAccess
		}

		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return user, adminAccess, nil
}
