package service

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
	"github.com/shopspring/decimal"
	"golang.org/x/sync/errgroup"
)

type UserProductService struct {
	dbms                port.DBMS
	repo                port.UserProductRepository
	userRepo            port.UserRepository
	productRepo         port.ProductRepository
	productFilterRepo   port.ProductFilterRepository
	productBrandRepo    port.ProductBrandRepository
	productModelRepo    port.ProductModelRepository
	favoriteProductRepo port.FavoriteProductRepository
	favoriteAccountRepo port.FavoriteAccountRepository
	userSubRepo         port.UserSubscriptionRepository
}

func RegisterUserProductService(dbms port.DBMS, repo port.UserProductRepository,
	userRepo port.UserRepository, productRepo port.ProductRepository,
	productFilterRepo port.ProductFilterRepository,
	productBrandRepo port.ProductBrandRepository,
	productModelRepo port.ProductModelRepository,
	favoriteProductRepo port.FavoriteProductRepository,
	favoriteAccountRepo port.FavoriteAccountRepository,
	userSubRepo port.UserSubscriptionRepository) *UserProductService {
	return &UserProductService{
		dbms,
		repo,
		userRepo,
		productRepo,
		productFilterRepo,
		productBrandRepo,
		productModelRepo,
		favoriteProductRepo,
		favoriteAccountRepo,
		userSubRepo,
	}
}

// این کد را در فایل internal/core/service/user_product_service.go خود جایگزین کنید

// CreateUserProduct حالا بر اساس مدل جدید کار می‌کند که در آن، محصول کاربر به محصول اصلی لینک شده است
func (ups *UserProductService) CreateUserProduct(ctx context.Context,
	userProduct *domain.UserProduct) (id int64, err error) {

	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}
	return id, ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		// 1. اعتبارسنجی ورودی‌های اولیه UserProduct
		if err := validateNewUserProduct(ctx, userProduct); err != nil {
			return err
		}

		// 2. (اختیاری) اعتبارسنجی قیمت دلاری، اگر محصول دلاری است
		if userProduct.IsDollar {
			shopInfo, err := ups.userRepo.GetUserByID(ctx, txSession, userProduct.UserID)
			if err != nil {
				return err
			}
			if !shopInfo.DollarPrice.Valid {
				return errors.New(msg.ErrShopDollarPriceIsNotSet)
			}
			if err = validateUserProductPrices(ctx, userProduct, shopInfo.DollarPrice.Decimal); err != nil {
				return err
			}
		}

		// 3. واکشی محصول اصلی (Master Product) برای اطمینان از وجود آن
		// این همان بخشی است که در کد شما جا افتاده بود
		targetProduct, err := ups.productRepo.GetProductByID(ctx, txSession, userProduct.ProductID)
		if err != nil {
			return err
		}

		// 4. افزایش تعداد فروشگاه‌های ارائه‌دهنده این محصول
		targetProduct.ShopsCount++
		if err = ups.productRepo.UpdateProduct(ctx, txSession, &targetProduct.Product); err != nil {
			return err
		}

		// 5. تعیین ترتیب نمایش محصول برای این کاربر
		maxOrder, err := ups.repo.GetMaxOrder(ctx, txSession, userProduct.UserID)
		if err != nil {
			return err
		}
		userProduct.Order = maxOrder + 1

		// 6. ایجاد نهایی محصول کاربر (UserProduct)
		id, err = ups.repo.CreateUserProduct(ctx, txSession, userProduct)
		return err
	})
}

// تابع کمکی برای اعتبارسنجی UserProduct جدید
func validateNewUserProduct(_ context.Context, product *domain.UserProduct) (err error) {
	if product == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if product.UserID < 1 {
		return errors.New(msg.ErrDataIsNotValid) // یا یک خطای مشخص‌تر برای UserID
	}

	// در مدل جدید، ولیدیشن بر اساس ProductID انجام می‌شود
	if product.ProductID < 1 {
		return errors.New(msg.ErrProductBrandIsNotSpecified) // یک پیام خطای جدید
	}

	// بررسی‌های مربوط به CategoryID, BrandID, ModelID حذف شده‌اند

	if product.IsDollar {
		if !product.DollarPrice.Valid {
			return errors.New(msg.ErrDollarPriceIsNotSet)
		}
	}

	if product.FinalPrice.IsZero() {
		return errors.New(msg.ErrFinalPriceIsNotSet)
	}

	return nil
}

