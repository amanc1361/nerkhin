package port

import (
	"context"

	"github.com/nerkhin/internal/core/domain"
)

type ReportRepository interface {
	CreateReport(ctx context.Context, db interface{}, model *domain.Report) (id int64, err error)
	UpdateReport(ctx context.Context, db interface{}, report *domain.Report) (err error)
	GetReportByID(ctx context.Context, db interface{}, id int64) (
		model *domain.ReportViewModel, err error)
	BatchDeleteReports(ctx context.Context, db interface{}, ids []int64) (err error)
	GetReportsByFilter(ctx context.Context, dbSession interface{}, filter *domain.ReportFilter, limit int, offset int) (
		reports []*domain.ReportViewModel, totalCount int64, err error)
}

type ReportService interface {
	CreateReport(ctx context.Context, model *domain.Report) (id int64, err error)
	GetReportByID(ctx context.Context, id int64) (model *domain.ReportViewModel, err error)
	BatchDeleteReports(ctx context.Context, ids []int64) (err error)
	ChangeReportState(ctx context.Context, reportID int64, targetState domain.ReportState) (err error)
	GetReportsByFilter(ctx context.Context, filter *domain.ReportFilter,limit int,offset int) (
		reports []*domain.ReportViewModel,totalCount int64, err error)
}
