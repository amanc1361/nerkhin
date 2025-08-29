package repository

import (
	"context"
	"time"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/pkg/pagination"
)

type ProductRepository struct{}

func (pr *ProductRepository) DeleteProductTags(ctx context.Context, dbSession interface{}, productID int64) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Where("product_id = ?", productID).Delete(&domain.ProductTag{}).Error
}

func (pr *ProductRepository) DeleteProductFilterRelations(ctx context.Context, dbSession interface{}, productID int64) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Where("product_id = ?", productID).Delete(&domain.ProductFilterRelation{}).Error
}

func (pr *ProductRepository) SaveProductImages(ctx context.Context, dbSession interface{}, images []*domain.ProductImage) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Create(images).Error
}

func (pr *ProductRepository) SaveProductFilterRelations(ctx context.Context, dbSession interface{}, rels []domain.ProductFilterRelation) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Create(&rels).Error
}

func (pr *ProductRepository) SaveProductTags(ctx context.Context, dbSession interface{}, tags []*domain.ProductTag) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Create(tags).Error
}

func (pr *ProductRepository) UpdateProductInfo(ctx context.Context, dbSession interface{}, product *domain.Product) error {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return err
	}
	return db.Model(&domain.Product{}).Where("id = ?", product.ID).
		Updates(map[string]interface{}{
			"model_name":        product.ModelName,
			"description":       product.Description,
			"default_image_url": product.DefaultImageUrl,
			"images_count":      product.ImagesCount,
			"updated_at":        time.Now(),
		}).Error
}

func (pr *ProductRepository) CreateProduct(ctx context.Context, dbSession interface{},
	product *domain.Product) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Create(&product).Error
	if err != nil {
		return
	}
	id = product.ID
	return id, nil
}

func (pr *ProductRepository) UpdateProduct(ctx context.Context, dbSession interface{},
	product *domain.Product) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Omit("created_at").Updates(product).Error
	if err != nil {
		return
	}
	return nil
}
func toSlice[T any](s []T) []T {
	if s == nil {
		return make([]T, 0)
	}
	return s
}

func (pr *ProductRepository) ListProductsByCategoryWithSearch(
	ctx context.Context,
	dbSession interface{},
	categoryID int64,
	search string,
	pag pagination.Pagination,
) (pagination.PaginatedResult[*domain.ProductViewModel], error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	if pag.Page <= 0 {
		pag.Page = 1
	}
	if pag.PageSize <= 0 || pag.PageSize > 100 {
		pag.PageSize = 20
	}
	limit := pag.PageSize
	offset := (pag.Page - 1) * pag.PageSize

	// کوئری پایه
	query := db.Model(&domain.Product{}).
		Joins("JOIN product_brand b ON b.id = product.brand_id").
		Joins("JOIN product_category sc ON sc.id = b.category_id").
		Joins("JOIN product_category c ON c.id = sc.parent_id")

	// فقط اگر categoryID معتبر بود، شرط را اعمال کن
	if categoryID > 0 {
		query = query.Where("c.id = ?", categoryID)
	}

	// جستجوی اختیاری
	if search != "" {
		like := "%" + search + "%"
		query = query.Where(`
			product.description ILIKE ? OR
			sc.title ILIKE ? OR
			b.title ILIKE ? OR
			product.model_name ILIKE ?`,
			like, like, like, like)
	}

	// total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	// تعریف row
	type prodRow struct {
		domain.Product   `gorm:"embedded"`
		SubCategoryID    int64                           `gorm:"column:sub_category_id"`
		SubCategoryTitle string                          `gorm:"column:sub_category_title"`
		CategoryTitle    string                          `gorm:"column:category_title"`
		BrandTitle       string                          `gorm:"column:brand_title"`
		Images           []*domain.ProductImage          `gorm:"foreignKey:ProductID;references:ID"`
		Tags             []*domain.ProductTag            `gorm:"foreignKey:ProductID;references:ID"`
		FilterRelations  []*domain.ProductFilterRelation `gorm:"foreignKey:ProductID;references:ID"`
	}

	var rows []prodRow
	if err := query.Select(`
		product.*,
		sc.id AS sub_category_id,
		sc.title AS sub_category_title,
		b.title AS brand_title,
		c.title AS category_title`).
		Order("product.id DESC").
		Limit(limit).
		Offset(offset).
		Preload("Images").
		Preload("Tags").
		Preload("FilterRelations.Filter").
		Preload("FilterRelations.Option").
		Find(&rows).Error; err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	// تبدیل به ViewModel
	viewModels := make([]*domain.ProductViewModel, 0, len(rows))
	for _, r := range rows {
		vm := &domain.ProductViewModel{
			Product:          r.Product,
			SubCategoryID:    r.SubCategoryID,
			SubCategoryTitle: r.SubCategoryTitle,
			CategoryTitle:    r.CategoryTitle,
			BrandTitle:       r.BrandTitle,
			IsLiked:          false,
			Images:           toSlice(r.Images),
			Tags:             toSlice(r.Tags),
		}
		for _, fr := range r.FilterRelations {
			vm.FilterRelations = append(vm.FilterRelations, &domain.ProductFilterRelationViewModel{
				ProductFilterRelation: *fr,
				FilterName:            fr.Filter.Name,
				FilterOptionName:      fr.Option.Name,
			})
		}
		viewModels = append(viewModels, vm)
	}

	return pagination.PaginatedResult[*domain.ProductViewModel]{
		Data:     viewModels,
		Total:    total,
		Page:     pag.Page,
		PageSize: pag.PageSize,
	}, nil
}

