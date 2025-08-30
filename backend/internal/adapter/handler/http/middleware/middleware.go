package middleware

import (
	"errors"

	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/adapter/config"
	"github.com/nerkhin/internal/adapter/handler/http/handler"
	httputil "github.com/nerkhin/internal/adapter/handler/http/helper"
	"github.com/nerkhin/internal/core/domain"
	"github.com/nerkhin/internal/core/domain/msg"
	"github.com/nerkhin/internal/core/port"
)

const (
	authorizationHeaderKey  = "authorization"
	authorizationType       = "bearer"
	authorizationPayloadKey = "authorization_payload"
)

func AuthMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	return func(c *gin.Context) {

		authorizationHeader := c.GetHeader("Authorization")

		if len(authorizationHeader) == 0 {

			handler.HandleAbort(c, errors.New(msg.ErrEmptyAuthorizationHeader), appConfig.Lang)
			return
		}

		fields := strings.Fields(authorizationHeader)

		if len(fields) != 2 {

			handler.HandleAbort(c, errors.New(msg.ErrInvalidAuthorizationHeader), appConfig.Lang)
			return
		}

		if strings.ToLower(fields[0]) != "bearer" {

			handler.HandleAbort(c, errors.New(msg.ErrInvalidAuthorizationType), appConfig.Lang)
			return
		}

		tokenString := fields[1]
		if strings.Contains(c.Request.URL.Path, "/product-model/by-brand") {

		}

		payload, err := token.VerifyAccessToken(tokenString)

		if err != nil || payload == nil {

			handler.HandleAbort(c, errors.New(msg.ErrInvalidToken), appConfig.Lang)
			return
		}

		c.Set(httputil.AuthPayloadKey, payload)
		c.Set("user_id", payload.UserID)

		c.Next()
	}
}

func AdminMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		payload := httputil.GetAuthPayload(ctx)

		if payload == nil {
			handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
			return
		}

		isAdmin := payload.UserRole == domain.SuperAdmin || payload.UserRole == domain.Admin
		if !isAdmin {
			err := errors.New(msg.ErrOperationNotAllowedForThisUser)
			handler.HandleAbort(ctx, err, appConfig.Lang)
			return
		}

		ctx.Next()
	}
}

func ApprovedUserMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		// استخراج payload
		val, exists := ctx.Get(httputil.AuthPayloadKey)
		if !exists {
			handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
			return
		}

		payload, ok := val.(*domain.TokenPayload)
		if !ok || payload == nil {
			handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
			return
		}

		// بررسی وضعیت تأیید کاربر
		if payload.UserState != domain.ApprovedUser {
			handler.HandleAbort(ctx, errors.New(msg.ErrOperationNotAllowedForNonApprovedUser), appConfig.Lang)
			return
		}

		// ادامه پردازش
		ctx.Next()
	}
}

func NonAdminMiddleware(token port.TokenService, appConfig config.App) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		payload := httputil.GetAuthPayload(ctx)
		if payload == nil {
			handler.HandleAbort(ctx, errors.New(msg.ErrUnauthorized), appConfig.Lang)
			return
		}

		isNonAdmin := payload.UserRole != domain.SuperAdmin && payload.UserRole != domain.Admin
		if !isNonAdmin {
			err := errors.New(msg.ErrOperationNotAllowedForThisUser)
			handler.HandleAbort(ctx, err, appConfig.Lang)
			return
		}

		ctx.Next()
	}
}
