package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"github.com/shopspring/decimal"
)

type UserProductRepository struct{}

func (upr *UserProductRepository) CreateUserProduct(ctx context.Context, dbSession interface{},
	userProduct *domain.UserProduct) (id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&userProduct).Error
	if err != nil {
		return
	}

	id = userProduct.ID
	return id, nil
}

func (pr *UserProductRepository) FetchShopProducts(ctx context.Context, dbSession interface{},
	id int64) (products []*domain.UserProductView, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Joins("JOIN product p ON p.id = up.product_id").
		Joins("JOIN product_category pc ON pc.id = p.category_id").
		Joins("JOIN product_brand pb ON pb.id = p.brand_id").
		Joins("JOIN product_model pm ON pm.id = p.model_id").
		Where("up.user_id = ?", id).
		Order("up.id ASC").
		Select(
			"up.*",
			"p.category_id        		AS category_id",
			"p.brand_id        			AS brand_id",
			"p.model_id        			AS model_id",
			"pc.title 					AS product_category",
			"pb.title 					AS product_brand",
			"pm.title 					AS product_model",
			"p.default_image_url 		AS default_image_url",
			"p.description 				AS description",
			"p.shops_count              AS shops_count",
		).
		Order("up.order_c ASC").
		Scan(&products).Error
	if err != nil {
		return
	}

	return products, nil
}

func (upr *UserProductRepository) FetchUserProduct(ctx context.Context, dbSession interface{},
	userId int64, productId int64) (userProduct *domain.UserProduct, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Where("up.user_id = ? AND up.product_id = ?", userId, productId).
		Take(&userProduct).Error
	if err != nil {
		return
	}

	return userProduct, nil
}

func (upr *UserProductRepository) ChangeOrder(ctx context.Context, dbSession interface{},
	userProductID int64, order int64) (
	err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	originalRequest, err := upr.FetchUserProductById(ctx, db, userProductID)
	if err != nil {
		return
	}

	originalRequest.Order = order

	err = db.Save(originalRequest.UserProduct).Error
	if err != nil {
		return
	}

	return nil
}

// این کد را در فایل internal/adapter/storage/dbms/repository/user_product_repository.go قرار دهید

