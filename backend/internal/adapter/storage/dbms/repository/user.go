package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"gorm.io/gorm"
)

type UserRepository struct{}

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

// فقط اشتراک‌های فعالِ کاربر، یک رکورد به‌ازای هر شهر (جدیدترین بر اساس expires_at)
func (ur *UserRepository) GetUserSubscriptionsWithCity(
	ctx context.Context,
	dbSession interface{},
	userID int64,
) (subs []domain.UserSubscriptionWithCity, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	// نسخه مخصوص Postgres با DISTINCT ON:
	// - فقط رکوردهای فعال: us.expires_at >= NOW()
	// - یکی به‌ازای هر شهر: DISTINCT ON (us.city_id)
	// - جدیدترین: ORDER BY us.city_id, us.expires_at DESC
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
		// توجه: ترتیب برای DISTINCT ON باید city_id اول بیاد
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

func (ur *UserRepository) BatchDeleteUsers(ctx context.Context, dbSession interface{}, ids []int64) (
	err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.User{}).
		Where("id IN ?", ids).
		Delete(&domain.User{}).Error
	if err != nil {
		return
	}

	return nil
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
		"phone",
		"city_id",
		"role",
		"state_c",
		"full_name",
		"dollar_price",
		"created_at",
	).Select(
		"shop_name",
		"shop_address",
		"shop_phone1",
		"shop_phone2",
		"shop_phone3",
		"telegram_url",
		"instagram_url",
		"whatsapp_url",
		"website_url",
		"latitude",
		"longitude",
		"image_url",
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

	// ====== تنظیم نام جداول/ستون‌ها مطابق دیتابیس خودت ======
	const (
		userTable     = "user_t"       // جدول کاربران شما
		upTable       = "user_product" // جدول user_product(s) شما
		userDollarCol = "dollar_price" // 👈 نام واقعی ستون نرخ دلار در user_t (اگر ‘usd_rate’ است، همین را عوض کن)
		baseDollarCol = "dollar_price" // 👈 قیمت دلاری پایه هر محصول (اگر اسمش چیز دیگری است عوض کن)
		rialCostsCol  = "other_costs"  // 👈 هزینه‌های ریالی (در up)
		finalPriceCol = "final_price"  // 👈 قیمت نهایی (در up)
	)

	return db.Transaction(func(tx *gorm.DB) error {
		// 1) آپدیت نرخ دلار خود کاربر
		if err := tx.Table(userTable).
			Where("id = ?", user.ID).
			Update(userDollarCol, user.DollarPrice).Error; err != nil {
			return err
		}

		// 2) بازمحاسبه قیمت همه محصولات دلاری این کاربر
		// final_price = (base_dollar_price * user_t.dollar) + rial_costs
		raw := fmt.Sprintf(`
			UPDATE %s AS up
			SET %s = (COALESCE(up.%s, 0) * u.%s) + COALESCE(up.%s, 0),
			    updated_at = NOW()
			FROM %s AS u
			WHERE up.user_id = u.id
			  AND up.user_id = ?
			  AND up.is_dollar = TRUE
		`, upTable, finalPriceCol, baseDollarCol, userDollarCol, rialCostsCol, userTable)

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
	err = db.Model(&domain.AdminAccess{}).
		Where("user_id = ?", userID).
		Scan(&adminAccess).Error
	if err != nil {
		return
	}

	if adminAccess == nil {
		err = db.Create(&domain.AdminAccess{
			UserID: userID,
		}).Error
		if err != nil {
			return
		}
	}

	return nil
}

func (*UserRepository) GetAdminAccess(ctx context.Context, dbSession interface{}, adminID int64) (
	adminAccess *domain.AdminAccess, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.AdminAccess{}).
		Where("user_id = ?", adminID).
		Scan(&adminAccess).Error
	if err != nil {
		return
	}

	return adminAccess, nil
}

func (*UserRepository) UpdateAdminAccess(ctx context.Context, dbSession interface{},
	adminAccess *domain.AdminAccess) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Where("user_id = ?", adminAccess.UserID).
		Select(
			"save_product",
			"change_user_state",
			"change_shop_state",
			"change_account_state",
		).Updates(&adminAccess).Error
	if err != nil {
		return
	}

	return nil
}