func (ps *UserProductService) FetchShopProducts(ctx context.Context,
	currentUserID, userID, shopID int64) (
	userProductsVM *domain.ShopViewModel, err error) {
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	userProductsVM = &domain.ShopViewModel{
		Products: []*domain.UserProductView{},
	}

	err = ps.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		shop, err := ps.userRepo.GetUserByID(ctx, txSession, shopID)
		if err != nil {
			return err
		}

		if currentUserID != userID {
			hasAccessToShop, err := ps.userSubRepo.CheckUserAccessToCity(ctx, txSession,
				currentUserID, shop.CityID)
			if err != nil {
				return err
			}
			if !hasAccessToShop {
				return errors.New(msg.ErrYouDoNotAccessToThisShop)
			}
		}

		if currentUserID != shopID {
			isShopLiked, err := ps.favoriteAccountRepo.IsShopLiked(ctx, txSession, currentUserID, shopID)
			if err != nil {
				return err
			}
			shop.IsLiked = isShopLiked
		}

		userProductsVM.ShopInfo = shop

		products, err := ps.repo.FetchShopProducts(ctx, txSession, shop.ID)
		if err != nil {
			return err
		}

		likedProducts, err := ps.favoriteProductRepo.
			GetFavoriteProducts(ctx, txSession, currentUserID)
		if err != nil {
			return err
		}
		fmt.Println(likedProducts)
		likedProductsMap := map[int64]bool{}
		for _, likedP := range likedProducts {
			likedProductsMap[likedP.ProductID] = true
		}
		fmt.Println("*******************************")
		fmt.Println(likedProductsMap)
		for _, product := range products {
			_, isLiked := likedProductsMap[product.ProductID]
			if isLiked {
				product.IsLiked = true
			}
		}
		fmt.Println("****************************")
		fmt.Println(products)
		userProductsVM.Products = products

		return nil
	})

	if err != nil {
		return
	}

	return userProductsVM, nil
}
func (ps *UserProductService) SearchPaged(
	ctx context.Context,
	q *domain.UserProductSearchQuery,
) (*domain.MarketSearchResult, error) {
	// session معتبر
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	items, err := ps.repo.FetchMarketProductsFiltered(ctx, db, q)
	if err != nil {
		return nil, err
	}
	total, err := ps.repo.CountMarketProductsFiltered(ctx, db, q)
	if err != nil {
		return nil, err
	}
	return &domain.MarketSearchResult{Items: items, Total: total}, nil
}

// internal/core/service/user_product_service.go
func (ps *UserProductService) FetchShopProductsFiltered(
	ctx context.Context,
	currentUserID, userID, shopID int64,
	query *domain.UserProductQuery,
) (*domain.ShopViewModel, error) {
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	vm := &domain.ShopViewModel{Products: []*domain.UserProductView{}}

	err = ps.dbms.BeginTransaction(ctx, db, func(tx interface{}) error {
		shop, err := ps.userRepo.GetUserByID(ctx, tx, shopID)
		if err != nil {
			return err
		}

		if currentUserID != userID {
			has, err := ps.userSubRepo.CheckUserAccessToCity(ctx, tx, currentUserID, shop.CityID)
			if err != nil {
				return err
			}
			if !has {
				return errors.New(msg.ErrYouDoNotAccessToThisShop)
			}
		}

		if currentUserID != shopID {
			liked, err := ps.favoriteAccountRepo.IsShopLiked(ctx, tx, currentUserID, shopID)
			if err != nil {
				return err
			}
			shop.IsLiked = liked
		}
		vm.ShopInfo = shop

		if query == nil {
			query = &domain.UserProductQuery{}
		}
		query.ShopID = shop.ID

		products, err := ps.repo.FetchShopProductsFiltered(ctx, tx, query)
		if err != nil {
			return err
		}

		// پر کردن لایک‌های کاربر جاری
		likedProducts, err := ps.favoriteProductRepo.GetFavoriteProducts(ctx, tx, currentUserID)
		if err != nil {
			return err
		}
		likedMap := map[int64]bool{}
		for _, lp := range likedProducts {
			likedMap[lp.ProductID] = true
		}
		for _, p := range products {
			if _, ok := likedMap[p.ProductID]; ok {
				p.IsLiked = true
			}
		}

		vm.Products = products
		return nil
	})
	if err != nil {
		return nil, err
	}
	return vm, nil
}

