package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
	"github.com/shopspring/decimal"
)

type UserRepository interface {
	CreateUser(ctx context.Context, dbSession interface{}, user *domain.User) (id int64, err error)
	UpdateUser(ctx context.Context, dbSession interface{}, user *domain.User) (id int64, err error)
	GetUserByID(ctx context.Context, dbSession interface{}, id int64) (user *domain.User, err error)
	GetUserByPhone(ctx context.Context, dbSession interface{}, phone string) (
		user *domain.User, err error)
	DeleteUser(ctx context.Context, dbSession interface{}, id int64) (err error)
	GetUsersByFilter(ctx context.Context, dbSession interface{}, filter domain.UserFilter, limit int,
		offset int) (
		users []*domain.UserViewModel, totalCount int64, err error)
	UpdateShop(ctx context.Context, dbSession interface{}, shop *domain.User) (err error)
	UpdateDollarPrice(ctx context.Context, dbSession interface{}, shop *domain.User) (err error) // Note: This seems to be a duplicate of the one in UserService, ensure it's correct.
	CreateAdminAccess(ctx context.Context, dbSession interface{}, userID int64) (err error)
	GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
		adminAccess *domain.AdminAccess, err error)
	UpdateAdminAccess(ctx context.Context, dbSession interface{}, adminAccess *domain.AdminAccess) (
		err error)
	GetDollarPrice(ctx context.Context, dbSession interface{}, id int64) (dollarPrice string, err error)
	GetUserSubscriptionsWithCity(
		ctx context.Context,
		dbSession interface{},
		userID int64,
	) (subs []domain.UserSubscriptionWithCity, err error)

	// --- ADDED for Device Management ---
	GetUserActiveDevices(ctx context.Context, dbSession interface{}, userID int64) ([]*domain.ActiveDevice, error)
	RegisterNewDevice(ctx context.Context, dbSession interface{}, device *domain.ActiveDevice) error
	UpdateDeviceLastLogin(ctx context.Context, dbSession interface{}, device *domain.ActiveDevice) error
	UpdateUserDeviceLimit(ctx context.Context, dbSession interface{}, userID int64, limit int) error
}

type UserService interface {
	RegisterUser(ctx context.Context, user *domain.User) (id int64, err error)
	UpdateUser(ctx context.Context, user *domain.User) (id int64, err error)
	GetUserByID(ctx context.Context, id int64) (*domain.User, error)
	DeleteUser(ctx context.Context, id int64) (err error)
	GetUsersByFilter(ctx context.Context, filter domain.UserFilter, page int, limit int) (users []*domain.UserViewModel,
		totalCount int64, err error)
	ChangeUserState(ctx context.Context, userID int64, targetState domain.UserState) (err error)
	UpdateShop(ctx context.Context, shop *domain.User) (err error)
	AddNewUser(ctx context.Context, user *domain.User) (id int64, err error)
	AddNewAdmin(ctx context.Context, user *domain.User) (id int64, err error)
	DeleteAdmin(ctx context.Context, adminID int64) (err error)
	FetchUserInfo(ctx context.Context, id int64) (user *domain.User,
		adminAccessInfo *domain.AdminAccess, err error)
	UpdateDollarPrice(ctx context.Context, currentUserID int64,
		dollarPrice decimal.NullDecimal) (err error)
	GetAdminAccess(ctx context.Context, adminId int64) (adminAccess *domain.AdminAccess, err error)
	UpdateAdminAccess(ctx context.Context, adminAccess *domain.AdminAccess) (err error)
	GetDollarPrice(ctx context.Context, id int64) (dollarPrice string, err error)
	GetUserSubscriptionsWithCity(ctx context.Context, userID int64) ([]domain.UserSubscriptionWithCity, error)

	// --- ADDED for Admin Device Limit Management ---
	UpdateUserDeviceLimit(ctx context.Context, userID int64, limit int) error
}

