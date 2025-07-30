package productcategory

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductCategoryHandler) {
	productCategoryGroup := parent.Group("/product-category").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	productCategoryGroup.POST("/fetch-categories", handler.FetchCategoriesByFilter)
	productCategoryGroup.GET("/fetch-main-categories", handler.FetchMainCategories)
	productCategoryGroup.GET("/fetch-sub-categories/:id", handler.FetchSubCategories)
	productCategoryGroup.GET("/fetch-brand-models/:categoryId", handler.FetchRelatedBrandModels)

	adminCategoryGroup := productCategoryGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminCategoryGroup.POST("/create", handler.Create)
	adminCategoryGroup.PUT("/update", handler.Update)
	adminCategoryGroup.GET("/fetch/:id", handler.Fetch)
	adminCategoryGroup.DELETE("/:id", handler.Delete)
	adminCategoryGroup.GET("/fetch-sub-categories-panel/:id", handler.FetchSubcategoriesForPanel)
}
