package service

import (
	"context"
	"errors"
	"regexp"

	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
)

var mobilePhoneNumberRegex *regexp.Regexp
var nonMobilePhoneNumberRegex *regexp.Regexp

func init() {
	mobilePhoneNumberRegex = regexp.MustCompile(`^(\+98|0)?9\d{9}$`)
	nonMobilePhoneNumberRegex = regexp.MustCompile(`^0[0-9]{2,}[0-9]{7,}$`)
}

type UserService struct {
	dbms                    port.DBMS
	repo                    port.UserRepository
	appConfig               config.App
	verificationCodeService port.VerificationCodeService
	verificationCodeRepo    port.VerificationCodeRepository
}

func RegisterUserService(dbms port.DBMS, repo port.UserRepository,
	vcService port.VerificationCodeService, verificationCodeRepo port.VerificationCodeRepository,
	appConfig config.App) *UserService {
	return &UserService{
		dbms,
		repo,
		appConfig,
		vcService,
		verificationCodeRepo,
	}
}

func (us *UserService) GetDollarPrice(ctx context.Context, id int64) (dollarPrice string, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		dollarPrice, err = us.repo.GetDollarPrice(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return dollarPrice, nil
}

func (us *UserService) RegisterUser(ctx context.Context, user *domain.User) (id int64, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if user.ID != 0 {
			err = errors.New(msg.ErrDataIsNotValid)
			return err
		}

		err = validateNewUser(ctx, user)
		if err != nil {
			return err
		}

		if user.Role == domain.SuperAdmin || user.Role == domain.Admin {
			return errors.New(msg.ErrNewUserRoleShouldBeRetailerOrWholesaler)
		}

		user.State = domain.NewUser
		id, err = us.repo.CreateUser(ctx, txSession, user)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (us *UserService) UpdateUser(ctx context.Context, user *domain.User) (id int64, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if user.ID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		originalUser, err := us.GetUserByID(ctx, user.ID)
		if err != nil {
			return err
		}

		err = validateExistingUser(ctx, user, originalUser)
		if err != nil {
			return err
		}

		id, err = us.repo.UpdateUser(ctx, txSession, user)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (us *UserService) GetUserByID(ctx context.Context, id int64) (user *domain.User, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		user, err = us.repo.GetUserByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return user, nil
}

func (us *UserService) DeleteUser(ctx context.Context, id int64) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = us.repo.DeleteUser(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}
func (us *UserService) GetUsersByFilter(
	ctx context.Context,
	filter domain.UserFilter,
	page int,
	limit int,
) (users []*domain.UserViewModel, totalCount int64, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	} else if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	users, totalCount, err = us.repo.GetUsersByFilter(ctx, db, filter, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	return users, totalCount, nil
}

func (s *UserService) ChangeUserState(ctx context.Context, userID int64,
	targetState domain.UserState) (err error) {
	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = s.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if userID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		if !domain.IsUserStateValid(targetState) {
			return errors.New(msg.ErrUserStateIsNotValid)
		}

		user, err := s.repo.GetUserByID(ctx, txSession, userID)
		if err != nil {
			return err
		}

		if user.State == targetState {
			return nil
		}

		user.State = targetState
		_, err = s.repo.UpdateUser(ctx, txSession, user)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return nil
}

func (us *UserService) UpdateShop(ctx context.Context, shop *domain.User) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if shop.ID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		err = validatePhoneNumber(shop.ShopPhone1)
		if err != nil {
			return err
		}

		err = validatePhoneNumber(shop.ShopPhone2)
		if err != nil {
			return err
		}

		err = validatePhoneNumber(shop.ShopPhone3)
		if err != nil {
			return err
		}

		originalUser, err := us.repo.GetUserByID(ctx, txSession, shop.ID)
		if err != nil {
			return err
		}

		if originalUser.Role != domain.Wholesaler {
			return errors.New(msg.ErrOnlyWholesalerCanUpdateShop)
		}

		err = us.repo.UpdateShop(ctx, txSession, shop)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return
	}

	return nil
}

func (us *UserService) AddNewUser(ctx context.Context, user *domain.User) (id int64, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if user.ID != 0 {
			err = errors.New(msg.ErrDataIsNotValid)
			return err
		}

		err = validateNewUser(ctx, user)
		if err != nil {
			return err
		}

		if user.Role == domain.SuperAdmin || user.Role == domain.Admin {
			return errors.New(msg.ErrNewUserRoleShouldBeRetailerOrWholesaler)
		}

		user.State = domain.NewUser
		id, err = us.repo.CreateUser(ctx, txSession, user)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (us *UserService) AddNewAdmin(ctx context.Context, user *domain.User) (id int64, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if user.ID != 0 {
			err = errors.New(msg.ErrDataIsNotValid)
			return err
		}

		user.Role = domain.Admin
		user.State = domain.ApprovedUser

		err = validateNewUser(ctx, user)
		if err != nil {
			return err
		}

		id, err = us.repo.CreateUser(ctx, txSession, user)
		if err != nil {
			return err
		}

		err = us.repo.CreateAdminAccess(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (us *UserService) DeleteAdmin(ctx context.Context, adminID int64) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = us.repo.DeleteUser(ctx, txSession, adminID)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}
func (us *UserService) GetUserSubscriptionsWithCity(ctx context.Context, userID int64) ([]domain.UserSubscriptionWithCity, error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return us.repo.GetUserSubscriptionsWithCity(ctx, db, userID)
}

func (us *UserService) FetchUserInfo(ctx context.Context, id int64) (
	user *domain.User, adminAccessInfo *domain.AdminAccess, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		user, err = us.repo.GetUserByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		if user.Role == domain.Admin || user.Role == domain.SuperAdmin {
			adminAccessInfo, err = us.repo.GetAdminAccess(ctx, txSession, user.ID)
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return
	}

	return user, adminAccessInfo, nil
}

func (us *UserService) UpdateDollarPrice(
    ctx context.Context,
    currentUserID int64,
    dollarPrice decimal.NullDecimal,
    dollarUpdate *bool, // nil => تغییر نده
    rounded *bool,      // nil => تغییر نده
) (err error) {
    db, err := us.dbms.NewDB(ctx)
    if err != nil {
        return
    }

    err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
        if currentUserID < 1 {
            return errors.New(msg.ErrDataIsNotValid)
        }

        originalShop, err := us.GetUserByID(ctx, currentUserID)
        if err != nil {
            return err
        }

        // دلار همیشه مثل قبل ست می‌شود
        originalShop.DollarPrice = dollarPrice

        // فلگ‌ها فقط اگر ارسال شده باشند تغییر می‌کنند
        if dollarUpdate != nil {
            originalShop.DollarUpdate = *dollarUpdate
        }
        if rounded != nil {
            originalShop.Rounded = *rounded
        }

        // امضای Repository همان قبلی است
        if err := us.repo.UpdateDollarPrice(ctx, txSession, originalShop); err != nil {
            return err
        }
        return nil
    })

    return
}


func (us *UserService) GetAdminAccess(ctx context.Context, adminID int64) (
	adminAccess *domain.AdminAccess, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		access, err := us.repo.GetAdminAccess(ctx, txSession, adminID)
		if err != nil {
			return err
		}

		adminAccess = access
		return nil
	})
	if err != nil {
		return
	}

	return
}

