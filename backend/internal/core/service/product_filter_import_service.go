package service

import (
	"context"
	"strconv"
	"strings"

	"github.com/nerkhin/internal/adapter/storage/dbms/repository"
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"gorm.io/gorm"
)

type ProductFilterImportService struct {
	DBMS       port.DBMS
	FilterRepo *repository.ProductFilterRepository
}

func NewProductFilterImportService(dbms port.DBMS, filterRepo *repository.ProductFilterRepository) *ProductFilterImportService {
	return &ProductFilterImportService{
		DBMS:       dbms,
		FilterRepo: filterRepo,
	}
}

// برای DI در main
func RegisterProductFilterImportService(
	dbms port.DBMS,
	filterRepo *repository.ProductFilterRepository,
) port.ProductFilterImportService {
	return NewProductFilterImportService(dbms, filterRepo)
}

func (s *ProductFilterImportService) ImportCSV(ctx context.Context, args port.ImportCSVArgs) (port.ImportCSVResult, error) {
	res := port.ImportCSVResult{}

	db, err := s.DBMS.NewDB(ctx)
	if err != nil {
		return res, err
	}
	gdb, err := gormutil.CastToGORM(ctx, db)
	if err != nil {
		return res, err
	}

	return res, gdb.Transaction(func(tx *gorm.DB) error {
		// 1) فیلترها و آپشن‌های موجود این دسته
		existing, err := s.FilterRepo.GetAllProductFilters(ctx, tx, args.CategoryID)
		if err != nil {
			return err
		}
		filterMap := make(map[string]*domain.ProductFilterData) // displayName نرمال‌شده → فیلتر
		for _, fd := range existing {
			key := norm(fd.Filter.DisplayName)
			filterMap[key] = fd
		}

		// کش‌ها (کلید کش با رشتهٔ فارسی نرمال‌شده)
		brandCache := map[string]int64{} // normalized(title) → id
		prodCache := map[string]int64{}  // brandID|normalized(modelName) → productID

		type pair struct{ fId, optId int64 }
		existingRelCache := map[int64]map[pair]struct{}{} // productID → set[(filterID, optionID)]

		// --- Lookup برند با نرمال‌سازی فارسی و fallback ---
		ensureBrandID := func(tx *gorm.DB, name string) (int64, error) {
			name = strings.TrimSpace(name)
			if name == "" {
				return 0, nil
			}
			cacheKey := normalizeFA(name)
			if id, ok := brandCache[cacheKey]; ok {
				return id, nil
			}

			var b domain.ProductBrand

			// 1) تطبیق دقیق
			if err := tx.Model(&domain.ProductBrand{}).
				Where("title = ?", name).
				First(&b).Error; err == nil {
				brandCache[cacheKey] = b.ID
				return b.ID, nil
			}

			// 2) ILIKE ساده (lower)
			if err := tx.Model(&domain.ProductBrand{}).
				Where("LOWER(title) ILIKE ?", "%"+strings.ToLower(name)+"%").
				First(&b).Error; err == nil {
				brandCache[cacheKey] = b.ID
				return b.ID, nil
			}

			// 3) مقایسهٔ فشردهٔ نرمال‌شده (بدون فاصله/نیم‌فاصله/کشیده)
			compact := normalizeFACompact(name)
			raw := `
SELECT *
FROM product_brand
WHERE
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(LOWER(title), E'\u200c', ' '),  -- ZWNJ → space
        ' ', ''),                                  -- remove spaces
      E'\u0640', ''),                              -- Tatweel
    E'\u00a0', ' ')                                -- NBSP → space
  ) = ?
LIMIT 1;
`
			if err := tx.Raw(raw, compact).Scan(&b).Error; err == nil && b.ID != 0 {
				brandCache[cacheKey] = b.ID
				return b.ID, nil
			}

			return 0, gorm.ErrRecordNotFound
		}

		// --- Lookup محصول با نرمال‌سازی فارسی و fallback ---
		findProductID := func(tx *gorm.DB, brandID int64, modelName string) (int64, error) {
			modelName = strings.TrimSpace(modelName)
			cacheKey := strconv.FormatInt(brandID, 10) + "|" + normalizeFA(modelName)
			if id, ok := prodCache[cacheKey]; ok {
				return id, nil
			}

			var p domain.Product

			// 1) تطبیق دقیق
			if err := tx.Model(&domain.Product{}).
				Where("brand_id = ? AND model_name = ?", brandID, modelName).
				First(&p).Error; err == nil {
				prodCache[cacheKey] = p.ID
				return p.ID, nil
			}

			// 2) ILIKE ساده روی model_name
			if err := tx.Model(&domain.Product{}).
				Where("brand_id = ? AND LOWER(model_name) ILIKE ?", brandID, "%"+strings.ToLower(modelName)+"%").
				First(&p).Error; err == nil {
				prodCache[cacheKey] = p.ID
				return p.ID, nil
			}

			// 3) مقایسهٔ فشردهٔ نرمال‌شده
			compact := normalizeFACompact(modelName)
			raw := `
SELECT *
FROM product
WHERE brand_id = ?
  AND REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(LOWER(model_name), E'\u200c', ' '), -- ZWNJ → space
            ' ', ''),                                     -- remove spaces
          E'\u0640', ''),                                 -- Tatweel
        E'\u00a0', ' ')                                   -- NBSP → space
      ) = ?
LIMIT 1;
`
			if err := tx.Raw(raw, brandID, compact).Scan(&p).Error; err == nil && p.ID != 0 {
				prodCache[cacheKey] = p.ID
				return p.ID, nil
			}

			return 0, gorm.ErrRecordNotFound
		}

		// روابط موجود محصول
		loadExistingRelations := func(tx *gorm.DB, productID int64) (map[pair]struct{}, error) {
			if m, ok := existingRelCache[productID]; ok {
				return m, nil
			}
			relVMs, err := s.FilterRepo.GetProductFilterRelations(ctx, tx, productID)
			if err != nil {
				return nil, err
			}
			m := map[pair]struct{}{}
			for _, r := range relVMs {
				m[pair{fId: r.FilterID, optId: r.FilterOptionID}] = struct{}{}
			}
			existingRelCache[productID] = m
			return m, nil
		}

		// اطمینان از وجود فیلتر
		ensureFilter := func(tx *gorm.DB, displayName string) (*domain.ProductFilterData, bool, error) {
			key := norm(displayName)
			if fd, ok := filterMap[key]; ok {
				return fd, false, nil
			}
			fd := &domain.ProductFilterData{
				Filter: &domain.ProductFilter{
					CategoryID:  args.CategoryID,
					Name:        displayName, // در صورت نیاز اسلاگ‌سازی کن
					DisplayName: displayName,
				},
				Options: []*domain.ProductFilterOption{},
			}
			id, err := s.FilterRepo.CreateProductFilter(ctx, tx, fd)
			if err != nil {
				return nil, false, err
			}
			fd.Filter.ID = id
			filterMap[key] = fd
			res.CreatedFilters++
			return fd, true, nil
		}

		// اطمینان از وجود گزینه
		ensureOption := func(tx *gorm.DB, fd *domain.ProductFilterData, optName string) (*domain.ProductFilterOption, bool, error) {
			optKey := norm(optName)
			for _, o := range fd.Options {
				if norm(o.Name) == optKey {
					return o, false, nil
				}
			}
			opt := &domain.ProductFilterOption{
				FilterID: fd.Filter.ID,
				Name:     optName,
			}
			id, err := s.FilterRepo.CreateProductFilterOption(ctx, tx, opt)
			if err != nil {
				return nil, false, err
			}
			opt.ID = id
			fd.Options = append(fd.Options, opt)
			res.CreatedOptions++
			return opt, true, nil
		}

		var toCreateRelations []*domain.ProductFilterRelation

		for _, row := range args.Rows {
			// حداقل ستون‌های موردنیاز
			if len(row) <= args.ModelColIndex || len(row) <= args.BrandColIndex {
				continue
			}
			brand := strings.TrimSpace(row[args.BrandColIndex])
			model := strings.TrimSpace(row[args.ModelColIndex])
			if brand == "" || model == "" {
				res.SkippedEmpty++
				continue
			}

			brandID, err := ensureBrandID(tx, brand)
			if err != nil || brandID == 0 {
				res.NotFoundProducts = append(res.NotFoundProducts, map[string]string{"brand": brand, "model": model})
				continue
			}
			productID, err := findProductID(tx, brandID, model)
			if err != nil || productID == 0 {
				res.NotFoundProducts = append(res.NotFoundProducts, map[string]string{"brand": brand, "model": model})
				continue
			}
			exRel, err := loadExistingRelations(tx, productID)
			if err != nil {
				return err
			}

			// از ستون سوم به بعد (یا ایندکس داده‌شده) = فیلترها
			for col := args.StartFilterColIndex; col < len(args.Header) && col < len(row); col++ {
				filterTitle := strings.TrimSpace(args.Header[col])
				if filterTitle == "" {
					continue
				}
				optVal := strings.TrimSpace(row[col])
				if optVal == "" {
					continue
				}

				fd, _, err := ensureFilter(tx, filterTitle)
				if err != nil {
					return err
				}
				opt, _, err := ensureOption(tx, fd, optVal)
				if err != nil {
					return err
				}

				key := pair{fId: fd.Filter.ID, optId: opt.ID}
				if _, exists := exRel[key]; exists {
					continue
				}
				exRel[key] = struct{}{}

				toCreateRelations = append(toCreateRelations, &domain.ProductFilterRelation{
					ProductID:      productID,
					FilterID:       fd.Filter.ID,
					FilterOptionID: opt.ID,
					IsDefault:      false,
				})
			}
		}

		if len(toCreateRelations) > 0 {
			if err := s.FilterRepo.CreateProductFilterRelations(ctx, tx, toCreateRelations); err != nil {
				return err
			}
			res.CreatedRelations += len(toCreateRelations)
		}

		return nil
	})
}

