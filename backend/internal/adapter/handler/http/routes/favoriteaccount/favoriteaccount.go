package favoriteaccount

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.FavoriteAccountHandler) {
	FavoriteAccountGroup := parent.Group("/favorite-account").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.NonAdminMiddleware(handler.TokenService, handler.AppConfig))

	FavoriteAccountGroup.POST("/create", handler.Create)
	FavoriteAccountGroup.POST("/delete", handler.Delete)
	FavoriteAccountGroup.GET("/my-favorite-accounts", handler.GetFavoriteAccounts)
	FavoriteAccountGroup.GET("/my-customers", handler.GetMyCustomers)
}
