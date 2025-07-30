package product

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductHandler) {
	productGroup := parent.Group("/product").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	productGroup.POST("/fetch-products", handler.FetchProductsByFilter)
	productGroup.GET("/fetch/:id", handler.Fetch)
	productGroup.GET("/by-brand/:brandId", handler.GetByBrand)
	productGroup.GET("/by-category/:categoryId", handler.GetByCategory)

	adminProductGroup := productGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminProductGroup.POST("/create", handler.Create)
	adminProductGroup.POST("/update", handler.Update)
	adminProductGroup.DELETE("/delete/:id", handler.Delete)
}
