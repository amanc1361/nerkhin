package user

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	"github.com/nerkhin/internal/adapter/handler/http/middleware"
)

func AddRoutes(parent *gin.RouterGroup, handler *handler.UserHandler) {
	userGroup := parent.Group("/user").Use(
		middleware.AuthMiddleware(handler.TokenService, handler.AppConfig),
		middleware.ApprovedUserMiddleware(handler.TokenService, handler.AppConfig))

	userGroup.PUT("/update", handler.Update)
	userGroup.GET("/fetch/:id", handler.FetchUser)
	userGroup.PUT("/update-shop", handler.UpdateShop)
	userGroup.GET("/fetch-user", handler.FetchUserInfo)
	userGroup.PUT("/update-dollar-price", handler.UpdateDollarPrice)
	userGroup.GET("dollar-price/:id", handler.GetDollarPrice)

	adminUserGroup := userGroup.Use(
		middleware.AdminMiddleware(handler.TokenService, handler.AppConfig))

	adminUserGroup.DELETE("/delete/:userId", handler.Delete)
	adminUserGroup.POST("/change-state", handler.ChangeState)
	adminUserGroup.POST("/fetch-users", handler.FetchUsersByFilter)
	adminUserGroup.POST("/add-new-user", handler.AddNewUser)
	adminUserGroup.POST("/add-new-admin", handler.AddNewAdmin)
	adminUserGroup.POST("/delete-admin/:adminId", handler.DeleteAdmin)
	adminUserGroup.GET("/get-admin-access/:adminId", handler.GetAdminAccess)
	adminUserGroup.POST("/update-admin-access/:adminId", handler.UpdateAdminAccess)
	adminUserGroup.PUT("/users/device-limit", handler.UpdateUserDeviceLimit)
	// ... داخل گروه ادمین
	adminUserGroup.GET("/users/:userId/devices", handler.ListUserDevices)
	adminUserGroup.DELETE("/users/:userId/devices/:deviceId", handler.DeleteUserDevice)
}
