package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"gorm.io/gorm"
)

type UserRepository struct{}

// ... CreateUser, UpdateUser, GetUserByID, GetUserSubscriptionsWithCity, GetDollarPrice, GetUserByPhone, DeleteUser remain the same ...
// [Keep all existing functions from CreateUser to DeleteUser here]
func (ur *UserRepository) CreateUser(ctx context.Context, dbSession interface{},
	user *domain.User) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	user.UpdatedAt = time.Now()
	err = db.Create(&user).Error
	if err != nil {
		return
	}

	id = user.ID
	return id, nil
}

func (ur *UserRepository) UpdateUser(ctx context.Context, dbSession interface{},
	user *domain.User) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Omit(
		"role",
		"created_at",
	).Updates(user).Error
	if err != nil {
		return
	}

	id = user.ID
	return id, nil
}

func (ur *UserRepository) GetUserByID(ctx context.Context, dbSession interface{}, id int64) (
	user *domain.User, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	user = &domain.User{}
	err = db.Model(&domain.User{}).
		Where(&domain.User{ID: id}).
		Take(&user).Error
	if err != nil {
		return
	}

	return user, nil
}

func (ur *UserRepository) GetUserSubscriptionsWithCity(
	ctx context.Context,
	dbSession interface{},
	userID int64,
) (subs []domain.UserSubscriptionWithCity, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.
		Table("user_subscription AS us").
		Select(`
            DISTINCT ON (us.city_id)
            us.id,
            us.user_id,
            us.city_id,
            c.name AS city,
            us.subscription_id,
            us.expires_at,
            us.created_at,
            us.updated_at
        `).
		Joins("LEFT JOIN city c ON c.id = us.city_id").
		Where("us.user_id = ? AND us.expires_at >= NOW()", userID).
		Order("us.city_id, us.expires_at DESC").
		Scan(&subs).Error

	return
}

func (ur *UserRepository) GetDollarPrice(ctx context.Context, dbSession interface{}, id int64) (dollarPrice string, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.User{}).
		Where(&domain.User{ID: id}).
		Select("dollar_price").
		Take(&dollarPrice).Error
	if err != nil {
		return
	}

	return dollarPrice, nil
}

func (ur *UserRepository) GetUserByPhone(ctx context.Context, dbSession interface{},
	phone string) (user *domain.User, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.User{}).
		Where(&domain.User{Phone: phone}).
		Take(&user).Error
	if err != nil {
		return
	}

	return user, nil
}

func (ur *UserRepository) DeleteUser(ctx context.Context, dbSession interface{}, id int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	if id == 0 {
		return nil
	}

	err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", id).Delete(&domain.TempAuthority{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteAccount{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", id).Delete(&domain.FavoriteProduct{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", id).Delete(&domain.ProductRequest{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", id).Delete(&domain.UserProduct{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", id).Delete(&domain.PaymentTransactionHistory{}).Error; err != nil {
			return err
		}

		// if err := tx.Where("user_id = ?", id).Delete(&domain.Report{}).Error; err != nil {
		// 	return err
		// }
		if err := tx.Where("user_id = ?", id).Delete(&domain.UserSubscription{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", id).Delete(&domain.User{}).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func (ur *UserRepository) GetUsersByFilter(ctx context.Context, dbSession interface{},
	filter domain.UserFilter, limit int,
	offset int) (users []*domain.UserViewModel, totalCount int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	users = []*domain.UserViewModel{}
	query := db.Table("user_t AS u")
	countQuery := db.Table("user_t AS u")

	applyFilters := func(q *gorm.DB) *gorm.DB {
		if domain.IsUserRoleValid(filter.Role) {
			q = q.Where("u.role = ?", filter.Role)
		}
		if domain.IsUserStateValid(filter.State) {
			q = q.Where("u.state_c = ?", filter.State)
		}
		if filter.SearchText != "" {
			searchQuery := "%" + filter.SearchText + "%"
			q = q.Where("u.phone LIKE ? OR u.full_name LIKE ?", searchQuery, searchQuery)
		}
		if filter.CityID > 0 {
			q = q.Where("u.city_id = ?", filter.CityID)
		}
		return q
	}

	query = applyFilters(query)
	countQuery = applyFilters(countQuery)

	err = countQuery.Count(&totalCount).Error
	if err != nil {
		return nil, 0, err
	}

	if totalCount == 0 {
		return users, 0, nil
	}

	// CHANGED: Added device_limit to the select statement
	err = query.
		Joins("JOIN city AS c ON c.id = u.city_id").
		Order("u.id DESC").
		Limit(limit).
		Offset(offset).
		Select(
			"u.*",
			"c.name AS city_name",
			"CASE WHEN u.state_c = 5 THEN TRUE ELSE FALSE END AS is_active",
		).
		Scan(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, totalCount, nil
}

// ... UpdateShop, UpdateDollarPrice, CreateAdminAccess, GetAdminAccess, UpdateAdminAccess remain the same ...
// [Keep all existing functions from UpdateShop to UpdateAdminAccess here]
func (ur *UserRepository) UpdateShop(ctx context.Context, dbSession interface{},
	user *domain.User) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	userModel, err := ur.GetUserByID(ctx, dbSession, user.ID)
	if err != nil {
		return
	}

	if user.ImageUrl == "" {
		user.ImageUrl = userModel.ImageUrl
	}

	err = db.Omit(
		"phone", "city_id", "role", "state_c", "full_name", "dollar_price", "created_at",
	).Select(
		"shop_name", "shop_address", "shop_phone1", "shop_phone2", "shop_phone3",
		"telegram_url", "instagram_url", "whatsapp_url", "website_url",
		"latitude", "longitude", "image_url",
	).Updates(user).Error
	if err != nil {
		return
	}

	return nil
}

func (ur *UserRepository) UpdateDollarPrice(
	ctx context.Context,
	dbSession interface{},
	user *domain.User,
) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}

	const (
		userTable     = "user_t"
		upTable       = "user_product"
		userDollarCol = "dollar_price" // روی user_t
		baseDollarCol = "dollar_price" // روی user_product (قیمت پایه دلاری ردیف)
		rialCostsCol  = "other_costs"
		finalPriceCol = "final_price"
		colUpdFlag    = "dollar_update"
		colRounded    = "rounded"
	)

	return db.Transaction(func(tx *gorm.DB) error {
		// آپدیت user (مثل قبل + فلگ‌ها)
		if err := tx.Table(userTable).
			Where("id = ?", user.ID).
			Updates(map[string]interface{}{
				userDollarCol: user.DollarPrice,
				colUpdFlag:    user.DollarUpdate,
				colRounded:    user.Rounded,
				"updated_at":  gorm.Expr("NOW()"),
			}).Error; err != nil {
			return err
		}

		// آپدیت قیمت نهایی محصولات:
		// raw_val = up.dollar_price * u.dollar_price + up.other_costs
		// اگر u.rounded=true:
		//   remainder = mod(raw_val, 100000)
		//   final = raw_val - remainder + (remainder > 65000 ? 100000 : 0)
		// اگر u.rounded=false:
		//   final = raw_val (بدون رُند)
		raw := fmt.Sprintf(`
            WITH priced AS (
                SELECT
                    up.id,
                    ((COALESCE(up.%s, 0) * u.%s) + COALESCE(up.%s, 0))::numeric AS raw_val,
                    u.%s AS rounded
                FROM %s AS up
                JOIN %s AS u ON u.id = up.user_id
                WHERE up.user_id = $1
                  AND up.is_dollar = TRUE
            )
            UPDATE %s AS up
            SET %s = CASE
                        WHEN priced.rounded THEN
                            (priced.raw_val - mod(priced.raw_val, 100000)
                             + CASE WHEN mod(priced.raw_val, 100000) > 65000 THEN 100000 ELSE 0 END)
                        ELSE priced.raw_val
                     END,
                updated_at = NOW()
            FROM priced
            WHERE up.id = priced.id
        `, baseDollarCol, userDollarCol, rialCostsCol, colRounded, upTable, userTable, upTable, finalPriceCol)

		if err := tx.Exec(raw, user.ID).Error; err != nil {
			return err
		}
		return nil
	})
}

func (*UserRepository) CreateAdminAccess(ctx context.Context, dbSession interface{}, userID int64) (
	err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	var adminAccess *domain.AdminAccess
	err = db.Model(&domain.AdminAccess{}).Where("user_id = ?", userID).First(&adminAccess).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return db.Create(&domain.AdminAccess{UserID: userID}).Error
		}
		return err
	}
	return nil
}