func (ups *UserProductService) ChangeOrder(ctx context.Context, userId int64, topProductId int64, bottomProductId int64) (
	err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		topProduct, err := ups.repo.FetchUserProductById(ctx, txSession, topProductId)
		if err != nil {
			return err
		}

		bottomProduct, err := ups.repo.FetchUserProductById(ctx, txSession, bottomProductId)
		if err != nil {
			return err
		}

		if math.Abs(float64(topProduct.Order-bottomProduct.Order)) != 1 {
			return errors.New(msg.ErrChangeOrderRequestIsNotValid)
		}

		err = ups.repo.ChangeOrder(ctx, txSession, topProductId, bottomProduct.Order)
		if err != nil {
			return err
		}

		err = ups.repo.ChangeOrder(ctx, txSession, bottomProductId, topProduct.Order)
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

// این کد را در فایل internal/core/service/user_product_service.go خود قرار دهید

// GetProductsByFilter به طور کامل برای صفحه‌بندی و رفع N+1 Query بازنویسی شده است
// فایل: internal/core/service/user_product_service.go

func (ups *UserProductService) GetProductsByFilter(ctx context.Context, currentUserID int64,
	filter *domain.UserProductFilter) (*domain.SearchProductsData, error) {

	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	// تنظیم مقادیر پیش‌فرض و محاسبه offset در لایه سرویس
	if filter.Offset < 1 {
		filter.Offset = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	} else if filter.Limit > 100 {
		filter.Limit = 100
	}
	filter.Offset = (filter.Offset - 1) * filter.Limit

	results := &domain.SearchProductsData{}

	allowedCityIDs, err := ups.userSubRepo.GetAllowedCities(ctx, db, currentUserID)
	if err != nil {
		return nil, err
	}
	if len(allowedCityIDs) == 0 {
		results.TotalCount = 0
		return results, nil
	}

	allowedProductIDs, err := ups.repo.GetAllowedProductIDS(ctx, db, allowedCityIDs)
	if err != nil {
		return nil, err
	}
	if len(allowedProductIDs) == 0 {
		results.TotalCount = 0
		return results, nil
	}
	filter.AllowedProductIDs = allowedProductIDs

	// دریافت داده‌های اصلی و داده‌های فیلترها به صورت موازی
	var searchProducts []*domain.SearchProductViewModel
	var totalCount int64
	var aggregatedData *domain.SearchProductsData

	g, gCtx := errgroup.WithContext(ctx)

	// فراخوانی ریپازیتوری حالا فقط استراکت فیلتر را ارسال می‌کند
	g.Go(func() error {
		var repoErr error
		searchProducts, totalCount, repoErr = ups.repo.GetProductsByFilter(gCtx, db, filter)
		return repoErr
	})

	g.Go(func() error {
		var repoErr error
		aggregatedData, repoErr = ups.repo.GetAggregatedFilterDataForSearch(gCtx, db, filter)
		return repoErr
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	results.TotalCount = totalCount
	if aggregatedData != nil {
		results.Filters = aggregatedData.Filters
		results.Brands = aggregatedData.Brands
		results.Models = aggregatedData.Models
	}
	if len(searchProducts) == 0 {
		return results, nil
	}

	if err := ups.hydrateSearchProducts(ctx, db, currentUserID, searchProducts, allowedCityIDs); err != nil {
		return nil, err
	}
	results.ProductItems = searchProducts

	return results, nil
}

// --- توابع کمکی با پیاده‌سازی کامل ---

// hydrateSearchProducts اطلاعات اضافی را به صورت بهینه به لیست محصولات اضافه می‌کند
func (ups *UserProductService) hydrateSearchProducts(ctx context.Context, dbSession interface{},
	currentUserID int64, products []*domain.SearchProductViewModel, allowedCityIDs []int64) error {

	if len(products) == 0 {
		return nil
	}

	productIDs := make([]int64, len(products))
	for i, p := range products {
		productIDs[i] = p.ID
	}

	// ایجاد کانال برای دریافت نتایج کوئری‌های موازی
	type hydrationData struct {
		imagesMap map[int64][]*domain.ProductImage
		tagsMap   map[int64][]*domain.ProductTag
		likedMap  map[int64]bool
		pricesMap map[int64]decimal.Decimal
	}
	dataChan := make(chan hydrationData, 1)
	errChan := make(chan error, 1)

	go func() {
		g, gCtx := errgroup.WithContext(ctx)
		var hData hydrationData

		g.Go(func() error {
			var err error
			hData.imagesMap, err = ups.productRepo.GetProductsImages(gCtx, dbSession, productIDs[0])
			return err
		})
		g.Go(func() error {
			var err error
			hData.tagsMap, err = ups.productRepo.GetProductsTags(gCtx, dbSession, productIDs)
			return err
		})
		g.Go(func() error {
			var err error
			liked, err := ups.favoriteProductRepo.GetFavoriteProducts(gCtx, dbSession, currentUserID)
			if err == nil {
				hData.likedMap = make(map[int64]bool)
				for _, p := range liked {
					hData.likedMap[p.ProductID] = true
				}
			}
			return err
		})
		g.Go(func() error {
			var err error
			hData.pricesMap, err = ups.repo.GetProductsPricesMap(gCtx, dbSession, productIDs, allowedCityIDs)
			return err
		})

		if err := g.Wait(); err != nil {
			errChan <- err
			return
		}
		dataChan <- hData
	}()

	select {
	case hData := <-dataChan:
		for _, p := range products {
			if images, ok := hData.imagesMap[p.ID]; ok {
				for _, img := range images {
					if img.IsDefault {
						p.DefaultImageUrl = img.Url
						break
					}
				}
			}
			if tags, ok := hData.tagsMap[p.ID]; ok {
				p.Tags = tags
			}
			if _, isLiked := hData.likedMap[p.ID]; isLiked {
				p.IsLiked = true
			}
			if price, ok := hData.pricesMap[p.ID]; ok {
				p.Price = price
			}
		}
		return nil
	case err := <-errChan:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (ups *UserProductService) FetchRelatedShopProducts(ctx context.Context,
	productID, currentUserID int64) (shopProductVM *domain.ProductInfoViewModel, err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	shopProductVM = &domain.ProductInfoViewModel{
		ShopProducts: []*domain.ProductShop{},
	}
	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		allowedCityIDs, err := ups.userSubRepo.GetAllowedCities(ctx, txSession, currentUserID)
		if err != nil {
			return err
		}
		if len(allowedCityIDs) == 0 {
			return errors.New(msg.ErrNoSubscriptionsBought)
		}

		productShops, err := ups.repo.GetProductShops(ctx, txSession,
			productID, allowedCityIDs)
		if err != nil {
			return err
		}

		likedAccounts, err := ups.favoriteAccountRepo.
			GetFavoriteAccounts(ctx, txSession, currentUserID)
		if err != nil {
			return err
		}

		likedAccountsMap := map[int64]struct{}{}
		for _, likedA := range likedAccounts {
			likedAccountsMap[likedA.TargetUserID] = struct{}{}
		}

		for _, account := range productShops {
			_, isLiked := likedAccountsMap[account.ID]
			if isLiked {
				account.IsLiked = true
			}
		}

		shopProductVM.ShopProducts = productShops

		product, err := ups.productRepo.GetProductByID(ctx, txSession, productID)
		if err != nil {
			return err
		}

		filterRelations, err := ups.productFilterRepo.
			GetProductFilterRelations(ctx, txSession, productID)
		if err != nil {
			return err
		}
		product.FilterRelations = filterRelations

		productTagsMap, err := ups.productRepo.GetProductsTags(ctx, txSession, []int64{productID})
		if err != nil {
			return err
		}

		productTags, exists := productTagsMap[productID]
		if exists {
			product.Tags = productTags
		}

		shopProductVM.ProductInfo = product

		return nil
	})
	if err != nil {
		return
	}

	return shopProductVM, nil
}

func (ups *UserProductService) FetchShops(ctx context.Context, productId int64, userId int64) (
	shops *domain.ShopsProductViewModel, err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		product, err := ups.productRepo.GetProductByID(ctx, txSession, productId)
		if err != nil {
			return err
		}
		shops.ProductInfo = product

		allowedCityIDs, err := ups.userSubRepo.GetAllowedCities(ctx, txSession, userId)
		if err != nil {
			return err
		}

		shopProducts, err := ups.repo.FetchShops(ctx, txSession, productId, allowedCityIDs)
		if err != nil {
			return err
		}
		shops.ShopProducts = shopProducts

		return nil
	})

	if err != nil {
		return
	}

	return shops, nil
}

func (ps *UserProductService) GetPriceList(ctx context.Context, currentUserID int64) (
	priceList *domain.ShopViewModel, err error) {
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	priceList = &domain.ShopViewModel{
		Products: []*domain.UserProductView{},
	}
	err = ps.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		user, err := ps.userRepo.GetUserByID(ctx, txSession, currentUserID)
		if err != nil {
			return err
		}
		priceList.ShopInfo = user

		prices, err := ps.repo.GetPriceList(ctx, txSession, user.ID)
		if err != nil {
			return err
		}

		productIDs := []int64{}
		for _, prod := range prices {
			productIDs = append(productIDs, prod.ProductID)
		}

		defaultFilterRelationsMap, err := ps.productFilterRepo.
			GetProductFilterRelationsMapByProductIDs(ctx, txSession, productIDs)
		if err != nil {
			return err
		}

		for _, price := range prices {
			defaultFilter, ok := defaultFilterRelationsMap[price.ProductID]
			if ok {
				price.DefaultFilter = defaultFilter
			}
		}

		priceList.Products = prices

		return nil
	})

	if err != nil {
		return
	}

	return priceList, nil
}

