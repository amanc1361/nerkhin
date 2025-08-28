package productbrand

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductBrandHandler) {
	productBrandGroup := parent.Group("/product-brand").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	productBrandGroup.GET("/fetch-all/:categoryId", handler.FetchAll)
	productBrandGroup.GET("/fetch-brands/:categoryId", handler.FetchBrands)
	productBrandGroup.GET("/fetch/:id", handler.Fetch)
	adminProductBrandGroup := productBrandGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminProductBrandGroup.POST("/create", handler.Create)
	adminProductBrandGroup.PUT("/update", handler.Update)
	adminProductBrandGroup.DELETE("/:id", handler.Delete)

}
