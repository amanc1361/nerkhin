package productmodel

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductModelHandler) {
	productModelGroup := parent.Group("/product-model").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	productModelGroup.GET("/fetch-all/:categoryId", handler.FetchAll)
	productModelGroup.GET("/fetch-models/:categoryId", handler.FetchModels)
	productModelGroup.GET("/by-brand/:brandId", handler.FetchModelsByBrandID)
	adminProductModelGroup := productModelGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminProductModelGroup.POST("/create", handler.Create)
	adminProductModelGroup.PUT("/update", handler.Update)
	adminProductModelGroup.GET("/fetch/:id", handler.Fetch)
	adminProductModelGroup.POST("/delete", handler.Delete)
}
