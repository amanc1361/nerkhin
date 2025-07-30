package productfilter

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductFilterHandler) {
	productFilterGroup := parent.Group("/product-filter").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	productFilterGroup.POST("/create", handler.Create)
	productFilterGroup.POST("/option/create", handler.CreateFilteroption)
	productFilterGroup.PUT("/update", handler.Update)
	productFilterGroup.GET("/fetch-all/:categoryId", handler.FetchAll)
	productFilterGroup.POST("/delete", handler.BatchDeleteProductFilters)
	productFilterGroup.POST("/delete-options", handler.BatchDeleteProductFilterOptions)
}
