package service

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/adapter/storage/util/image"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
	"github.com/nerkhin/internal/pkg/pagination"
)

type ProductService struct {
	dbms              port.DBMS
	repo              port.ProductRepository
	categoryRepo      port.ProductCategoryRepository
	productFilterRepo port.ProductFilterRepository
	brandRepo         port.ProductBrandRepository
	modelRepo         port.ProductModelRepository
	appConfig         config.App
}

var _ port.ProductService = (*ProductService)(nil)

func RegisterProductService(dbms port.DBMS, repo port.ProductRepository,
	cr port.ProductCategoryRepository, pfr port.ProductFilterRepository,
	pbr port.ProductBrandRepository, pmr port.ProductModelRepository,
	appConfig config.App) port.ProductService {
	return &ProductService{
		dbms: dbms, repo: repo, categoryRepo: cr, productFilterRepo: pfr,
		brandRepo: pbr, modelRepo: pmr, appConfig: appConfig,
	}
}
func (s *ProductService) ListByModel(ctx context.Context,
	modelID int64, p pagination.Pagination) (pagination.PaginatedResult[*domain.Product], error) {
	dbSession, err := s.dbms.NewDB(ctx)
	if err != nil {
		return pagination.PaginatedResult[*domain.Product]{}, err
	}
	items, total, err := s.repo.ListByModel(ctx, dbSession, modelID, p)
	if err != nil {
		return pagination.PaginatedResult[*domain.Product]{}, err
	}
	return pagination.NewPaginatedResult(items, total, p), nil
}

// CreateProduct با منطق اعتبارسنجی جدید و استفاده از توابع کمکی
func (ps *ProductService) CreateProduct(
	ctx context.Context,
	product *domain.Product,
	imageFiles []*multipart.FileHeader,
	defaultImageIndex int,
	baseImagePath string,
	filterPayload *domain.ProductFilterPayload,
	tagPayload *domain.ProductTagPayload,
) (id int64, err error) {
	dbSession, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return 0, err
	}

	return id, ps.dbms.BeginTransaction(ctx, dbSession, func(txSession interface{}) error {
		if err := validateProduct(ctx, product); err != nil {
			fmt.Println(err)
			return err
		}

		brand, err := ps.brandRepo.GetProductBrandByID(ctx, txSession, product.BrandID)
		if err != nil {
			return fmt.Errorf("invalid brand for new product's model: %w", err)
		}
		productCategoryID := brand.CategoryID

		if len(filterPayload.NewOptionIDs) > 0 {
			filters, err := ps.productFilterRepo.GetFiltersByFilterOptionIDs(ctx, txSession, filterPayload.NewOptionIDs)
			if err != nil {
				return err
			}
			for _, filter := range filters {
				if productCategoryID != filter.CategoryID {
					return errors.New(msg.ErrProductCategoryHasNotProductFilter)
				}
			}
		}

		id, err = ps.repo.CreateProduct(ctx, txSession, product)
		if err != nil {
			return err
		}
		product.ID = id

		// 📦 ذخیره‌سازی عکس‌ها بعد از دریافت product.ID
		imagePayload, defaultUrl, err := image.SaveProductImagesWithPayload(product.ID, imageFiles, defaultImageIndex, baseImagePath)
		if err != nil {
			return err
		}
		product.DefaultImageUrl = defaultUrl

		// ادامه همان کد شما بدون هیچ تغییر
		return ps.saveAssociatedData(ctx, txSession, product.ID, imagePayload, filterPayload, tagPayload)
	})
}

