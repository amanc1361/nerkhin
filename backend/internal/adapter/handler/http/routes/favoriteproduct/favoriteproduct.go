package favoriteproduct

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.FavoriteProductHandler) {
	favoriteProductGroup := parent.Group("/favorite-product").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.NonAdminMiddleware(handler.TokenService, handler.AppConfig))

	favoriteProductGroup.POST("/create", handler.Create)
	favoriteProductGroup.POST("/delete", handler.Delete)
	favoriteProductGroup.GET("/my-favorite-products", handler.GetFavoriteProducts)
}
