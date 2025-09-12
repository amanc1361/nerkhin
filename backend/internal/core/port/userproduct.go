package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
	"github.com/shopspring/decimal"
)

type UserProductRepository interface {
	CreateUserProduct(ctx context.Context, dbSession interface{}, userProduct *domain.UserProduct) (
		id int64, err error)
	FetchShopProducts(ctx context.Context, db interface{}, userId int64) (
		products []*domain.UserProductView, err error)
	ChangeOrder(ctx context.Context, db interface{}, userProductID int64, order int64) (
		err error)
	FetchUserProduct(ctx context.Context, db interface{}, userId int64, productId int64) (
		userProduct *domain.UserProduct, err error)

	FetchShops(ctx context.Context, db interface{}, productId int64, allowedCityIDs []int64) (
		shopProducts []*domain.ShopProduct, err error)
	GetProductShops(ctx context.Context, dbSession interface{},
		productID int64, allowedCityIDs []int64) (productShops []*domain.ProductShop, err error)
	GetPriceList(ctx context.Context, dbSession interface{}, currentUserID int64) (
		priceList []*domain.UserProductView, err error)
	GetUserProductByID(ctx context.Context, dbSession interface{}, userProductID int64) (
		userProduct *domain.UserProduct, err error)
	GetMaxOrder(ctx context.Context, txSession interface{}, userId int64) (maxOrder int64, err error)
	UpdateUserProduct(ctx context.Context, txSession interface{},
		userProduct *domain.UserProduct) (err error)
	FetchUserProductById(ctx context.Context, db interface{}, upId int64) (
		userProduct *domain.UserProductView, err error)
	BatchDeleteUserProduct(ctx context.Context, dbSession interface{}, id int64) (err error)
	GetUserProductIdsByOrder(ctx context.Context, dbSession interface{}, order int64) (
		ids []int64, err error)
	GetProductsPricesMap(ctx context.Context, dbSession interface{},
		productIDs, allowedCityIDs []int64) (productPriceMap map[int64]decimal.Decimal, err error)
	GetAllowedProductIDS(ctx context.Context, dbSession interface{},
		allowedCities []int64) (productIDs []int64, err error)
	GetProductsByFilter(ctx context.Context, dbSession interface{}, filter *domain.UserProductFilter) (products []*domain.SearchProductViewModel, totalCount int64, err error)

	// متد جدید برای دریافت داده‌های جمع‌آوری شده برای فیلترها
	GetAggregatedFilterDataForSearch(ctx context.Context, dbSession interface{}, filter *domain.UserProductFilter) (*domain.SearchProductsData, error)
	FetchShopProductsFiltered(ctx context.Context, dbSession interface{}, q *domain.UserProductQuery) ([]*domain.UserProductView, int64, error)
	FetchMarketProductsFiltered(
		ctx context.Context,
		dbSession interface{},
		q *domain.UserProductSearchQuery,
	) ([]*domain.UserProductMarketView, error)
	CountMarketProductsFiltered(
		ctx context.Context,
		dbSession interface{},
		q *domain.UserProductSearchQuery,
	) (int64, error)
}

type UserProductService interface {
	CreateUserProduct(ctx context.Context, userProduct *domain.UserProduct) (
		id int64, err error)
	FetchShopProducts(ctx context.Context, currentUserID, userID, shopID int64) (
		userProducts *domain.ShopViewModel, err error)
	ChangeOrder(ctx context.Context, userId int64, topProductId int64, bottomProductId int64) (
		err error)
	GetProductsByFilter(ctx context.Context, currentUserID int64, filter *domain.UserProductFilter) (
		productsData *domain.SearchProductsData, err error)
	FetchRelatedShopProducts(ctx context.Context, productId int64, currentUserId int64) (
		userProducts *domain.ProductInfoViewModel, err error)
	GetPriceList(ctx context.Context, currentUserID int64) (
		priceList *domain.ShopViewModel, err error)
	UpdateUserProduct(ctx context.Context, userProduct *domain.UserProduct) (err error)
	FetchUserProductById(ctx context.Context, upId int64) (
		userProduct *domain.UserProductView, err error)
	BatchDeleteUserProduct(ctx context.Context, id int64) (err error)
	ChangeVisibilityStatus(ctx context.Context, userProductId int64) (err error)
	FetchShopProductsFiltered(
		ctx context.Context,
		currentUserID, userID, shopID int64,
		query *domain.UserProductQuery,
	) (*domain.ShopViewModel, error)
	SearchPaged(
		ctx context.Context,

		q *domain.UserProductSearchQuery,
	) (*domain.MarketSearchResult, error)
}
