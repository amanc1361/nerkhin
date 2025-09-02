package productfilterroute

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.ProductFilterImportHandler) {
	productFilterImportGroup := parent.Group("/product-filter-import").Use(
		middleware.AuthMiddleware(handler.Token, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.Token, handler.AppConfig))

	productFilterImportGroup.POST("/import-csv", handler.ImportCSV)
}