func (us *UserService) UpdateAdminAccess(ctx context.Context, adminAccess *domain.AdminAccess) (
	err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if adminAccess.UserID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		err := us.repo.UpdateAdminAccess(ctx, txSession, adminAccess)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}

func validateNewUser(_ context.Context, user *domain.User) error {
	match := mobilePhoneNumberRegex.MatchString(user.Phone)
	if !match {
		return errors.New(msg.ErrPhoneIsNotValid)
	}

	if user.CityID < 1 {
		return errors.New(msg.ErrUserCityCannotBeEmpty)
	}

	if valid := domain.IsUserRoleValid(user.Role); !valid {
		return errors.New(msg.ErrUserRoleIsNotValid)
	}

	if user.FullName == "" {
		return errors.New(msg.ErrUserFullNameCannotBeEmpty)
	}

	return nil
}

func validateUserChangeState(_ context.Context, user *domain.User, targetState domain.UserState) (
	err error) {
	isValid := true

	switch targetState {
	case domain.ApprovedUser:
		if user.State != domain.NewUser &&
			user.State != domain.InactiveAccount &&
			user.State != domain.InactiveShop {
			isValid = false
		}
		break
	case domain.RejectedUser:
		if user.State != domain.NewUser {
			isValid = false
		}
		break
	case domain.InactiveAccount:
		if user.State != domain.ApprovedUser {
			isValid = false
		}
		break
	case domain.InactiveShop:
		if user.State != domain.ApprovedUser {
			isValid = false
		}
		break
	}

	if !isValid {
		return errors.New(msg.ErrUserChangeStateIsNotValid)
	}

	return nil
}

