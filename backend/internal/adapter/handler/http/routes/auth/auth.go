package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
)

func AddRoutes(
	parent *gin.RouterGroup,
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
) {
	authGroup := parent.Group("/auth")

	authGroup.POST("/login", authHandler.Login)

	if userHandler != nil {
		authGroup.POST("/register", userHandler.Register)
	}

	authGroup.POST("/verify-code", authHandler.VerifyCode)

	authGroup.POST("/refresh-token", authHandler.RefreshAccessToken)
}
