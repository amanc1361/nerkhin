package userproduct

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.UserProductHandler) {
	userProductGroup := parent.Group("/user-product").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.NonAdminMiddleware(handler.TokenService, handler.AppConfig))

	userProductGroup.POST("/create", handler.Create)
	userProductGroup.POST("/update", handler.Update)
	userProductGroup.GET("/fetch-shop", handler.FetchShopProducts)
	userProductGroup.POST("/change-order", handler.ChangeOrder)
	userProductGroup.POST("/fetch-products", handler.FetchProductsByFilter)
	userProductGroup.GET("/fetch-shops/:productId", handler.FetchShops)
	userProductGroup.GET("/fetch-price-list", handler.FetchPriceList)
	userProductGroup.GET("/fetch-shop/:uid", handler.FetchShopByUserId)
	userProductGroup.GET("/fetch/:upId", handler.Fetch)
	userProductGroup.DELETE("/delete", handler.Delete)
	userProductGroup.POST("/change-status", handler.ChangeVisibilityStatus)
}