// GetProductsByFilter با ساختار جدید، صفحه‌بندی و شمارش صحیح
func (ur *UserProductRepository) GetProductsByFilter(ctx context.Context, dbSession interface{},
	filter *domain.UserProductFilter) (products []*domain.SearchProductViewModel, totalCount int64, err error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, 0, err
	}

	products = []*domain.SearchProductViewModel{}

	// ساخت کوئری پایه با JOIN های صحیح بر اساس سلسله مراتب جدید
	baseQuery := db.Table("user_product AS up").
		Joins("JOIN product AS p ON p.id = up.product_id").
		Joins("JOIN product_model AS pm ON pm.id = p.model_id").
		Joins("JOIN product_brand AS pb ON pb.id = pm.brand_id").
		Joins("JOIN product_category AS pc ON pc.id = pb.category_id")

	// اعمال فیلترهای اولیه که همیشه باید وجود داشته باشند
	filteredQuery := baseQuery.Where("up.product_id IN ?", filter.AllowedProductIDs)

	// اعمال فیلترهای اختیاری
	if filter.CategoryID > 0 {
		// فیلتر بر اساس دسته حالا از طریق جدول برندها (pb) انجام می‌شود
		filteredQuery = filteredQuery.Where("pb.category_id = ?", filter.CategoryID)
	}
	if filter.BrandIDs > 0 {
		filteredQuery = filteredQuery.Where("pm.brand_id IN ?", filter.BrandIDs)
	}
	if filter.ModelIDs > 0 {
		filteredQuery = filteredQuery.Where("p.model_id IN ?", filter.ModelIDs)
	}
	if filter.SearchText != "" {
		searchQuery := "%" + filter.SearchText + "%"
		// جستجو در توضیحات محصول، عنوان برند و عنوان مدل
		filteredQuery = filteredQuery.Where("p.description LIKE ? OR pb.title LIKE ? OR pm.title LIKE ?", searchQuery, searchQuery, searchQuery)
	}

	// 1. شمارش تعداد کل نتایج مطابق با فیلتر (قبل از اعمال Limit و Offset)
	err = filteredQuery.Model(&domain.UserProduct{}).Count(&totalCount).Error
	if err != nil {
		return nil, 0, err
	}
	if totalCount == 0 {
		return products, 0, nil // اگر نتیجه‌ای نبود، سریعاً خارج شو
	}

	// 2. اعمال مرتب‌سازی و صفحه‌بندی برای دریافت داده‌های صفحه فعلی
	dataQuery := filteredQuery
	if filter.SortOrder == domain.ASC {
		dataQuery = dataQuery.Order("up.created_at ASC")
	} else { // پیش‌فرض یا DESC
		dataQuery = dataQuery.Order("up.created_at DESC")
	}

	err = dataQuery.
		Limit(filter.Limit).   // <--- اعمال Limit
		Offset(filter.Offset). // <--- اعمال Offset
		Select(
			"up.*", // انتخاب تمام فیلدهای user_product
			"p.id AS product_id",
			"p.default_image_url",
			"p.description",
			"pm.title AS model_title",
			"pb.title AS brand_title",
			"pc.title AS category_title",
			// شما می‌توانید سایر فیلدهای لازم را هم در اینجا Select کنید
		).
		Scan(&products).Error
	if err != nil {
		return nil, 0, err
	}

	return products, totalCount, nil
}
func (upr *UserProductRepository) FetchShops(ctx context.Context, dbSession interface{},
	productId int64, allowedCityIDs []int64) (
	shopProducts []*domain.ShopProduct, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Joins("JOIN product p ON p.id = up.product_id").
		Joins("JOIN product_brand pb ON pb.id = p.brand_id").
		Joins("JOIN product_model pm ON pm.id = p.model_id").
		Joins("JOIN user_t u ON u.id = up.user_id").
		Joins("LEFT JOIN user_subscription us ON us.user_id = u.id").
		Joins("JOIN city c ON c.id = u.city_id").
		Where("up.product_id = ? AND c.id IN ?",
			productId, allowedCityIDs).
		Where("us.expires_at > NOW()").
		Order("up.id ASC").
		Select(
			"up.*",
			"p.default_image_url    AS default_image_url",
			"u.shop_name 			AS shop_name",
			"u.shop_city 			AS shop_city",
			"u.shop_phone1 			AS shop_phone1",
			"u.shop_phone2 			AS shop_phone2",
			"u.shop_phone3 			AS shop_phone3",
			"u.like_count 			AS like_count",
		).Scan(&shopProducts).Error
	if err != nil {
		return
	}
	if shopProducts == nil {
		return []*domain.ShopProduct{}, nil
	}

	return shopProducts, nil
}

func (upr *UserProductRepository) GetProductShops(ctx context.Context,
	dbSession interface{}, productID int64, allowedCityIDs []int64) (
	shopProducts []*domain.ProductShop, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Joins("JOIN product AS p ON p.id = up.product_id").
		Joins("JOIN user_t AS u ON u.id = up.user_id").
		Joins("LEFT JOIN user_subscription us ON us.user_id = u.id").
		Joins("JOIN city AS c ON c.id = u.city_id").
		Where("up.product_id = ? AND c.id IN ?", productID, allowedCityIDs).
		Where("us.expires_at > NOW()").
		Group("up.id, u.id, c.id").
		Order("up.id ASC").
		Select(
			"up.user_id 		  AS id",
			"up.user_id",
			"MIN(up.final_price)  AS final_price",
			"u.image_url          AS default_image_url",
			"c.name               AS shop_city",
			"u.shop_phone1        AS shop_phone1",
			"u.shop_phone2        AS shop_phone2",
			"u.shop_phone3        AS shop_phone3",
			"u.shop_name",
			"u.likes_count",
			"up.updated_at",
		).Scan(&shopProducts).Error
	if err != nil {
		return
	}
	return shopProducts, nil
}

