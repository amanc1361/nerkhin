package repository

import (
	"context"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ProductFilterRepository struct{}

func (pfr *ProductFilterRepository) CreateProductFilterOption(ctx context.Context, dbSession interface{}, filterOption *domain.ProductFilterOption) (filterOptionId int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return 0, err
	}
	err = db.Create(&filterOption).Error
	if err != nil {
		return 0, err
	}
	return filterOption.ID, nil
}

func (pfr *ProductFilterRepository) CreateProductFilter(ctx context.Context, dbSession interface{},
	filterData *domain.ProductFilterData) (filterID int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&filterData.Filter).Error
	if err != nil {
		return
	}
	filterID = filterData.Filter.ID

	if len(filterData.Options) == 0 {
		return
	}

	for _, option := range filterData.Options {
		option.FilterID = filterID
	}

	err = db.Create(&filterData.Options).Error
	if err != nil {
		return
	}

	return filterID, nil
}

func (pfr *ProductFilterRepository) UpdateProductFilter(ctx context.Context, dbSession interface{},
	filterData *domain.ProductFilterData) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Save(&filterData.Filter).Error
	if err != nil {
		return
	}

	if len(filterData.Options) > 0 {
		err = db.Save(&filterData.Options).Error
		if err != nil {
			return
		}
	}

	return nil
}

func (pfr *ProductFilterRepository) GetAllProductFilters(ctx context.Context,
	dbSession interface{}, categoryID int64) (resultData []*domain.ProductFilterData, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	filters := []*domain.ProductFilter{}
	err = db.Model(&domain.ProductFilter{}).
		Where("category_id = ?", categoryID).
		Order("id ASC").
		Scan(&filters).Error
	if err != nil {
		return
	}

	filterIDs := []int64{}
	for _, filter := range filters {
		filterIDs = append(filterIDs, filter.ID)
	}

	filterOptions := []*domain.ProductFilterOption{}
	err = db.Model(&domain.ProductFilterOption{}).
		Where("filter_id IN ?", filterIDs).
		Order("id ASC").
		Scan(&filterOptions).Error
	if err != nil {
		return
	}

	dataMap := map[int64]*domain.ProductFilterData{}
	for _, filter := range filters {
		dataMap[filter.ID] = &domain.ProductFilterData{
			Filter:  filter,
			Options: []*domain.ProductFilterOption{},
		}
	}

	for _, filterOption := range filterOptions {
		filterData, ok := dataMap[filterOption.FilterID]
		if ok {
			filterData.Options = append(filterData.Options, filterOption)
		}
	}

	resultData = []*domain.ProductFilterData{}
	for _, filterData := range dataMap {
		resultData = append(resultData, filterData)
	}

	return resultData, nil
}

func (pfr *ProductFilterRepository) BatchDeleteProductFilters(ctx context.Context,
	dbSession interface{}, filterIDs []int64) (err error) {
	if len(filterIDs) == 0 {
		return
	}

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductFilter{}).
		Where("id IN ?", filterIDs).
		Delete(&domain.ProductFilter{}).Error
	if err != nil {
		return
	}

	return nil
}

func (pfr *ProductFilterRepository) BatchDeleteProductFilterOptions(ctx context.Context,
	dbSession interface{}, filterOptionIDs []int64) (err error) {
	if len(filterOptionIDs) == 0 {
		return
	}

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductFilterOption{}).
		Where("id IN ?", filterOptionIDs).
		Delete(&domain.ProductFilterOption{}).Error
	if err != nil {
		return
	}

	return nil
}

func (pfr *ProductFilterRepository) GetFilterOptionsByIDs(ctx context.Context,
	dbSession interface{}, filterOptionIDs []int64) (
	filterOptions []*domain.ProductFilterOption, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	filterOptions = []*domain.ProductFilterOption{}
	err = db.Model(&domain.ProductFilterOption{}).
		Where("id IN ?", filterOptionIDs).
		Order("id ASC").
		Scan(&filterOptions).Error
	if err != nil {
		return
	}

	return filterOptions, nil
}

