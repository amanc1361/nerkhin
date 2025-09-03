package service

import (
	"context"
	"strings"

	"github.com/nerkhin/internal/adapter/storage/dbms/repository"
	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
	"gorm.io/gorm"
	gLogger "gorm.io/gorm/logger"
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

	// لاگ سطح Info برای دیباگ جریان ایمپورت
	gdb = gdb.Session(&gorm.Session{Logger: gLogger.Default.LogMode(gLogger.Info)})

	return res, gdb.Transaction(func(tx *gorm.DB) error {
		// اگر به قیود حساس هستی می‌تونی نگه داری؛ اشکالی نداره
		if err := tx.Exec("SET CONSTRAINTS ALL IMMEDIATE").Error; err != nil {
			return err
		}

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

		type pair struct{ fId, optId int64 }
		existingRelCache := map[int64]map[pair]struct{}{} // productID → set[(filterID, optionID)]

		// --- Lookup ساده برند: بدون هیچ دستکاری روی متن ورودی ---
		ensureBrandID := func(tx *gorm.DB, category_id int64, name string) (int64, error) {
			if name == "" {
				return 0, nil
			}

			var b domain.ProductBrand

			// 1) exact
			if err := tx.Model(&domain.ProductBrand{}).
				Where("category_id=? and title = ?", category_id, name).
				First(&b).Error; err == nil && b.ID != 0 {
				return b.ID, nil
			}

			// 2) ILIKE با همان متن ورودی
			if err := tx.Model(&domain.ProductBrand{}).
				Where("category_id=? and title ILIKE ?", category_id, "%"+name+"%").
				First(&b).Error; err == nil && b.ID != 0 {
				return b.ID, nil
			}

			return 0, gorm.ErrRecordNotFound
		}

		// --- Lookup ساده محصول: بدون هیچ دستکاری روی متن ورودی ---
		findProductID := func(tx *gorm.DB, brandID int64, modelName string) (int64, error) {
			if modelName == "" {
				return 0, gorm.ErrRecordNotFound
			}

			var p domain.Product

			// 1) exact
			if err := tx.Model(&domain.Product{}).
				Where("brand_id = ? AND model_name = ?", brandID, modelName).
				First(&p).Error; err == nil && p.ID != 0 {
				return p.ID, nil
			}

			// 2) ILIKE با همان متن ورودی
			if err := tx.Model(&domain.Product{}).
				Where("brand_id = ? AND model_name ILIKE ?", brandID, "%"+modelName+"%").
				First(&p).Error; err == nil && p.ID != 0 {
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

		// اطمینان از وجود فیلتر (برای فیلتر/آپشن‌ها همان قبلی کافیست)
		ensureFilter := func(tx *gorm.DB, displayName string) (*domain.ProductFilterData, bool, error) {
			key := norm(displayName)
			if fd, ok := filterMap[key]; ok {
				return fd, false, nil
			}
			fd := &domain.ProductFilterData{
				Filter: &domain.ProductFilter{
					CategoryID:  args.CategoryID,
					Name:        displayName,
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

			// ❗️بدون هیچ دستکاری: نه trim، نه lower، نه replace
			brand := row[args.BrandColIndex]
			model := row[args.ModelColIndex]

			if brand == "" || model == "" {
				res.SkippedEmpty++
				continue
			}

			brandID, err := ensureBrandID(tx, args.CategoryID, brand)
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

			// از ستون سوم به بعد = فیلترها
			for col := args.StartFilterColIndex; col < len(args.Header) && col < len(row); col++ {
				filterTitle := strings.TrimSpace(args.Header[col]) // عنوان ستون را می‌تونیم trim کنیم
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
