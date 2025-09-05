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

	// گارد ساده صفحه‌بندی (بدون تغییر سبک)
	if limit < 0 {
		limit = 0 // 0 یعنی بدون Limit
	}
	if offset < 0 {
		offset = 0
	}

	// -------- Count (بدون JOIN) --------
	countQ := db.Table("report AS r")
	if domain.IsReportStateValid(int16(filter.State)) {
		countQ = countQ.Where("r.state_c = ?", filter.State)
	}
	if s := strings.TrimSpace(filter.SearchText); s != "" {
		like := "%" + s + "%"
		countQ = countQ.Where("(r.title ILIKE ? OR r.description ILIKE ?)", like, like)
	}
	if err := countQ.Model(&domain.Report{}).Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}
	if totalCount == 0 {
		return []*domain.ReportViewModel{}, 0, nil
	}
	if offset >= int(totalCount) {
		offset = 0 // یا می‌تونی clamp کنی به آخرین صفحه
	}

	// -------- Data (JOIN فقط یک‌بار) --------
	dataQ := db.Table("report AS r")
	if domain.IsReportStateValid(int16(filter.State)) {
		dataQ = dataQ.Where("r.state_c = ?", filter.State)
	}
	if s := strings.TrimSpace(filter.SearchText); s != "" {
		like := "%" + s + "%"
		dataQ = dataQ.Where("(r.title ILIKE ? OR r.description ILIKE ?)", like, like)
	}

	dataQ = dataQ.
		Joins("LEFT JOIN user_t AS u  ON u.id  = r.user_id").
		Joins("LEFT JOIN user_t AS tu ON tu.id = r.target_user_id").
		Joins("LEFT JOIN city   AS uc ON uc.id = u.city_id").
		Joins("LEFT JOIN city   AS tuc ON tuc.id = tu.city_id").
		Order("r.id DESC")

	if limit > 0 {
		dataQ = dataQ.Limit(limit).Offset(offset)
	}

	err = dataQ.Select(
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
	).Scan(&reports).Error
	if err != nil {
		return nil, 0, err
	}

	return reports, totalCount, nil
}