func (ps *ProductService) UpdateProduct(
	ctx context.Context,
	product *domain.Product,
	imageFiles []*multipart.FileHeader,
	defaultImageIndex int,
	baseImagePath string,
	filterPayload *domain.ProductFilterPayload,
	tagPayload *domain.ProductTagPayload,
) error {
	dbSession, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return err
	}

	return ps.dbms.BeginTransaction(ctx, dbSession, func(txSession interface{}) error {
		if err := validateProduct(ctx, product); err != nil {
			return err
		}

		brand, err := ps.brandRepo.GetProductBrandByID(ctx, txSession, product.BrandID)
		if err != nil {
			return fmt.Errorf("invalid brand for product update: %w", err)
		}
		productCategoryID := brand.CategoryID

		if len(filterPayload.NewOptionIDs) > 0 {
			filters, err := ps.productFilterRepo.GetFiltersByFilterOptionIDs(ctx, txSession, filterPayload.NewOptionIDs)
			if err != nil {
				return err
			}
			for _, filter := range filters {
				if productCategoryID != filter.CategoryID {
					return errors.New(msg.ErrProductCategoryHasNotProductFilter)
				}
			}
		}

		// حذف تگ‌ها، فیلترها، تصاویر قبلی
		if err := ps.repo.DeleteProductTags(ctx, txSession, product.ID); err != nil {
			return err
		}
		if err := ps.repo.DeleteProductFilterRelations(ctx, txSession, product.ID); err != nil {
			return err
		}
	

		// ذخیره عکس‌های جدید
		imagePayload, defaultUrl, err := image.SaveProductImagesWithPayload(product.ID, imageFiles, defaultImageIndex, baseImagePath)
		if err != nil {
			return err
		}
		product.DefaultImageUrl = defaultUrl
		product.ImagesCount = len(imageFiles)

		// ✅ اینجا فیلدهای محصول را آپدیت می‌کنیم
		if err := ps.repo.UpdateProductInfo(ctx, txSession, product); err != nil {
			return err
		}

		// ذخیره تگ‌ها، فیلترها، تصاویر جدید
		return ps.saveAssociatedData(ctx, txSession, product.ID, imagePayload, filterPayload, tagPayload)
	})
}



// GetProductByID با تکیه بر ریپازیتوری اصلاح شده
func (ps *ProductService) GetProductByID(ctx context.Context, id int64) (*domain.ProductViewModel, error) {
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
	}

	vm, err := ps.repo.GetProductByID(ctx, db, id)
	if err != nil {
		return nil, err
	}

	if err := ps.hydrateProductViewModels(ctx, db, []*domain.ProductViewModel{vm}); err != nil {
		return nil, err
	}
	return vm, nil
}

// BatchDeleteProducts
func (ps *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return err
	}
	return ps.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		if err := ps.deleteAssociatedImagesByProductIDs(ctx, txSession, id); err != nil {
			return err
		}
		// NOTE: You should also handle deletion of filter relations, tags, etc. here
		return ps.repo.DeleteProduct(ctx, txSession, id)
	})
}

// GetProductsByFilter بازنویسی شده برای صفحه‌بندی و رفع N+1 Query
func (ps *ProductService) GetProductsByFilter(ctx context.Context,
	filterQuery *domain.ProductFilterQuery, page int, limit int) (*domain.PaginatedProductsViewModel, error) {

	db, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return nil, err
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

	products, totalCount, err := ps.repo.GetProductsByFilter(ctx, db, filterQuery, limit, offset)
	if err != nil {
		return nil, err
	}

	if len(products) == 0 {
		return &domain.PaginatedProductsViewModel{Products: []*domain.ProductViewModel{}, TotalCount: 0}, nil
	}

	if err := ps.hydrateProductViewModels(ctx, db, products); err != nil {
		return nil, err
	}

	return &domain.PaginatedProductsViewModel{
		Products:   products,
		TotalCount: totalCount,
	}, nil
}
func (s *ProductService) ListProductsByCategoryWithSearch(
	ctx context.Context,
	categoryID int64,
	search string,
	pag pagination.Pagination,
) (pagination.PaginatedResult[*domain.ProductViewModel], error) {

	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}
	return s.repo.ListProductsByCategoryWithSearch(ctx, db, categoryID, search, pag)
}
func (s *ProductService) GetProductsByBrandIDPaginated(
	ctx context.Context,
	brandID int64,
	pag pagination.Pagination,
) (pagination.PaginatedResult[*domain.ProductViewModel], error) {
	db, err := s.dbms.NewDB(ctx)
	if err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}
	// در صورت نیاز تراکنش بسازید و پاس دهید؛ اینجا nil برای سادگی
	return s.repo.GetProductsByBrandIDPaginated(ctx, db, brandID, pag)
}

// GetProductsByCategoryID با استفاده از GetProductsByFilter و با صفحه‌بندی
func (ps *ProductService) GetProductsByCategoryID(ctx context.Context, categoryID int64, page int, limit int) (*domain.PaginatedProductsViewModel, error) {
	filter := &domain.ProductFilterQuery{CategoryID: categoryID}
	return ps.GetProductsByFilter(ctx, filter, page, limit)
}

