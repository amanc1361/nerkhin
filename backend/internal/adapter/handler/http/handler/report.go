package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type ReportHandler struct {
	service      port.ReportService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterReportHandler(service port.ReportService, tokenService port.TokenService,
	appConfig config.App) *ReportHandler {
	return &ReportHandler{
		service,
		tokenService,
		appConfig,
	}
}

type createReportRequest struct {
	TargetUserID int64  `json:"targetUserId"`
	Title        string `json:"title"`
	Description  string `json:"description"`
}

type createReportResponse struct {
	ID int64 `json:"id" example:"1"`
}

func (rh *ReportHandler) Create(c *gin.Context) {
	var req createReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, rh.AppConfig.Lang)
		return
	}

	authPayload := httputil.GetAuthPayload(c)

	ctx := c.Request.Context()
	report := &domain.Report{
		UserID:       authPayload.UserID,
		TargetUserID: req.TargetUserID,
		Title:        req.Title,
		Description:  req.Description,
		State:        domain.ReportStateNew,
	}

	id, err := rh.service.CreateReport(ctx, report)
	if err != nil {
		HandleError(c, err, rh.AppConfig.Lang)
		return
	}

	resp := createReportResponse{
		ID: id,
	}

	handleSuccess(c, resp)
}

type changeReportStateRequest struct {
	ReportID    int64              `json:"reportId"`
	TargetState domain.ReportState `json:"targetState"`
}

func (rh *ReportHandler) ChangeState(c *gin.Context) {
	var req changeReportStateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, rh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := rh.service.ChangeReportState(ctx, req.ReportID, req.TargetState)
	if err != nil {
		HandleError(c, err, rh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchReportRequest struct {
	ID int64 `uri:"id" example:"1"`
}

func (rh *ReportHandler) Fetch(c *gin.Context) {
	var req fetchReportRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, rh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	report, err := rh.service.GetReportByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, rh.AppConfig.Lang)
		return
	}

	handleSuccess(c, report)
}

type deleteReportsRequest struct {
	Ids []int64 `json:"ids" example:"[1, 2]"`
}

func (rh *ReportHandler) BatchDelete(c *gin.Context) {
	var req deleteReportsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, rh.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := rh.service.BatchDeleteReports(ctx, req.Ids)
	if err != nil {
		HandleError(c, err, rh.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

type fetchReportByFilterRequest struct {
	State      int16  `json:"state"`
	SearchText string `json:"searchText"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
}

type fetchReportsByFilterResponse struct {
	Reports    []*domain.ReportViewModel `json:"reports"`
	TotalCount int64                     `json:"totalCount"`
}

func (rh *ReportHandler) FetchReportsByFilter(c *gin.Context) {
	var req fetchReportByFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, rh.AppConfig.Lang)
		return
	}
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 10
	}

	ctx := c.Request.Context()

	reports, totalCount, err := rh.service.GetReportsByFilter(ctx, &domain.ReportFilter{
		State:      domain.ReportState(req.State),
		SearchText: req.SearchText,
	}, req.Page, req.Limit)
	if err != nil {
		HandleError(c, err, rh.AppConfig.Lang)
		return
	}
	if reports == nil {
		reports = make([]*domain.ReportViewModel, 0)
	}
	responsePalod := fetchReportsByFilterResponse{
		Reports:    reports,
		TotalCount: totalCount,
	}
	handleSuccess(c, responsePalod)
}
