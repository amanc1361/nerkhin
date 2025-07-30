package httputil

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nerkhin/internal/core/domain"
)

var (
	AuthPayloadKey = "AuthorizationPayload"
)

func StringToUint64(str string) (uint64, error) {
	num, err := strconv.ParseUint(str, 10, 64)

	return num, err
}

//	func GetAuthPayload(ctx *gin.Context) *domain.TokenPayload {
//		return ctx.MustGet(AuthPayloadKey).(*domain.TokenPayload)
//	}
func GetAuthPayload(ctx *gin.Context) *domain.TokenPayload {
	val, exists := ctx.Get(AuthPayloadKey)
	if !exists {
		return nil
	}
	payload, ok := val.(*domain.TokenPayload)
	if !ok {
		return nil
	}
	return payload
}
