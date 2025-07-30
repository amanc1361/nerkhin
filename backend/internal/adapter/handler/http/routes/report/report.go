package report

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ReportHandler) {
	adminReportGroup := parent.Group("/report").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminReportGroup.POST("/fetch-reports", handler.FetchReportsByFilter)
	adminReportGroup.POST("/batch-delete", handler.BatchDelete)
	adminReportGroup.POST("/change-state", handler.ChangeState)
	adminReportGroup.GET("/fetch/:id", handler.Fetch)

	nonAdminReportGroup := parent.Group("/report").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.NonAdminMiddleware(handler.TokenService, handler.AppConfig))

	nonAdminReportGroup.POST("/create", handler.Create)
}
