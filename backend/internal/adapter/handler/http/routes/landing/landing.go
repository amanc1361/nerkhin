package landing

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.LandingHandler) {
	landing := parent.Group("/")

	landing.GET("/landing-info", handler.GetLandingPage)
}
