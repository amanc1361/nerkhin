package domain

import (
	"time"

	"github.com/google/uuid"
)

type TokenPayload struct {
	JTI         uuid.UUID `json:"jti"`
	ID          uuid.UUID
	UserID      int64
	UserRole    UserRole
	UserState   UserState
	CityID      int64
	AdminAccess *AdminAccess
	Type        string `json:"type"`
	Expiration  time.Time
}
type RefreshTokenPayload struct {
	JTI      uuid.UUID `json:"jti"`
	UserID   int64     `json:"user_id"`
	UserRole UserRole  `json:"user_role"`
	Type     string    `json:"type"`
}