func validateExistingUser(_ context.Context, user *domain.User, originalUser *domain.User) error {
	if originalUser.Role == domain.SuperAdmin || originalUser.Role == domain.Admin {
		return nil
	}

	if originalUser.State == domain.InactiveAccount ||
		originalUser.State == domain.InactiveShop ||
		originalUser.State == domain.RejectedUser {
		return errors.New(msg.ErrOperationNotAllowedForThisUser)
	}

	if originalUser.State == domain.NewUser {
		return errors.New(msg.ErrNewUserIsNotAllowedToChangeUserInfo)
	}

	if user.Role != originalUser.Role {
		return errors.New(msg.ErrUpdatingUserRoleIsNotAllowed)
	}

	if user.State != originalUser.State {
		return errors.New(msg.ErrUpdatingUserStateIsNotAllowed)
	}
	return nil
}

func validatePhoneNumber(phone string) error {
	if phone == "" {
		return nil
	}

	mobileMatch := mobilePhoneNumberRegex.MatchString(phone)
	nonMobileMatch := nonMobilePhoneNumberRegex.MatchString(phone)
	if !mobileMatch && !nonMobileMatch {
		return errors.New(msg.ErrPhoneIsNotValid)
	}

	return nil
}
func (us *UserService) UpdateUserDeviceLimit(ctx context.Context, userID int64, limit int) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		// اعتبار سنجی ورودی‌ها
		if userID < 1 || limit < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		// فراخوانی متد ریپازیتوری برای آپدیت در دیتابیس
		return us.repo.UpdateUserDeviceLimit(ctx, txSession, userID, limit)
	})

	return err
}

// ... به انتهای فایل اضافه شود
func (us *UserService) DeleteUserDevice(ctx context.Context, userID int64, deviceID string) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		return us.repo.DeleteUserDevice(ctx, txSession, userID, deviceID)
	})
	return
}

func (us *UserService) GetUserActiveDevices(ctx context.Context, userID int64) (devices []*domain.ActiveDevice, err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	// این یک عملیات فقط خواندنی است، نیازی به تراکنش ندارد
	return us.repo.GetUserActiveDevices(ctx, db, userID)
}

// DeleteAllUserDevices handles the business logic for deleting all of a user's devices.
func (us *UserService) DeleteAllUserDevices(ctx context.Context, userID int64) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if userID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}
		return us.repo.DeleteAllUserDevices(ctx, txSession, userID)
	})
	return
}

// UpdateAllUsersDeviceLimit handles the business logic for updating the device limit for all users.
func (us *UserService) UpdateAllUsersDeviceLimit(ctx context.Context, limit int) (err error) {
	db, err := us.dbms.NewDB(ctx)
	if err != nil {
		return
	}
	err = us.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if limit < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}
		return us.repo.UpdateAllUsersDeviceLimit(ctx, txSession, limit)
	})
	return
}