func (ups *UserProductService) UpdateUserProduct(ctx context.Context,
	userProduct *domain.UserProduct) (err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if userProduct.ID < 1 {
			return errors.New(msg.ErrDataIsNotValid)
		}

		if userProduct.IsDollar {
			shopInfo, err := ups.userRepo.GetUserByID(ctx, txSession, userProduct.UserID)
			if err != nil {
				return err
			}
			if !shopInfo.DollarPrice.Valid {
				return errors.New(msg.ErrShopDollarPriceIsNotSet)
			}

			err = validateUserProductPrices(ctx, userProduct, shopInfo.DollarPrice.Decimal)
			if err != nil {
				return err
			}
		}

		err = ups.repo.UpdateUserProduct(ctx, txSession, userProduct)
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

func (ups *UserProductService) FetchUserProductById(ctx context.Context, upId int64) (
	userProduct *domain.UserProductView, err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		userProduct, err = ups.repo.FetchUserProductById(ctx, txSession, upId)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return userProduct, nil
}

func (ups *UserProductService) BatchDeleteUserProduct(ctx context.Context, id int64) error {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return err
	}

	return ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		// 1) قبل از حذف، آیتم را بگیر تا مقدار Order داشته باشیم
		item, err := ups.repo.GetUserProductByID(ctx, txSession, id)
		if err != nil {
			return err
		}
		deletedOrder := item.Order

		// 2) حذف آیتم
		if err := ups.repo.BatchDeleteUserProduct(ctx, txSession, id); err != nil {
			return err
		}

		// 3) گرفتن آیتم‌هایی که باید جابه‌جا شوند (با همان متد موجود)
		userProductsIdsToChange, err := ups.repo.GetUserProductIdsByOrder(ctx, txSession, deletedOrder)
		if err != nil {
			userProductsIdsToChange = []int64{}
		}

		for _, upid := range userProductsIdsToChange {
			up, err := ups.repo.GetUserProductByID(ctx, txSession, upid)
			if err != nil {
				return err
			}
			up.Order = up.Order + 1 // ← مطابق کد قبلی تو
			if err := ups.repo.UpdateUserProduct(ctx, txSession, up); err != nil {
				return err
			}
		}

		return nil
	})
}

