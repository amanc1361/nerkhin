package service

import (
	"context"
	"errors"
	"fmt" // برای فرمت‌دهی خطاها

	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type ProductCategoryService struct {
	dbms      port.DBMS
	repo      port.ProductCategoryRepository
	model     port.ProductModelRepository
	brandRepo port.ProductBrandRepository
	appConfig config.App
}

var _ port.ProductCategoryService = (*ProductCategoryService)(nil)

func RegisterProductCategoryService(dbms port.DBMS, repo port.ProductCategoryRepository,
	brandRepo port.ProductBrandRepository, appConfig config.App) port.ProductCategoryService {
	return &ProductCategoryService{
		dbms:      dbms,
		repo:      repo,
		brandRepo: brandRepo, // تزریق وابستگی جدید
		appConfig: appConfig,
	}
}

// CreateProductCategory برای ایجاد دسته و زیردسته
// func (pcs *ProductCategoryService) CreateProductCategory(ctx context.Context,
// 	category *domain.ProductCategory) (id int64, err error) {

//		return id, pcs.dbms.BeginTransaction(ctx, nil, func(txSession interface{}) error {
//			if err := validateCategory(ctx, category); err != nil {
//				return err
//			}
//			id, err = pcs.repo.CreateProductCategory(ctx, txSession, category)
//			return err
//		})
//	}
func (pcs *ProductCategoryService) CreateProductCategory(ctx context.Context,
	category *domain.ProductCategory) (id int64, err error) {

	// 1. ابتدا یک اتصال دیتابیس دریافت می‌کنیم
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return 0, err
	}

	// 2. حالا تراکنش را روی این اتصال معتبر شروع می‌کنیم
	return id, pcs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if err := validateCategory(ctx, category); err != nil {
			return err
		}
		id, err = pcs.repo.CreateProductCategory(ctx, txSession, category)
		return err
	})
}

// UpdateProductCategory
func (pcs *ProductCategoryService) UpdateProductCategory(ctx context.Context,
	category *domain.ProductCategory) (id int64, err error) {

	return id, pcs.dbms.BeginTransaction(ctx, nil, func(txSession interface{}) error {
		if category.ID == 0 {
			return errors.New(msg.ErrDataIsNotValid)
		}
		if err := validateCategory(ctx, category); err != nil {
			return err
		}

		originalCategory, err := pcs.repo.GetProductCategoryByID(ctx, txSession, category.ID)
		if err != nil {
			return err
		}

		if category.ImageUrl != originalCategory.ImageUrl {
			if err = deleteImageFile(pcs.appConfig.ImageBasePath, originalCategory.ImageUrl); err != nil {
				// خطا در حذف تصویر نباید کل عملیات را متوقف کند، فقط لاگ می‌گیریم
				fmt.Printf("warning: could not delete old category image %s: %v\n", originalCategory.ImageUrl, err)
			}
		}

		id, err = pcs.repo.UpdateProductCategory(ctx, txSession, category)
		return err
	})
}

// GetProductCategoryByID
func (pcs *ProductCategoryService) GetProductCategoryByID(ctx context.Context, id int64) (
	category *domain.ProductCategory, err error) {
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pcs.repo.GetProductCategoryByID(ctx, db, id)
}

// DeleteProductCategory با منطق بررسی وابستگی‌ها
func (pcs *ProductCategoryService) DeleteProductCategory(ctx context.Context, ids []int64) error {
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return err
	}
	return pcs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		// بررسی اینکه آیا این دسته‌بندی‌ها زیردسته دارند

		subCategories, err := pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{ParentIDs: ids})
		if err != nil {
			return err
		}
		if len(subCategories) > 0 {
			return errors.New(msg.ErrProductCategoryHasSubCategories) // یک پیام خطای جدید
		}

		// بررسی اینکه آیا برندی به این دسته‌بندی‌ها وابسته است
		for _, catID := range ids {
			brands, err := pcs.brandRepo.GetAllProductBrands(ctx, txSession, catID)
			if err != nil {
				return err
			}
			if len(brands) > 0 {
				return errors.New(msg.ErrProductCategoryHasSubCategories) // یک پیام خطای جدید
			}
		}
		fmt.Println(ids)
		// خواندن دسته‌بندی‌ها برای حذف تصاویر فیزیکی آنها
		categoriesToDelete, err := pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{ParentIDs: ids}) // نیاز به افزودن GetCategoriesByIDs به ریپازیتوری
		if err != nil {
			return err
		}
		fmt.Println("**************Delete iamges******************")
		for _, category := range categoriesToDelete {
			fmt.Println(category.ImageUrl)
			fmt.Println(pcs.appConfig.ImageBasePath)
			if err = deleteImageFile(pcs.appConfig.ImageBasePath, category.ImageUrl); err != nil {
				fmt.Printf("warning: could not delete category image %s: %v\n", category.ImageUrl, err)
			}
		}

		return pcs.repo.DeleteProductCategory(ctx, txSession, ids)
	})
}

// GetCategoriesByFilter با استفاده از ریپازیتوری اصلاح شده
func (pcs *ProductCategoryService) GetCategoriesByFilter(ctx context.Context,
	filter *domain.ProductCategoryFilter) ([]*domain.ProductCategory, error) {
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}
	return pcs.repo.GetCategoriesByFilter(ctx, db, filter)
}

