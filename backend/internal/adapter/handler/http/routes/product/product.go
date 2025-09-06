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
	fast := parent.Group("/product")

	productGroup.POST("/fetch-products", handler.FetchProductsByFilter)
	productGroup.GET("/fetch/:id", handler.Fetch)
	productGroup.GET("/by-brand/:brandId", handler.GetByBrand)
	productGroup.GET("/by-category/:categoryId", handler.GetByCategory)
	productGroup.GET("/product-name/:brandId", handler.GetProductNameByBrandID)
	fast.POST("/import-csv", handler.ImportFromCSV)

	adminProductGroup := productGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminProductGroup.POST("/create", handler.Create)
	adminProductGroup.POST("/update", handler.Update)
	adminProductGroup.DELETE("/delete/:id", handler.Delete)
}