func (pr *ProductRepository) GetProductsByBrandIDPaginated(
	ctx context.Context,
	dbSession interface{},
	brandID int64,
	pag pagination.Pagination,
) (pagination.PaginatedResult[*domain.ProductViewModel], error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	/* ---------- تعیین Limit و Offset ---------- */
	if pag.Page <= 0 {
		pag.Page = 1
	}
	if pag.PageSize <= 0 || pag.PageSize > 100 {
		pag.PageSize = 20
	}
	limit := pag.PageSize
	offset := (pag.Page - 1) * pag.PageSize

	/* ---------- محاسبهٔ total ---------- */
	var total int64
	if err := db.
		Model(&domain.Product{}).
		Where("brand_id = ?", brandID).
		Count(&total).Error; err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	/* ---------- ساختار ردیف ---------- */
	type prodRow struct {
		domain.Product `gorm:"embedded"`

		SubCategoryID    int64                           `gorm:"column:sub_category_id"    json:"subCategoryId"`
		SubCategoryTitle string                          `gorm:"column:sub_category_title" json:"subCategoryTitle"`
		CategoryTitle    string                          `gorm:"column:category_title"     json:"categoryTitle"`
		BrandTitle       string                          `gorm:"column:brand_title"        json:"brandTitle"`
		Images           []*domain.ProductImage          `gorm:"foreignKey:ProductID;references:ID"`
		Tags             []*domain.ProductTag            `gorm:"foreignKey:ProductID;references:ID"`
		FilterRelations  []*domain.ProductFilterRelation `gorm:"foreignKey:ProductID;references:ID"`
	}

	/* ---------- واکشی محصولات ---------- */
	var rows []prodRow
	if err := db.Debug().
		Model(&domain.Product{}).
		Select(`
			product.*,
			sc.id   AS sub_category_id,
			sc.title AS sub_category_title,
			b.title as brand_title,
			c.title  AS category_title`).
		Joins("JOIN product_brand b ON b.id = product.brand_id").
		Joins("JOIN product_category sc ON sc.id = b.category_id").
		Joins("JOIN product_category c ON c.id = sc.parent_id").
		Where("product.brand_id = ?", brandID).
		Order("product.id DESC").
		Limit(limit).
		Offset(offset).
		Preload("Images").
		Preload("Tags").
		Preload("FilterRelations.Filter").
		Preload("FilterRelations.Option").
		Find(&rows).Error; err != nil {
		return pagination.PaginatedResult[*domain.ProductViewModel]{}, err
	}

	/* ---------- مونتاژ ViewModel ---------- */
	viewModels := make([]*domain.ProductViewModel, 0, len(rows))

	for _, r := range rows {
		vm := &domain.ProductViewModel{
			Product:          r.Product,
			SubCategoryID:    r.SubCategoryID,
			SubCategoryTitle: r.SubCategoryTitle,
			CategoryTitle:    r.CategoryTitle,
			BrandTitle:       r.BrandTitle,
			IsLiked:          false,
			Images:           toSlice(r.Images),
			Tags:             toSlice(r.Tags),
		}

		for _, fr := range r.FilterRelations {
			vm.FilterRelations = append(vm.FilterRelations,
				&domain.ProductFilterRelationViewModel{
					ProductFilterRelation: *fr,
					FilterName:            fr.Filter.Name,
					FilterOptionName:      fr.Option.Name,
				})
		}

		viewModels = append(viewModels, vm)
	}

	return pagination.PaginatedResult[*domain.ProductViewModel]{
		Data:     viewModels,
		Total:    total,
		Page:     pag.Page,
		PageSize: pag.PageSize,
	}, nil
}

