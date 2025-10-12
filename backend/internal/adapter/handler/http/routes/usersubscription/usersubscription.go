package usersubscription

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.UserSubscriptionHandler) {
	userSubscriptionGroup := parent.Group("/user-subscription").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	userSubscriptionGroup.POST("/fetch-payment-gateway-info", handler.FetchPaymentGatewayInfo)
	userSubscriptionGroup.POST("/create", handler.Create)
	userSubscriptionGroup.GET("/fetch/:cityId", handler.Fetch)
	userSubscriptionGroup.GET("/fetch-payment-transactions", handler.FetchPaymentTransactionsHistory)
	userSubscriptionGroup.GET("/fetch-user-subscriptions", handler.FetchUserSubscription)
	adminUserGroup := userSubscriptionGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))
	adminUserGroup.POST("/subscriptions/grant", handler.GrantSubscriptionDays)

}
