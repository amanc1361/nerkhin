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
func GetUserID(c *gin.Context) (int64, bool) {
	// اول از همون کلیدهایی که در میدلور ست کردیم
	if id := c.GetInt64("user_id"); id > 0 {
		return id, true
	}
	if v, ok := c.Get("userId"); ok {
		switch t := v.(type) {
		case int64:
			if t > 0 {
				return t, true
			}
		case int:
			if t > 0 {
				return int64(t), true
			}
		case string:
			if n, err := strconv.ParseInt(t, 10, 64); err == nil && n > 0 {
				return n, true
			}
		}
	}
	// در نهایت از خود payload
	if p := GetAuthPayload(c); p != nil && p.UserID > 0 {
		return p.UserID, true
	}
	return 0, false
}
