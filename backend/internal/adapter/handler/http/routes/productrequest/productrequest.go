package productrequest

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductRequestHandler) {
	adminProductRequestGroup := parent.Group("/product-request").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminProductRequestGroup.GET("/fetch/:id", handler.Fetch)
	adminProductRequestGroup.POST("/delete", handler.Delete)
	adminProductRequestGroup.GET("/fetch-all", handler.FetchAll)
	adminProductRequestGroup.POST("/mark-as-checked", handler.MarkAsChecked)

	nonAdminProductRequestGroup := parent.Group("/product-request").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.NonAdminMiddleware(handler.TokenService, handler.AppConfig))

	nonAdminProductRequestGroup.POST("/create", handler.Create)
}