func (pfr *ProductFilterRepository) CreateProductFilterRelations(ctx context.Context,
	dbSession interface{}, relations []*domain.ProductFilterRelation) (err error) {
	if len(relations) == 0 {
		return
	}

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&relations).Error
	if err != nil {
		return
	}

	return nil
}

func (pfr *ProductFilterRepository) UpdateProductFilterRelations(ctx context.Context,
	dbSession interface{}, updatedFilterRelations []*domain.ProductFilterRelation,
	defaultOptionID int64) (err error) {
	if len(updatedFilterRelations) == 0 {
		return
	}

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	for _, relation := range updatedFilterRelations {
		relation.IsDefault = relation.FilterOptionID == defaultOptionID
		err = db.Omit("product_id", "filter_id").
			Updates(&relation).Error
		if err != nil {
			return
		}
	}

	return
}

func (pfr *ProductFilterRepository) DeleteProductFilterRelations(ctx context.Context,
	dbSession interface{}, deletedRelationIDs []int64) (err error) {
	if len(deletedRelationIDs) == 0 {
		return
	}

	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.ProductFilterRelation{}).
		Where("id IN ?", deletedRelationIDs).
		Delete(&domain.ProductFilterRelation{}).Error
	if err != nil {
		return
	}

	return
}

func (pfr *ProductFilterRepository) GetProductFilterRelations(ctx context.Context,
	dbSession interface{}, productID int64) (
	filterRelations []*domain.ProductFilterRelationViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("product_filter_relation AS pfr").
		Joins("LEFT JOIN product_filter AS pf ON pf.id = pfr.filter_id").
		Joins("LEFT JOIN product_filter_option AS pfo ON pfo.id = pfr.filter_option_id").
		Where("pfr.product_id = ?", productID).
		Order("pfr.id ASC").
		Select(
			"pfr.*",
			"pf.name 					AS filter_name",
			"pf.display_name 	AS filter_display_name",
			"pfo.name 				AS filter_option_name",
		).
		Scan(&filterRelations).Error
	if err != nil {
		return
	}
	if filterRelations == nil {
		return []*domain.ProductFilterRelationViewModel{}, nil
	}

	return filterRelations, nil
}

