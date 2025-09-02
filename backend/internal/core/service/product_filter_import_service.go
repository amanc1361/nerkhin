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

// مطابق الگوی پروژه‌ات برای رجیستر در main
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

		// کش‌ها
		brandCache := map[string]int64{} // title → id
		prodCache := map[string]int64{}  // brandID|modelName → productID

		type pair struct{ fId, optId int64 }
		existingRelCache := map[int64]map[pair]struct{}{} // productID → set[(filterID, optionID)]

		ensureBrandID := func(tx *gorm.DB, name string) (int64, error) {
			name = strings.TrimSpace(name)
			if name == "" {
				return 0, nil
			}
			if id, ok := brandCache[name]; ok {
				return id, nil
			}
			var b domain.ProductBrand
			if err := tx.Model(&domain.ProductBrand{}).
				Where("title = ?", name).
				First(&b).Error; err != nil {
				return 0, err
			}
			brandCache[name] = b.ID
			return b.ID, nil
		}

		findProductID := func(tx *gorm.DB, brandID int64, modelName string) (int64, error) {
			key := strconv.FormatInt(brandID, 10) + "|" + modelName
			if id, ok := prodCache[key]; ok {
				return id, nil
			}
			var p domain.Product
			if err := tx.Model(&domain.Product{}).
				Where("brand_id = ? AND model_name = ?", brandID, modelName).
				First(&p).Error; err != nil {
				return 0, err
			}
			prodCache[key] = p.ID
			return p.ID, nil
		}

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

		ensureFilter := func(tx *gorm.DB, displayName string) (*domain.ProductFilterData, bool, error) {
			key := norm(displayName)
			if fd, ok := filterMap[key]; ok {
				return fd, false, nil
			}
			fd := &domain.ProductFilterData{
				Filter: &domain.ProductFilter{
					CategoryID:  args.CategoryID,
					Name:        displayName, // اگر نیاز به اسلاگ جدا دارید، همین‌جا اعمال کنید
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

func norm(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}