func (pr *UserProductRepository) GetPriceList(ctx context.Context, dbSession interface{},
	userId int64) (priceList []*domain.UserProductView, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Joins("JOIN product p ON p.id = up.product_id").
		Joins("JOIN product_category pc ON pc.id = p.category_id").
		Joins("JOIN product_brand pb ON pb.id = p.brand_id").
		Joins("JOIN product_model pm ON pm.id = p.model_id").
		Joins("JOIN user_t u ON u.id = up.user_id").
		Joins("LEFT JOIN user_subscription us ON us.user_id = u.id").
		Joins("JOIN city c ON c.id = u.city_id").
		Where("up.is_hidden = FALSE AND up.user_id = ?", userId).
		Where("us.expires_at > NOW()").
		Order("up.id ASC").
		Select(
			"up.*",
			"p.category_id 		AS category_id",
			"p.brand_id 			AS brand_id",
			"p.model_id 			AS model_id",
			"pc.title 				AS product_category",
			"pb.title 				AS product_brand",
			"pm.title 				AS product_model",
		).
		Scan(&priceList).Error
	if err != nil {
		return
	}

	return priceList, nil
}

func (pr *UserProductRepository) GetUserProductByID(ctx context.Context, dbSession interface{}, userProductID int64) (
	userProduct *domain.UserProduct, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.UserProduct{}).
		Where("id = ?", userProductID).
		Scan(&userProduct).Error
	if err != nil {
		return
	}

	return userProduct, nil
}

func (*UserProductRepository) GetMaxOrder(ctx context.Context, txSession interface{},
	userID int64) (maxOrder int64, err error) {
	db, err := gormutil.CastToGORM(ctx, txSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.UserProduct{}).
		Where("user_id = ?", userID).
		Select("COALESCE(MAX(order_c), 0)").
		Scan(&maxOrder).Error
	if err != nil {
		return
	}

	return maxOrder, nil
}

func (*UserProductRepository) UpdateUserProduct(ctx context.Context, txSession interface{},
	userProduct *domain.UserProduct) (err error) {
	db, err := gormutil.CastToGORM(ctx, txSession)
	if err != nil {
		return
	}

	err = db.Select(
		"dollar_price",
		"other_costs",
		"final_price",
		"is_hidden",
		"is_dollar",
	).Updates(userProduct).Error
	if err != nil {
		return
	}

	return nil
}

func (upr *UserProductRepository) FetchUserProductById(ctx context.Context,
	dbSession interface{}, upId int64) (
	userProduct *domain.UserProductView, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Joins("JOIN product AS p ON p.id = up.product_id").
		Joins("JOIN product_category AS pc ON pc.id = p.category_id").
		Joins("JOIN product_brand AS pb ON pb.id = p.brand_id").
		Joins("JOIN product_model AS pm ON pm.id = p.model_id").
		Where("up.id = ?", upId).
		Select(
			"up.*",
			"p.category_id    AS category_id",
			"p.brand_id    		AS brand_id",
			"p.model_id    		AS model_id",
			"p.description 		AS description",
			"pc.title 				AS product_category",
			"pb.title 				AS product_brand",
			"pm.title 				AS product_model",
		).Take(&userProduct).Error

	if err != nil {
		return
	}

	return userProduct, nil
}

func (upr *UserProductRepository) BatchDeleteUserProduct(ctx context.Context, dbSession interface{},
	id int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.UserProduct{}).
		Where("id = ?", id).
		Delete(&domain.UserProduct{}).Error
	if err != nil {
		return
	}

	return nil
}

func (upr *UserProductRepository) GetUserProductIdsByOrder(ctx context.Context, dbSession interface{},
	order int64) (ids []int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product AS up").
		Where("up.order > ?", order).
		Select(
			"up.id",
		).Take(&ids).Error

	if err != nil {
		return
	}

	return ids, nil
}

func (upr *UserProductRepository) GetProductsPricesMap(ctx context.Context, dbSession interface{},
	productIDs, allowedCityIDs []int64) (productPriceMap map[int64]decimal.Decimal, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	productPrices := []*domain.ProductPrice{}
	query := db.Table("user_product up").
		Joins("JOIN user_t u ON u.id = up.user_id").
		Joins("LEFT JOIN user_subscription us ON us.user_id = u.id").
		Joins("JOIN city c ON c.id = u.city_id").
		Where("up.product_id IN ?", productIDs).
		Where("us.expires_at > NOW()").
		Group("up.product_id").
		Select(
			"up.product_id       AS product_id",
			"MIN(up.final_price) AS min_price",
		)

	if len(allowedCityIDs) > 0 {
		query = query.Where("c.id IN ?", allowedCityIDs)
	}

	err = query.Scan(&productPrices).Error
	if err != nil {
		return
	}

	productPriceMap = map[int64]decimal.Decimal{}
	for _, prodPrice := range productPrices {
		productPriceMap[prodPrice.ProductID] = prodPrice.MinPrice
	}

	return productPriceMap, nil
}