func (pfr *ProductFilterRepository) GetProductFiltersMapByProductIDs(ctx context.Context,
	dbSession interface{}, productIDs []int64) (resultMap map[int64][]*domain.ProductFilterData,
	err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	relations := []*domain.ProductFilterRelation{}
	err = db.Model(&domain.ProductFilterRelation{}).
		Where("product_id IN ?", productIDs).
		Scan(&relations).Error
	if err != nil {
		return
	}

	filterIDsMap := make(map[int64]struct{})

	filterIDs := []int64{}
	for _, relation := range relations {
		_, ok := filterIDsMap[relation.FilterID]
		if !ok {
			filterIDs = append(filterIDs, relation.FilterID)
			filterIDsMap[relation.FilterID] = struct{}{}
		}
	}

	filters := []*domain.ProductFilter{}
	err = db.Model(&domain.ProductFilter{}).
		Where("id IN ?", filterIDs).
		Scan(&filters).Error
	if err != nil {
		return
	}

	filtersMap := map[int64]*domain.ProductFilter{}
	for _, filter := range filters {
		filtersMap[filter.ID] = filter
	}

	filterOptions := []*domain.ProductFilterOption{}
	err = db.Model(&domain.ProductFilterOption{}).
		Where("filter_id IN ?", filterIDs).
		Scan(&filterOptions).Error
	if err != nil {
		return
	}

	optionsMap := make(map[int64]*domain.ProductFilterOption)
	for _, option := range filterOptions {
		optionsMap[option.ID] = option
	}

	// for _, relation := range relations {
	// 	filterData, filterExists := prodFiltersMap[relation.FilterID]
	// 	if !filterExists {
	// 		return nil, errors.New(msg.ErrDataIsNotValid)
	// 	}

	// 	targetOption, ok := optionsMap[relation.FilterOptionID]
	// 	if ok {
	// 		filterData.Options = append(filterData.Options, targetOption)
	// 	}
	// }

	// prodIDFilterOptionMap := map[int64]map[int64]*domain.ProductFilterOption{}
	// for _, relation := range relations {
	// 	option, ok := optionsMap[relation.FilterOptionID]
	// 	if !ok {
	// 		continue
	// 	}

	// 	_, ok = prodIDFilterOptionMap[relation.ProductID]
	// 	if !ok {
	// 		prodIDFilterOptionMap[relation.ProductID] = map[int64]*domain.ProductFilterOption{}
	// 	}

	// 	prodIDFilterOptionMap[relation.ProductID][relation.FilterOptionID] = option
	// }

	productFilterMap := map[int64]map[int64]*domain.ProductFilterData{}
	for _, relation := range relations {
		filter, ok := filtersMap[relation.FilterID]
		if !ok {
			continue
		}

		option, ok := optionsMap[relation.FilterOptionID]
		if !ok {
			continue
		}

		_, ok = productFilterMap[relation.ProductID]
		if !ok {
			productFilterMap[relation.ProductID] = make(map[int64]*domain.ProductFilterData)
		}

		_, ok = productFilterMap[relation.ProductID][relation.FilterID]
		if !ok {
			productFilterMap[relation.ProductID][relation.FilterID] = &domain.ProductFilterData{
				Filter:  filter,
				Options: []*domain.ProductFilterOption{option},
			}
		} else {
			productFilterMap[relation.ProductID][relation.FilterID].Options = append(
				productFilterMap[relation.ProductID][relation.FilterID].Options, option)
		}
	}

	dataMap := map[int64][]*domain.ProductFilterData{}
	for _, relation := range relations {
		_, ok := dataMap[relation.ProductID]
		if ok {
			continue
		}

		filterDataMap := productFilterMap[relation.ProductID]
		if len(filterDataMap) == 0 {
			continue
		}

		for _, filterData := range filterDataMap {
			dataMap[relation.ProductID] = append(dataMap[relation.ProductID], filterData)
		}
	}

	return dataMap, nil
}

func (pfr *ProductFilterRepository) GetProductFilterRelationsMapByProductIDs(ctx context.Context,
	dbSession interface{}, productIDs []int64) (
	filterRelationsMap map[int64]*domain.ProductFilterRelationViewModel, err error) {
	filterRelationsMap = map[int64]*domain.ProductFilterRelationViewModel{}
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	filterRelations := []*domain.ProductFilterRelationViewModel{}
	err = db.Table("product_filter_relation AS pfr").
		Joins("LEFT JOIN product_filter AS pf ON pf.id = pfr.filter_id").
		Joins("LEFT JOIN product_filter_option AS pfo ON pfo.id = pfr.filter_option_id").
		Where("pfr.product_id IN ?", productIDs).
		Order("pfr.id ASC").
		Select(
			"pfr.*",
			"pf.name 					AS filter_name",
			"pf.display_name 	AS filter_display_name",
			"pfo.name 				AS filter_option_name",
		).
		Scan(&filterRelations).Error
	if err != nil {
		return
	}
	if filterRelations == nil {
		return filterRelationsMap, nil
	}

	for _, rel := range filterRelations {
		if !rel.IsDefault {
			continue
		}

		filterRelationsMap[rel.ProductID] = rel
	}

	return filterRelationsMap, nil
}

func (pfr *ProductFilterRepository) GetFiltersByFilterOptionIDs(ctx context.Context,
	dbSession interface{}, filterOptionIDs []int64) (
	filters []*domain.ProductFilter, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	filters = []*domain.ProductFilter{}
	err = db.Table("product_filter AS pf").
		Joins("LEFT JOIN product_filter_option AS pfo ON pfo.filter_id = pf.id").
		Where("pfo.id IN ?", filterOptionIDs).
		Select(
			"pf.*",
		).
		Order("pf.id ASC").
		Scan(&filters).Error
	if err != nil {
		return
	}

	return filters, nil
}
