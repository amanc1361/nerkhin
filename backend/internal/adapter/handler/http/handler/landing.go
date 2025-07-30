package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/port"
)

type LandingHandler struct {
	service      port.LandingService
	TokenService port.TokenService
	AppConfig    config.App
}

func RegisterLandingHandler(service port.LandingService, tokenService port.TokenService,
	appConfig config.App) *LandingHandler {
	return &LandingHandler{
		service,
		tokenService,
		appConfig,
	}
}

type landingResponse struct {
	ProductCount    int64 `json:"productCount"`
	WholesalerCount int64 `json:"wholesalerCount"`
	RetailerCount   int64 `json:"retailerCount"`
}

func (lh *LandingHandler) GetLandingPage(c *gin.Context) {
	ctx := c.Request.Context()

	landingData, err := lh.service.GetLandingPage(ctx)
	if err != nil {
		HandleError(c, err, lh.AppConfig.Lang)
		return
	}

	resp := landingResponse{
		ProductCount:    landingData.ProductCount,
		WholesalerCount: landingData.WholesalerCount,
		RetailerCount:   landingData.RetailerCount,
	}

	handleSuccess(c, resp)
}