// برای فیلتر/آپشن‌ها کافیست trim+lower
func norm(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}

// --- هلسپرهای نرمال‌سازی فارسی برای برند/مدل ---

// normalizeFA: یکسان‌سازی کاراکترهای رایج فارسی/عربی + تبدیل اعداد به لاتین + جمع‌کردن فاصله‌ها + lower
func normalizeFA(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}

	// جایگزینی‌های متداول
	replacer := strings.NewReplacer(
		// کاف/ی عربی → فارسی
		"ي", "ی", "ك", "ک",
		// نیم‌فاصله/فاصله‌های خاص → فاصله
		"\u200C", " ", // ZWNJ
		"\u00A0", " ", // NBSP
		"\u2009", " ", // thin space
		"\u200A", " ",
		"\u202F", " ",
		"\u3000", " ",
		// کشیده
		"\u0640", "", // Tatweel
	)
	s = replacer.Replace(s)

	// اعداد فارسی/عربی → لاتین
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		switch {
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r >= '\u06F0' && r <= '\u06F9': // Persian digits
			b.WriteRune('0' + (r - '\u06F0'))
		case r >= '\u0660' && r <= '\u0669': // Arabic-Indic digits
			b.WriteRune('0' + (r - '\u0660'))
		default:
			b.WriteRune(r)
		}
	}
	s = b.String()

	// collapse spaces و lower
	fields := strings.Fields(s)
	return strings.ToLower(strings.Join(fields, " "))
}

// نسخهٔ فشرده برای مقایسهٔ دقیق‌تر (حذف همهٔ فاصله‌ها)
func normalizeFACompact(s string) string {
	return strings.ReplaceAll(normalizeFA(s), " ", "")
}