func (pr *ProductRepository) ListByModel(ctx context.Context, dbSession interface{},
	modelID int64, p pagination.Pagination) (products []*domain.Product, total int64, err error) {

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	q := db.Model(&domain.Product{}).Where("model_id = ?", modelID)

	if err = q.Count(&total).Error; err != nil {
		return
	}

	offset := (p.Page - 1) * p.PageSize
	err = q.Order("id ASC").
		Limit(p.PageSize).
		Offset(offset).
		Find(&products).Error

	if products == nil {
		products = []*domain.Product{}
	}
	return
}

func (pr *ProductRepository) GetProductByID(
	ctx context.Context,
	dbSession interface{},
	id int64,
) (*domain.ProductViewModel, error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, err
	}

	vm := &domain.ProductViewModel{}

	err = db.Table("product AS p").
		Joins("LEFT JOIN product_brand pb ON pb.id = p.brand_id").
		Joins("LEFT JOIN product_category pc ON pc.id = pb.category_id").
		Where("p.id = ?", id).
		Select(
			"p.*", // شامل model_name, state_c, ...
			"pb.title AS brand_title",
			"pc.title AS category_title",
		).
		Take(vm).Error
	if err != nil {
		return nil, err
	}
	return vm, nil
}

func (pr *ProductRepository) GetProductsByFilter(
	ctx context.Context,
	dbSession interface{},
	filterQuery *domain.ProductFilterQuery,
	limit int,
	offset int,
) (products []*domain.ProductViewModel, totalCount int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, 0, err
	}

	products = []*domain.ProductViewModel{}

	// ساخت کوئری پایه با JOIN های جدید بر اساس سلسله مراتب
	baseQuery := db.Table("product AS p").
		Joins("JOIN product_model AS pm ON pm.id = p.model_id").
		Joins("JOIN product_brand AS pb ON pb.id = pm.brand_id").
		Joins("JOIN product_category AS pc ON pc.id = pb.category_id").
		Joins("LEFT JOIN product_category AS ppc ON ppc.id = pc.parent_id")

	// اعمال فیلترها به کوئری
	filteredQuery := baseQuery
	if filterQuery.CategoryID > 0 {
		// فیلتر بر اساس دسته اصلی یا زیردسته
		filteredQuery = filteredQuery.Where("pc.id = ? OR pc.parent_id = ?", filterQuery.CategoryID, filterQuery.CategoryID)
	}
	if filterQuery.BrandID > 0 {
		filteredQuery = filteredQuery.Where("pm.brand_id = ?", filterQuery.BrandID)
	}
	if filterQuery.ModelID > 0 {
		filteredQuery = filteredQuery.Where("p.model_id = ?", filterQuery.ModelID)
	}
	if filterQuery.SearchText != "" {
		searchQuery := "%" + filterQuery.SearchText + "%"
		// جستجو در عنوان محصول، برند و مدل
		filteredQuery = filteredQuery.Where("pc.title || ' ' || pb.title || ' - ' || pm.title LIKE ?", searchQuery)
	}

	// 1. شمارش تعداد کل نتایج مطابق با فیلتر (قبل از اعمال LIMIT و OFFSET)
	err = filteredQuery.Model(&domain.Product{}).Count(&totalCount).Error
	if err != nil {
		return nil, 0, err
	}
	// اگر رکوردی وجود نداشت، از کوئری اضافی برای دریافت داده‌ها جلوگیری می‌کنیم
	if totalCount == 0 {
		return products, 0, nil
	}

	// 2. اعمال مرتب‌سازی و صفحه‌بندی برای دریافت داده‌های صفحه فعلی
	dataQuery := filteredQuery
	if filterQuery.SortOrder == domain.ASC {
		dataQuery = dataQuery.Order("p.created_at ASC")
	} else { // پیش‌فرض یا DESC
		dataQuery = dataQuery.Order("p.created_at DESC")
	}

	err = dataQuery.
		Limit(limit).
		Offset(offset).
		Select(
			"p.*",
			"pc.title AS category_title",
			"ppc.title AS sub_category_title",
			"pb.title AS brand_title",
			"pm.title AS model_title",
		).
		Scan(&products).Error
	if err != nil {
		return nil, 0, err
	}

	return products, totalCount, nil
}