// متد جدید برای دریافت محصولات یک برند خاص با صفحه‌بندی
func (ps *ProductService) GetProductsByBrandID(ctx context.Context, brandID int64, page int, limit int) (*domain.PaginatedProductsViewModel, error) {
	filter := &domain.ProductFilterQuery{BrandID: brandID}
	return ps.GetProductsByFilter(ctx, filter, page, limit)
}

// متد جدید برای دریافت محصولات یک مدل خاص با صفحه‌بندی
// func (ps *ProductService) GetProductsByModelID(ctx context.Context, modelID int64, page int, limit int) (*domain.PaginatedProductsViewModel, error) {
// 	filter := &domain.ProductFilterQuery{ModelID: modelID}
// 	return ps.GetProductsByFilter(ctx, filter, page, limit)
// }

// --- توابع کمکی داخلی (Private Helper Functions) با پیاده‌سازی کامل ---

func (ps *ProductService) saveAssociatedData(ctx context.Context, txSession interface{}, productID int64,
	imagePayload *domain.ProductImagePayload, filterPayload *domain.ProductFilterPayload, tagPayload *domain.ProductTagPayload) error {

	if imagePayload != nil && len(imagePayload.NewImages) > 0 {
		for _, img := range imagePayload.NewImages {
			img.ProductID = productID
		}
		if err := ps.repo.SaveImages(ctx, txSession, imagePayload); err != nil {
			return fmt.Errorf("failed to save images: %w", err)
		}
	}

	if filterPayload != nil && len(filterPayload.NewOptionIDs) > 0 {
		if err := ps.saveProductFilterRelations(ctx, txSession, productID, filterPayload); err != nil {
			return fmt.Errorf("failed to save filter relations: %w", err)
		}
	}

	if tagPayload != nil && len(tagPayload.NewTags) > 0 {
		for _, tag := range tagPayload.NewTags {
			if tag.Tag == "" {
				return errors.New(msg.ErrTagCannotBeEmpty)
			}
			tag.ProductID = productID
		}
		if err := ps.repo.SaveTags(ctx, txSession, tagPayload); err != nil {
			return fmt.Errorf("failed to save tags: %w", err)
		}
	}
	return nil
}

func (ps *ProductService) hydrateProductViewModels(ctx context.Context, dbSession interface{}, products []*domain.ProductViewModel) error {
	if len(products) == 0 {
		return nil
	}
	productIDs := make([]int64, len(products))
	for i, p := range products {
		productIDs[i] = p.ID
	}
	imagesMap, err := ps.repo.GetProductsImages(ctx, dbSession, productIDs[0])
	if err != nil {
		return err
	}
	tagsMap, err := ps.repo.GetProductsTags(ctx, dbSession, productIDs)
	if err != nil {
		return err
	}

	for _, p := range products {
		p.Images = imagesMap[p.ID]
		p.Tags = tagsMap[p.ID]
		for _, img := range p.Images {
			if img.IsDefault {
				p.DefaultImageUrl = img.Url
				break
			}
		}
	}
	return nil
}

func (ps *ProductService) deleteAssociatedImagesByIDs(ctx context.Context, txSession interface{}, imageIDs []int64) error {
	if len(imageIDs) == 0 {
		return nil
	}
	productImagesToBeDeleted, err := ps.repo.GetImagesByIDs(ctx, txSession, imageIDs)
	if err != nil {
		return err
	}
	for _, img := range productImagesToBeDeleted {
		if err := deleteImageFile(ps.appConfig.ImageBasePath, img.Url); err != nil {
			fmt.Printf("warning: could not delete image file %s: %v\n", img.Url, err)
		}
	}
	return nil
}

func (ps *ProductService) deleteAssociatedImagesByProductIDs(ctx context.Context, txSession interface{}, productID int64) error {
	imagesMap, err := ps.repo.GetProductsImages(ctx, txSession, productID)
	if err != nil {
		return err
	}
	for _, imgArr := range imagesMap {
		for _, img := range imgArr {
			if err := deleteImageFile(ps.appConfig.ImageBasePath, img.Url); err != nil {
				fmt.Printf("warning: could not delete image file %s: %v\n", img.Url, err)
			}
		}
	}
	return nil
}

