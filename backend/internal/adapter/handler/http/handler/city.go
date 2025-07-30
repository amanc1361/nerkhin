package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/port"
)

type CityHandler struct {
	service      port.CityService
	TokenService port.TokenService
	AppConfig    config.App
}

type saveCityRequest struct {
	ID   int64  `json:"id" example:"1"`
	Name string `json:"name" example:"TFi-60"`
	Type int16  `json:"type" example:"1"`
}

type saveCityResponse struct {
	ID      int64 `json:"id" example:"1"`
	Success bool  `json:"success"`
}

type fetchCityRequest struct {
	ID int64 `uri:"id" example:"1"`
}

type fetchCityResponse struct {
	ID   int64  `json:"id" example:"1"`
	Name string `json:"name" example:"TFi-60"`
	Type int16  `json:"type" example:"1"`
}

type deleteCityRequest struct {
	Ids []int64 `json:"ids" example:"[1, 2]"`
}

func RegisterCityHandler(service port.CityService, tokenService port.TokenService,
	appConfig config.App) *CityHandler {
	return &CityHandler{
		service,
		tokenService,
		appConfig,
	}
}

func (ch *CityHandler) Create(c *gin.Context) {
	var req saveCityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, ch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	city := &domain.City{
		Name: req.Name,
		Type: domain.CityType(req.Type),
	}

	id, err := ch.service.CreateCity(ctx, city)
	if err != nil {
		HandleError(c, err, ch.AppConfig.Lang)
		return
	}

	resp := saveCityResponse{
		ID:      id,
		Success: true,
	}

	handleSuccess(c, resp)
}

func (ch *CityHandler) Update(c *gin.Context) {
	var req saveCityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, ch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()
	city := &domain.City{
		ID:   req.ID,
		Name: req.Name,
		Type: domain.CityType(req.Type),
	}

	id, err := ch.service.UpdateCity(ctx, city)
	if err != nil {
		HandleError(c, err, ch.AppConfig.Lang)
		return
	}

	resp := saveCityResponse{
		ID:      id,
		Success: true,
	}

	handleSuccess(c, resp)
}

func (ch *CityHandler) Fetch(c *gin.Context) {
	var req fetchCityRequest
	if err := c.ShouldBindUri(&req); err != nil {
		validationError(c, err, ch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	city, err := ch.service.GetCityByID(ctx, req.ID)
	if err != nil {
		HandleError(c, err, ch.AppConfig.Lang)
		return
	}

	resp := fetchCityResponse{
		ID:   city.ID,
		Name: city.Name,
		Type: int16(city.Type),
	}

	handleSuccess(c, resp)
}

func (ch *CityHandler) BatchDelete(c *gin.Context) {
	var req deleteCityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationError(c, err, ch.AppConfig.Lang)
		return
	}

	ctx := c.Request.Context()

	err := ch.service.BatchDeleteCities(ctx, req.Ids)
	if err != nil {
		HandleError(c, err, ch.AppConfig.Lang)
		return
	}

	handleSuccess(c, nil)
}

func (ch *CityHandler) FetchAll(c *gin.Context) {
	ctx := c.Request.Context()

	cities, err := ch.service.GetAllCities(ctx)
	if err != nil {
		HandleError(c, err, ch.AppConfig.Lang)
		return
	}

	resp := []fetchCityResponse{}
	for _, city := range cities {
		fetchedCity := fetchCityResponse{
			ID:   city.ID,
			Name: city.Name,
			Type: int16(city.Type),
		}
		resp = append(resp, fetchedCity)
	}

	handleSuccess(c, resp)
}
