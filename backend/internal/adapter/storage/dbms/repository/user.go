package repository

import (
	"context"
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

func (ur *UserRepository) UpdateDollarPrice(ctx context.Context, dbSession interface{},
	user *domain.User) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Select(
		"dollar_price",
	).Updates(user).Error
	if err != nil {
		return
	}
	err = db.Model(&domain.UserProduct{}).
		Where("user_id = ? AND is_dollar = ?", user.ID, true).
		Update("final_price", gorm.Expr("(base_dollar_price * ?) + other_costs", user.DollarPrice)).Error
	if err != nil {
		return
	}

	return nil
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
