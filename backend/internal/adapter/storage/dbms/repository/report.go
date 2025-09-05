package repository

import (
	"context"
	"strings"

	"github.com/nerkhin/internal/adapter/storage/util/gormutil"
	"github.com/nerkhin/internal/core/domain"
)

type ReportRepository struct{}

func (rr *ReportRepository) CreateReport(ctx context.Context, dbSession interface{},
	report *domain.Report) (
	id int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Create(&report).Error
	if err != nil {
		return
	}

	id = report.ID
	return id, nil
}

func (rr *ReportRepository) UpdateReport(ctx context.Context, dbSession interface{},
	report *domain.Report) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Omit(
		"user_id",
		"created_at",
	).Updates(report).Error
	if err != nil {
		return
	}

	return nil
}

func (rr *ReportRepository) GetReportByID(ctx context.Context,
	dbSession interface{}, id int64) (report *domain.ReportViewModel, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Table("report AS r").
		Joins("JOIN user_t AS u ON u.id = r.user_id").
		Joins("JOIN user_t AS tu ON tu.id = r.target_user_id").
		Joins("JOIN city AS uc ON uc.id = u.city_id").
		Joins("JOIN city AS tuc ON tuc.id = tu.city_id").
		Select(
			"r.*",
			"u.full_name         AS user_full_name",
			"u.shop_name         AS user_shop_name",
			"u.phone             AS user_phone",
			"u.role              AS user_role",
			"uc.name             AS user_city",
			"tu.full_name        AS target_user_full_name",
			"tu.shop_name        AS target_user_shop_name",
			"tu.phone            AS target_user_phone",
			"tu.role             AS target_user_role",
			"tuc.name            AS target_user_city",
		).
		Where("r.id = ?", id).
		Scan(&report).Error
	if err != nil {
		return
	}

	return report, nil
}

func (rr *ReportRepository) BatchDeleteReports(ctx context.Context, dbSession interface{},
	ids []int64) (err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return
	}

	err = db.Model(&domain.Report{}).
		Where("id IN ?", ids).
		Delete(&domain.Report{}).Error
	if err != nil {
		return
	}

	return nil
}
func (rr *ReportRepository) GetReportsByFilter(
	ctx context.Context,
	dbSession interface{},
	filter *domain.ReportFilter,
	limit int,
	offset int,
) (reports []*domain.ReportViewModel, totalCount int64, err error) {
	db, err := gormutil.CastToGORM(ctx, dbSession)
	if err != nil {
		return nil, 0, err
	}

	// گاردهای صفحه‌بندی
	if limit <= 0 || limit > 200 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	base := db.Table("report AS r")

	if domain.IsReportStateValid(int16(filter.State)) {
		base = base.Where("r.state_c = ?", filter.State)
	}
	if strings.TrimSpace(filter.SearchText) != "" {
		search := "%" + strings.TrimSpace(filter.SearchText) + "%"
		base = base.Where("(r.title ILIKE ? OR r.description ILIKE ?)", search, search)
	}

	// Count با LEFT JOIN و DISTINCT
	countQ := base.
		Joins("LEFT JOIN user_t AS u  ON u.id  = r.user_id").
		Joins("LEFT JOIN user_t AS tu ON tu.id = r.target_user_id").
		Distinct("r.id")

	if err := countQ.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}
	// فقط اگر واقعاً هیچ رکوردی نبود خالی برگردون
	if totalCount == 0 {
		return []*domain.ReportViewModel{}, 0, nil
	}
	// اگر offset نامعتبر بود، صفرش کن (یا می‌تونی به آخرین صفحه کلَمپ کنی)
	if offset >= int(totalCount) {
		offset = 0
	}

	// Data query با LEFT JOIN
	dataQ := base.
		Joins("LEFT JOIN user_t AS u  ON u.id  = r.user_id").
		Joins("LEFT JOIN user_t AS tu ON tu.id = r.target_user_id").
		Joins("LEFT JOIN city   AS uc ON uc.id = u.city_id").
		Joins("LEFT JOIN city   AS tuc ON tuc.id = tu.city_id").
		Order("r.id DESC").
		Select(
			"r.*",
			"u.full_name  AS user_full_name",
			"u.shop_name  AS user_shop_name",
			"u.phone      AS user_phone",
			"u.role       AS user_role",
			"uc.name      AS user_city",
			"tu.full_name AS target_user_full_name",
			"tu.shop_name AS target_user_shop_name",
			"tu.phone     AS target_user_phone",
			"tu.role      AS target_user_role",
			"tuc.name     AS target_user_city",
		)

	// اگر می‌خوای فعلاً همه بیاد، Limit/Offset رو نذار؛
	// ولی بهتره نگهش داریم با offset کلَمپ‌شده:
	if err := dataQ.Limit(limit).Offset(offset).Scan(&reports).Error; err != nil {
		return nil, 0, err
	}

	return reports, totalCount, nil
}

// func (rr *ReportRepository) GetReportsByFilter(ctx context.Context, dbSession interface{},
// 	filter *domain.ReportFilter) (reports []*domain.ReportViewModel, err error) {
// 	db, err := gormutil.CastToGORM(ctx, dbSession)
// 	if err != nil {
// 		return
// 	}

// 	reports = []*domain.ReportViewModel{}
// 	query := db.Table("report AS r")

// 	if domain.IsReportStateValid(int16(filter.State)) {
// 		query = query.Where("r.state_c = ?", filter.State)
// 	}

// 	if filter.SearchText != "" {
// 		searchQuery := "%" + filter.SearchText + "%"
// 		query = query.Where("r.title LIKE ?", searchQuery)
// 	}

// 	err = query.
// 		Joins("JOIN user_t AS u ON u.id = r.user_id").
// 		Joins("JOIN user_t AS tu ON tu.id = r.target_user_id").
// 		Joins("JOIN city AS uc ON uc.id = u.city_id").
// 		Joins("JOIN city AS tuc ON tuc.id = tu.city_id").
// 		Order("r.id ASC").
// 		Select(
// 			"r.*",
// 			"u.full_name         AS user_full_name",
// 			"u.shop_name         AS user_shop_name",
// 			"u.phone             AS user_phone",
// 			"u.role              AS user_role",
// 			"uc.name             AS user_city",
// 			"tu.full_name        AS target_user_full_name",
// 			"tu.shop_name        AS target_user_shop_name",
// 			"tu.phone            AS target_user_phone",
// 			"tu.role             AS target_user_role",
// 			"tuc.name            AS target_user_city",
// 		).Scan(&reports).Error
// 	if err != nil {
// 		return
// 	}

// 	return reports, nil
// }