func (*UserRepository) GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
	adminAccess *domain.AdminAccess, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Model(&domain.AdminAccess{}).Where("user_id = ?", adminID).First(&adminAccess).Error
	return adminAccess, err
}

func (*UserRepository) UpdateAdminAccess(ctx context.Context, dbSession interface{},
	adminAccess *domain.AdminAccess) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Where("user_id = ?", adminAccess.UserID).Select(
		"save_product", "change_user_state", "change_shop_state", "change_account_state",
	).Updates(&adminAccess).Error
	return err
}

// --- ADDED: New functions for device management ---

func (ur *UserRepository) GetUserActiveDevices(ctx context.Context, dbSession interface{}, userID int64) (
	devices []*domain.ActiveDevice, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}
	err = db.Where("user_id = ?", userID).Find(&devices).Error
	return devices, err
}

func (ur *UserRepository) RegisterNewDevice(ctx context.Context, dbSession interface{}, device *domain.ActiveDevice) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Create(device).Error
}

func (ur *UserRepository) UpdateDeviceLastLogin(ctx context.Context, dbSession interface{}, device *domain.ActiveDevice) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Model(&domain.ActiveDevice{}).Where("id = ?", device.ID).Updates(map[string]interface{}{
		"last_login_at": device.LastLoginAt,
		"ip_address":    device.IPAddress,
		"user_agent":    device.UserAgent,
	}).Error
}

func (ur *UserRepository) UpdateUserDeviceLimit(ctx context.Context, dbSession interface{}, userID int64, limit int) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Model(&domain.User{}).Where("id = ?", userID).Update("device_limit", limit).Error
}
func (ur *UserRepository) DeleteUserDevice(ctx context.Context, dbSession interface{}, userID int64, deviceID string) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	result := db.Where("user_id = ? AND device_id = ?", userID, deviceID).Delete(&domain.ActiveDevice{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// DeleteAllUserDevices deletes all active device sessions for a specific user.
func (ur *UserRepository) DeleteAllUserDevices(ctx context.Context, dbSession interface{}, userID int64) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	// This will delete all records from active_devices that match the user_id
	return db.Where("user_id = ?", userID).Delete(&domain.ActiveDevice{}).Error
}

// UpdateAllUsersDeviceLimit updates the device_limit for all non-admin users.
func (ur *UserRepository) UpdateAllUsersDeviceLimit(ctx context.Context, dbSession interface{}, limit int) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	// We exclude SuperAdmins (role=1) and Admins (role=2) from this bulk update.
	return db.Model(&domain.User{}).
		Where("role NOT IN (?)", []domain.UserRole{domain.SuperAdmin, domain.Admin}).
		Update("device_limit", limit).Error
}