func (ups *UserProductService) ChangeVisibilityStatus(ctx context.Context, userProductId int64) (err error) {
	db, err := ups.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = ups.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		userProduct, err := ups.repo.GetUserProductByID(ctx, txSession, userProductId)
		if err != nil {
			return err
		}

		userProduct.IsHidden = !userProduct.IsHidden
		err = ups.repo.UpdateUserProduct(ctx, txSession, userProduct)
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

// func validateNewUserProduct(_ context.Context, product *domain.UserProduct) (err error) {
// 	if product == nil {
// 		return errors.New(msg.ErrDataIsNotValid)
// 	}

// 	if product.UserID < 1 {
// 		return errors.New(msg.ErrDataIsNotValid)
// 	}

// 	if product.CategoryID < 1 {
// 		return errors.New(msg.ErrProductCategoryIsNotSpecified)
// 	}

// 	if product.BrandID < 1 {
// 		return errors.New(msg.ErrProductBrandIsNotSpecified)
// 	}

// 	if product.ModelID < 1 {
// 		return errors.New(msg.ErrProductModelIsNotSpecified)
// 	}

// 	if product.IsDollar {
// 		if !product.DollarPrice.Valid {
// 			return errors.New(msg.ErrDollarPriceIsNotSet)
// 		}
// 	}

// 	if product.FinalPrice.IsZero() {
// 		return errors.New(msg.ErrFinalPriceIsNotSet)
// 	}

// 	return
// }

func validateUserProductPrices(_ context.Context, userProduct *domain.UserProduct,
	dollarPrice decimal.Decimal) (err error) {
	if !userProduct.IsDollar {
		return
	}

	priceInToman := userProduct.DollarPrice.Decimal.Mul(dollarPrice)
	otherCosts := userProduct.OtherCosts.Decimal
	totalPrice := priceInToman.Add(otherCosts)

	if !totalPrice.Equal(userProduct.FinalPrice) {
		return errors.New(msg.ErrPricesDoNotMatch)
	}

	return nil
}
