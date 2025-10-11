package port

import (
	"context"
	"time"

	"github.com/nerkhin/internal/core/domain"
)


type TokenService interface {
	CreateAccessToken(user *domain.User, adminAccess *domain.AdminAccess) (tokenString string, payload *domain.TokenPayload, expiresAt time.Time, err error)
	CreateRefreshToken(user *domain.User) (tokenString string, payload *domain.RefreshTokenPayload, expiresAt time.Time, err error)
	VerifyAccessToken(tokenString string) (payload *domain.TokenPayload, err error)
	VerifyRefreshToken(tokenString string) (payload *domain.RefreshTokenPayload, err error)
	GetAccessTokenDuration() time.Duration
	GetRefreshTokenDuration() time.Duration
	CreateImpersonationToken(targetUser *domain.User, adminID int64) (string, *domain.TokenPayload, time.Time, error)
}

type VerificationCodeRepository interface {
	SaveVerificationCode(ctx context.Context, dbSession interface{},
		userId int64, code string) (err error)
	GetVerificationCode(ctx context.Context, dbSession interface{},
		userId int64) (code string, err error)
}

type VerificationCodeService interface {
	SendVerificationCode(ctx context.Context, phone string) (code string, err error)

	VerifyCode(ctx context.Context, phone, code string, deviceID string, userAgent string, ipAddress string) (user *domain.User, adminAccess *domain.AdminAccess, err error)
}

// AuthService - بدون تغییر باقی می‌ماند اگر Login فقط OTP ارسال می‌کند
type AuthService interface {
	Login(ctx context.Context, phone string) (userId int64, err error)
	GetUserByID(ctx context.Context, userID int64) (*domain.User, error) // <--- این متد جدید را اضافه کنید// یا هر چیزی که Login شما برمی‌گرداند
}
