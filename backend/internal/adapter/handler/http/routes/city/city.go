package city

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.CityHandler) {
	cityGroup := parent.Group("/city")
	cityGroup.GET("/fetch-all", handler.FetchAll)

	adminCityGroup := cityGroup.Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig),
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminCityGroup.POST("/create", handler.Create)
	adminCityGroup.PUT("/update", handler.Update)
	adminCityGroup.GET("/fetch/:id", handler.Fetch)
	adminCityGroup.POST("/batch-delete", handler.BatchDelete)
}
