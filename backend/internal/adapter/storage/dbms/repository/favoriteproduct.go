package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type FavoriteProductRepository struct{}

func (fpr *FavoriteProductRepository) CreateFavoriteProduct(ctx context.Context, dbSession interface{},
	favoriteProduct *domain.FavoriteProduct) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&favoriteProduct).Error
	if err != nil {
		return
	}

	id = favoriteProduct.ID
	return id, nil
}

func (fpr *FavoriteProductRepository) BatchDeleteFavoriteProducts(ctx context.Context,
	dbSession interface{}, userID int64, productIDs []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.FavoriteProduct{}).
		Where("user_id = ? AND product_id IN ?", userID, productIDs).
		Delete(&domain.FavoriteProduct{}).Error
	if err != nil {
		return
	}

	return nil
}
func (fpr *FavoriteProductRepository) GetFavoriteProducts(
	ctx context.Context,
	dbSession interface{},
	userID int64,
) (favoriteProducts []*domain.FavoriteProductsViewModel, err error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.WithContext(ctx).
		Table("favorite_product AS fp").
		Joins("JOIN user_t AS u                ON u.id = fp.user_id").
		Joins("JOIN product AS p               ON p.id = fp.product_id").
		Joins("JOIN product_brand AS pb        ON pb.id = p.brand_id").
		Joins("JOIN product_category AS pc     ON pc.id = pb.category_id").
		Where("fp.user_id = ?", userID).
		Select(`
			fp.*,
			pc.title             AS product_category_title,
			pb.title             AS product_brand_title,
			p.model_name         AS product_model_title,      -- جایگزین pm.title
			p.default_image_url  AS product_default_image_url,
			
			p.shops_count        AS product_shops_count,
			p.created_at         AS product_creation_at
		`).
		Order("fp.id ASC").
		Scan(&favoriteProducts).Error

	if err != nil {
		return
	}
	if favoriteProducts == nil {
		favoriteProducts = []*domain.FavoriteProductsViewModel{}
	}
	return favoriteProducts, err
}
