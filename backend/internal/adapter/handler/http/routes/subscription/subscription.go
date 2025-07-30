package subscription

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.SubscriptionHandler) {
	adminSubscriptionGroup := parent.Group("/subscription").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminSubscriptionGroup.POST("/create", handler.Create)
	adminSubscriptionGroup.PUT("/update", handler.Update)
	adminSubscriptionGroup.GET("/fetch/:id", handler.Fetch)
	adminSubscriptionGroup.POST("/batch-delete", handler.BatchDelete)
	adminSubscriptionGroup.GET("/fetch-all", handler.FetchAllSubscriptions)
}
