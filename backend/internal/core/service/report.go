package service

import (
	"context"
	"errors"

	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

type ReportService struct {
	dbms     port.DBMS
	repo     port.ReportRepository
	userRepo port.UserRepository
}

func RegisterReportService(dbms port.DBMS, repo port.ReportRepository,
	ur port.UserRepository) *ReportService {
	return &ReportService{
		dbms,
		repo,
		ur,
	}
}

func (rs *ReportService) CreateReport(ctx context.Context, report *domain.Report) (
	id int64, err error) {
	db, err := rs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = rs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		report.State = domain.ReportStateNew

		err = validateNewReport(ctx, report)
		if err != nil {
			return err
		}

		targetUser, err := rs.userRepo.GetUserByID(ctx, txSession, report.TargetUserID)
		if err != nil {
			return err
		}

		if targetUser.State != domain.ApprovedUser {
			return errors.New(msg.ErrTargetUserIsNotApproved)
		}

		if targetUser.Role != domain.Wholesaler {
			return errors.New(msg.ErrReportingNonWholeSalerUserIsNotAllowed)
		}

		id, err = rs.repo.CreateReport(ctx, txSession, report)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return id, nil
}

func (rs *ReportService) GetReportByID(ctx context.Context, id int64) (
	report *domain.ReportViewModel, err error) {
	db, err := rs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = rs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		report, err = rs.repo.GetReportByID(ctx, txSession, id)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return report, nil
}

func (rs *ReportService) BatchDeleteReports(ctx context.Context, ids []int64) (err error) {
	db, err := rs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = rs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		err = rs.repo.BatchDeleteReports(ctx, txSession, ids)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}

func (rs *ReportService) ChangeReportState(ctx context.Context, reportID int64,
	targetState domain.ReportState) (err error) {
	db, err := rs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = rs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		report, err := rs.repo.GetReportByID(ctx, txSession, reportID)
		if err != nil {
			return err
		}

		if report.State == targetState {
			return nil
		}

		err = validateReportChangeState(ctx, &report.Report, targetState)
		if err != nil {
			return err
		}

		report.State = targetState
		err = rs.repo.UpdateReport(ctx, txSession, &report.Report)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return nil
}

func (rs *ReportService) GetReportsByFilter(ctx context.Context, filter *domain.ReportFilter,limit int,offset int) (
	reports []*domain.ReportViewModel,totalCount int64, err error) {
	db, err := rs.dbms.NewDB(ctx)
	if err != nil {
		return
	}

	err = rs.dbms.BeginTransaction(ctx, db, func(txSession interface{}) error {
		reports,totalCount, err = rs.repo.GetReportsByFilter(ctx, txSession, filter,limit,offset)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return
	}

	return reports,totalCount, nil
}

func validateNewReport(_ context.Context, report *domain.Report) (err error) {
	if report == nil {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if report.UserID < 1 {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if report.TargetUserID < 1 {
		return errors.New(msg.ErrDataIsNotValid)
	}

	if report.Title == "" {
		return errors.New(msg.ErrReportTitleCannotBeEmpty)
	}

	if report.Description == "" {
		return errors.New(msg.ErrReportDescriptionCannotBeEmpty)
	}

	if !domain.IsReportStateValid(int16(report.State)) {
		return errors.New(msg.ErrReportStateIsNotValid)
	}

	return nil
}

func validateReportChangeState(_ context.Context, report *domain.Report,
	targetState domain.ReportState) (err error) {
	isValid := true

	switch targetState {
	case domain.ReportStateChecked:
		if report.State != domain.ReportStateNew {
			isValid = false
		}
	default:
		isValid = false
	}

	if !isValid {
		return errors.New(msg.ErrUserChangeStateIsNotValid)
	}

	return nil
}