func (pr *ProductRepository) GetProductsByIDs(ctx context.Context, dbSession interface{},
	ids []int64) (products []*domain.Product, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Model(&domain.Product{}).Where("id IN ?", ids).Order("id ASC").Find(&products).Error
	if products == nil {
		products = []*domain.Product{}
	}
	return
}

func (pr *ProductRepository) DeleteProduct(ctx context.Context, dbSession interface{},
	id int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	// اطمینان حاصل کنید که حذف به درستی انجام می‌شود (مثلاً cascade delete در دیتابیس)
	// یا اینکه تمام روابط (images, tags, filter_relations) را هم به صورت دستی حذف کنید.
	// فعلاً فرض می‌کنیم cascade در دیتابیس تنظیم شده است.
	err = db.Delete(&domain.Product{}, "id = ?", id).Error
	return
}

func (pr *ProductRepository) SaveImages(ctx context.Context, dbSession interface{},
	imagePayload *domain.ProductImagePayload) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	if len(imagePayload.DeletedImageIDs) > 0 {
		if err = db.Delete(&domain.ProductImage{}, "id IN ?", imagePayload.DeletedImageIDs).Error; err != nil {
			return
		}
	}
	if len(imagePayload.NewImages) > 0 {
		if err = db.Create(&imagePayload.NewImages).Error; err != nil {
			return
		}
	}
	return nil
}

func (pr *ProductRepository) GetProductsImages(ctx context.Context, dbSession interface{},
	productID int64) (imagesMap map[int64][]*domain.ProductImage, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	var images []*domain.ProductImage
	err = db.Where("product_id = ?", productID).Order("id ASC").Find(&images).Error
	if err != nil {
		return
	}
	imagesMap = make(map[int64][]*domain.ProductImage)
	for _, img := range images {
		imagesMap[img.ProductID] = append(imagesMap[img.ProductID], img)
	}
	return
}

func (pr *ProductRepository) GetImagesByIDs(ctx context.Context, dbSession interface{}, imageIDs []int64) (
	images []*domain.ProductImage, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Where("id IN ?", imageIDs).Order("id ASC").Find(&images).Error
	return
}

func (pr *ProductRepository) SaveTags(ctx context.Context, dbSession interface{},
	tagPayload *domain.ProductTagPayload) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	if len(tagPayload.DeletedTags) > 0 {
		// خطای تایپی در کد اصلی شما: باید از domain.ProductTag حذف شود، نه domain.ProductImage
		if err = db.Delete(&domain.ProductTag{}, "id IN ?", tagPayload.DeletedTags).Error; err != nil {
			return
		}
	}
	if len(tagPayload.NewTags) > 0 {
		if err = db.Create(&tagPayload.NewTags).Error; err != nil {
			return
		}
	}
	return nil
}

func (pr *ProductRepository) GetProductsTags(ctx context.Context, dbSession interface{},
	productIDs []int64) (tagsMap map[int64][]*domain.ProductTag, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	var tags []*domain.ProductTag
	err = db.Where("product_id IN ?", productIDs).Order("id ASC").Find(&tags).Error
	if err != nil {
		return
	}
	tagsMap = make(map[int64][]*domain.ProductTag)
	for _, tag := range tags {
		tagsMap[tag.ProductID] = append(tagsMap[tag.ProductID], tag)
	}
	return
}

func (pr *ProductRepository) GetTagsByIDs(ctx context.Context, dbSession interface{},
	tagIDs []int64) (tags []*domain.ProductTag, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}
	err = db.Where("id IN ?", tagIDs).Order("id ASC").Find(&tags).Error
	return
}