func (ps *ProductService) saveProductFilterRelations(ctx context.Context, txSession interface{}, productID int64, filterPayload *domain.ProductFilterPayload) error {
	defaultOptionID := filterPayload.DefaultOptionID
	newFilterOptions, err := ps.productFilterRepo.GetFilterOptionsByIDs(ctx, txSession, filterPayload.NewOptionIDs)
	if err != nil {
		return err
	}

	filterIDsMap := make(map[int64]bool)
	for _, filterOption := range newFilterOptions {
		if _, ok := filterIDsMap[filterOption.FilterID]; ok {
			return errors.New(msg.ErrProductCannotHaveDuplicateFilters)
		}
		filterIDsMap[filterOption.FilterID] = true
	}

	relations := make([]*domain.ProductFilterRelation, len(newFilterOptions))
	for i, option := range newFilterOptions {
		relations[i] = &domain.ProductFilterRelation{
			ProductID: productID, FilterID: option.FilterID, FilterOptionID: option.ID, IsDefault: option.ID == defaultOptionID,
		}
	}
	return ps.productFilterRepo.CreateProductFilterRelations(ctx, txSession, relations)
}

func deleteImageFile(basePath, url string) error {
	if url == "" {
		return nil
	}
	imagePath := filepath.Join(basePath, url)
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		return nil
	}
	return os.Remove(imagePath)
}

func validateProduct(_ context.Context, product *domain.Product) error {
	if product == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}
	if product.ID == 0 {
		if product.BrandID < 1 {
			return errors.New(msg.ErrProductMustHaveModel)
		}
	}
	return nil
}

// EnsureBrandByTitle: اگر برند با این عنوان (و در صورت نیاز categoryID) موجود نبود، می‌سازد و ID برمی‌گرداند.
func (ps *ProductService) EnsureBrandByTitle(ctx context.Context, categoryID int64, brandTitle string) (int64, error) {
	if strings.TrimSpace(brandTitle) == "" {
		return 0, fmt.Errorf("brand title is required")
	}

	dbSession, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return 0, err	
	}

	var outID int64
	err = ps.dbms.BeginTransaction(ctx, dbSession, func(tx interface{}) error {
		// تلاش برای یافتن
		b, err := ps.brandRepo.GetProductBrandByTitleAndCategory(ctx, tx, brandTitle, categoryID)
		if err == nil && b != nil && b.ID > 0 {
			outID = b.ID
			return nil
		}
		// ساخت برند جدید
		nb := &domain.ProductBrand{Title: brandTitle, CategoryID: categoryID}
		id, err := ps.brandRepo.CreateProductBrand(ctx, tx, nb)
		if err != nil {
			return fmt.Errorf("create brand failed: %w", err)
		}
		outID = id
		return nil
	})
	if err != nil {
		return 0, err
	}
	return outID, nil
}

// CreateProductDirect: درج محصول بدون عکس و فیلتر؛ فقط ImagesCount ذخیره می‌شود.
// ID محصول همان «نام پوشه» است. تگ‌ها مثل روال معمول شما در جدول ProductTag ذخیره و لینک می‌شوند.
func (ps *ProductService) CreateProductDirect(
	ctx context.Context,
	product *domain.Product,
	tagPayload *domain.ProductTagPayload,
) (int64, error) {

	if product == nil {
		return 0, fmt.Errorf("product is nil")
	}
	if product.ID <= 0 {
		return 0, fmt.Errorf("product.ID (folder number) must be > 0")
	}
	if product.BrandID <= 0 {
		return 0, fmt.Errorf("brandID is required")
	}
	if strings.TrimSpace(product.ModelName) == "" {
		return 0, fmt.Errorf("modelName is required")
	}

	dbSession, err := ps.dbms.NewDB(ctx)
	if err != nil {
		return 0, err
	}

	var newID int64
	err = ps.dbms.BeginTransaction(ctx, dbSession, func(tx interface{}) error {
		// اعتبارسنجی برند (مثل CreateProduct شما)
		if _, err := ps.brandRepo.GetProductBrandByID(ctx, tx, product.BrandID); err != nil {
			return fmt.Errorf("invalid brand: %w", err)
		}

		// درج محصول (با ID از قبل ست‌شده)
		id, err := ps.repo.CreateProduct(ctx, tx, product)
		if err != nil {
			return err
		}
		newID = id

		// تگ‌ها (اختیاری)
		if tagPayload != nil && len(tagPayload.NewTags) > 0 {
			for _, t := range tagPayload.NewTags {
				if t == nil {
					continue
				}
				if strings.TrimSpace(t.Tag) == "" {
					return fmt.Errorf("tag cannot be empty")
				}
				t.ProductID = newID
			}
			if err := ps.repo.SaveTags(ctx, tx, tagPayload); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return 0, err
	}
	return newID, nil
}