func (*UserProductRepository) GetAllowedProductIDS(ctx context.Context, dbSession interface{},
	allowedCityIDs []int64) (
	allowedProductIDs []int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("user_product up").
		Joins("JOIN user_t u ON u.id = up.user_id").
		Joins("LEFT JOIN user_subscription us ON us.user_id = u.id").
		Joins("JOIN city c ON c.id = u.city_id").
		Where("up.is_hidden = FALSE AND c.id IN ?", allowedCityIDs).
		Where("us.expires_at > NOW()").
		Select("DISTINCT up.product_id").
		Order("up.product_id ASC").
		Scan(&allowedProductIDs).Error
	if err != nil {
		return
	}
	if allowedProductIDs == nil {
		return []int64{}, nil
	}

	return allowedProductIDs, nil
}

// این کد را به فایل internal/adapter/storage/dbms/repository/user_product_repository.go اضافه کنید

// GetAggregatedFilterDataForSearch داده‌های لازم برای نمایش فیلترها در صفحه جستجو را برمی‌گرداند.
func (ur *UserProductRepository) GetAggregatedFilterDataForSearch(ctx context.Context,
	dbSession interface{}, filter *domain.UserProductFilter) (
	aggregatedData *domain.SearchProductsData, err error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}

	aggregatedData = &domain.SearchProductsData{
		Filters: []*domain.ProductFilterData{},
		Brands:  []*domain.ProductBrand{},
		Models:  []*domain.ProductModel{},
	}

	// اگر دسته‌بندی اصلی در فیلتر مشخص نشده باشد، نمی‌توان فیلترهای مرتبط را پیدا کرد.
	if filter.CategoryID <= 0 {
		return aggregatedData, nil
	}

	// ۱. دریافت تمام برندهای مربوط به این دسته‌بندی
	var brands []*domain.ProductBrand
	if err = db.Model(&domain.ProductBrand{}).
		Where("category_id = ?", filter.CategoryID).
		Order("id ASC").
		Find(&brands).Error; err != nil {
		return nil, err
	}
	aggregatedData.Brands = brands

	// ۲. دریافت تمام مدل‌های مربوط به این برندها (در صورت وجود برند)
	if len(brands) > 0 {
		brandIDs := make([]int64, len(brands))
		for i, b := range brands {
			brandIDs[i] = b.ID
		}

		var models []*domain.ProductModel
		if err = db.Model(&domain.ProductModel{}).
			Where("brand_id IN ?", brandIDs).
			Order("id ASC").
			Find(&models).Error; err != nil {
			return nil, err
		}
		aggregatedData.Models = models
	}

	// ۳. دریافت تمام فیلترها و گزینه‌های مرتبط با این دسته‌بندی
	var filtersWithData []*domain.ProductFilterData

	var filters []*domain.ProductFilter
	if err = db.Model(&domain.ProductFilter{}).Where("category_id = ?", filter.CategoryID).Find(&filters).Error; err != nil {
		return nil, err
	}

	if len(filters) > 0 {
		filterIDs := make([]int64, len(filters))
		for i, f := range filters {
			filterIDs[i] = f.ID
		}

		var options []*domain.ProductFilterOption
		if err = db.Model(&domain.ProductFilterOption{}).Where("filter_id IN ?", filterIDs).Find(&options).Error; err != nil {
			return nil, err
		}

		// دسته‌بندی گزینه‌ها بر اساس ID فیلتر والدشان
		optionsMap := make(map[int64][]*domain.ProductFilterOption)
		for _, opt := range options {
			optionsMap[opt.FilterID] = append(optionsMap[opt.FilterID], opt)
		}

		// ساخت ساختار نهایی برای فیلترها
		for _, f := range filters {
			filtersWithData = append(filtersWithData, &domain.ProductFilterData{
				Filter:  f,
				Options: optionsMap[f.ID],
			})
		}
	}
	aggregatedData.Filters = filtersWithData

	return aggregatedData, nil
}