// فایل: internal/core/service/product_category_service.go

// GetMainCategories حالا از استراکت فیلتر جدید استفاده می‌کند
func (pcs *ProductCategoryService) GetMainCategories(ctx context.Context) (
	categoryVMs []*domain.ProductCategoryViewModel, err error) {

	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	// ۱. دریافت تمام دسته‌بندی‌های اصلی با استفاده از فیلتر جدید
	mainCategories, err := pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{OnlyMain: true})
	if err != nil {
		return nil, err
	}
	if len(mainCategories) == 0 {
		return []*domain.ProductCategoryViewModel{}, nil
	}

	// ۲. دریافت تمام زیردسته‌های مربوط به این دسته‌های اصلی در یک کوئری واحد
	mainCategoryIDs := make([]int64, len(mainCategories))
	for i, category := range mainCategories {
		mainCategoryIDs[i] = category.ID
	}

	allSubCategories, err := pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{ParentIDs: mainCategoryIDs})
	if err != nil {
		return nil, err
	}

	// ۳. دسته‌بندی زیردسته‌ها در یک map برای دسترسی سریع
	subCategoriesMap := make(map[int64][]*domain.ProductCategory)
	for _, subCat := range allSubCategories {
		if subCat.ParentID.Valid {
			subCategoriesMap[subCat.ParentID.Int64] = append(subCategoriesMap[subCat.ParentID.Int64], subCat)
		}
	}

	// ۴. ساخت ViewModel نهایی با ترکیب داده‌ها
	categoryVMs = make([]*domain.ProductCategoryViewModel, len(mainCategories))
	for i, mainCat := range mainCategories {
		vm := &domain.ProductCategoryViewModel{
			ProductCategory: *mainCat,
			SubCategories:   []*domain.ProductCategory{},
		}
		if subCats, ok := subCategoriesMap[mainCat.ID]; ok {
			vm.SubCategories = subCats
		}
		categoryVMs[i] = vm
	}

	return categoryVMs, nil
}

func (pcs *ProductCategoryService) GetSubCategoriesByParentID(ctx context.Context, id int64) (
	categories []*domain.ProductCategory, err error) {

	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	// به جای ارسال رشته، یک استراکت فیلتر با ParentID مشخص می‌سازیم
	// و آن را به ریپازیتوری پاس می‌دهیم.
	return pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{ParentID: id})
}

// GetSubCategoriesByParentIDForPanel
func (pcs *ProductCategoryService) GetSubCategoriesByParentIDForPanel(ctx context.Context, id int64) (*domain.ProductCategoryViewModel, error) {
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	parentCategory, err := pcs.repo.GetProductCategoryByID(ctx, db, id)
	if err != nil {
		return nil, err
	}

	subCategories, err := pcs.repo.GetCategoriesByFilter(ctx, db, &domain.ProductCategoryFilter{ParentID: id})
	if err != nil {
		return nil, err
	}

	if subCategories == nil {
		subCategories = []*domain.ProductCategory{}
	}

	return &domain.ProductCategoryViewModel{
		ProductCategory: *parentCategory,
		SubCategories:   subCategories,
	}, nil
}

// GetRelatedBrandModels بازنویسی کامل با منطق بهینه و صحیح
func (pcs *ProductCategoryService) GetRelatedBrandModels(ctx context.Context, categoryID int64) ([]*domain.BrandModels, error) {
	db, err := pcs.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	// 1. دریافت تمام برندهای مربوط به این دسته‌بندی
	brands, err := pcs.brandRepo.GetAllProductBrands(ctx, db, categoryID)
	if err != nil {
		return nil, err
	}
	if len(brands) == 0 {
		return []*domain.BrandModels{}, nil
	}

	brandIDs := make([]int64, len(brands))
	brandsMap := make(map[int64]*domain.ProductBrand, len(brands))
	for i, brand := range brands {
		brandIDs[i] = brand.ID
		brandsMap[brand.ID] = brand
	}

	// 2. دریافت تمام مدل‌های مربوط به این برندها در یک کوئری
	allModels, err := pcs.model.GetProductModelsByBrandIDs(ctx, db, brandIDs[0]) // نیاز به افزودن این متد به ریپازیتوری مدل
	if err != nil {
		return nil, err
	}

	// 3. دسته‌بندی مدل‌ها بر اساس BrandID
	modelsByBrandMap := make(map[int64][]*domain.ProductModel)
	for _, model := range allModels {
		modelsByBrandMap[model.BrandID] = append(modelsByBrandMap[model.BrandID], model)
	}

	// 4. ساخت ساختار نهایی BrandModels
	result := make([]*domain.BrandModels, 0, len(brandsMap))
	for _, brand := range brands {
		result = append(result, &domain.BrandModels{
			Brand:  brand,
			Models: modelsByBrandMap[brand.ID],
		})
	}

	return result, nil
}

// --- توابع کمکی ---

func validateCategory(_ context.Context, category *domain.ProductCategory) error {
	if category == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}
	if category.Title == "" {
		return errors.New(msg.ErrBrandTitleCannotBeEmpty)
	}
	return nil
}
