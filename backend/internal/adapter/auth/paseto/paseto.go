// فایل: internal/adapter/auth/paseto/paseto.go (یا مسیر مشابه در پروژه شما)
package paseto

import (
	"errors"
	"fmt"
	"time"

	// "os" // اگر کلید را مستقیماً از env می‌خوانید، اما بهتر است از طریق کانفیگ پاس داده شود

	"aidanwoods.dev/go-paseto"
	"github.com/google/uuid"
	"github.com/nerkhin/internal/adapter/config"  // مسیر صحیح به پکیج کانفیگ شما
	"github.com/nerkhin/internal/core/domain"     // مسیر صحیح به پکیج دامین شما
	"github.com/nerkhin/internal/core/domain/msg" // مسیر صحیح به پکیج پیام‌های شما
	"github.com/nerkhin/internal/core/port"       // مسیر صحیح به پکیج پورت شما
)

// ساختار PasetoToken:
// - دیگر نیازی به نگهداری یک نمونه *paseto.Token نیست.
// - key و parser به صورت مقدار (value) ذخیره می‌شوند، نه اشاره‌گر (pointer).
type PasetoToken struct {
	key                  paseto.V4SymmetricKey
	parser               paseto.Parser
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
}

// این خط در زمان کامپایل بررسی می‌کند که آیا *PasetoToken تمام متدهای اینترفیس port.TokenService را پیاده‌سازی کرده است یا خیر.
var _ port.TokenService = (*PasetoToken)(nil)

// RegisterTokenService: تابع سازنده و مقداردهی اولیه سرویس توکن
func RegisterTokenService(cfg config.TokenConfig) (port.TokenService, error) {
	// 1. Parse کردن مدت اعتبارها
	accessTokenDur, err := time.ParseDuration(cfg.Duration)
	if err != nil {
		return nil, fmt.Errorf("%s (for access token): %w", msg.ErrTokenDuration, err)
	}

	refreshTokenDur, err := time.ParseDuration(cfg.RefreshTokenDuration)
	if err != nil {
		return nil, fmt.Errorf("%s (for refresh token): %w", msg.ErrTokenDuration, err)
	}

	// 2. بررسی و ایجاد کلید متقارن Paseto
	if cfg.SymmetricKeyHex == "" {
		// در محیط پروداکشن، این باید یک خطای fatal باشد.
		return nil, errors.New("Paseto symmetric key (SymmetricKeyHex) is not provided in config")
	}
	if len(cfg.SymmetricKeyHex) != 64 {
		return nil, fmt.Errorf("invalid Paseto key length: must be 64 hex characters, got %d", len(cfg.SymmetricKeyHex))
	}

	key, keyErr := paseto.V4SymmetricKeyFromHex(cfg.SymmetricKeyHex)
	if keyErr != nil {
		return nil, fmt.Errorf("failed to create Paseto symmetric key from hex: %w", keyErr)
	}

	// 3. ایجاد یک parser برای استفاده‌های بعدی
	parser := paseto.NewParser()
	// می‌توانید rule های بیشتری به parser اضافه کنید، مثلاً:
	// parser.AddRule(paseto.ForAudience("your-app-audience"))

	// 4. برگرداندن یک نمونه از PasetoToken با مقادیر صحیح
	return &PasetoToken{
		key:                  key,
		parser:               parser,
		accessTokenDuration:  accessTokenDur,
		refreshTokenDuration: refreshTokenDur,
	}, nil
}

// داخل همين فایل paseto.go اضافه كنيد: -------------------------------

func (pt *PasetoToken) safeParse(tokenString string) (*paseto.Token, error) {
	var parsed *paseto.Token
	var err error

	// هر panic داخلی Paseto را به error تبدیل می‌کنیم
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("%s (panic while parsing token): %v", msg.ErrInvalidToken, r)
		}
	}()

	parsed, err = pt.parser.ParseV4Local(pt.key, tokenString, nil)
	return parsed, err
}

// --- پیاده‌سازی متدهای اینترفیس port.TokenService ---

func (pt *PasetoToken) CreateAccessToken(user *domain.User, adminAccess *domain.AdminAccess) (string, *domain.TokenPayload, time.Time, error) {
	jti, err := uuid.NewRandom()
	if err != nil {
		return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	}

	payload := &domain.TokenPayload{
		JTI:         jti,
		UserID:      user.ID,
		UserRole:    user.Role,
		UserState:   user.State,
		CityID:      user.CityID,
		AdminAccess: adminAccess,
		Type:        "access",
	}

	token := paseto.NewToken()
	if err := token.Set("payload", payload); err != nil {
		return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	}

	issuedAt := time.Now().UTC()
	expiredAt := issuedAt.Add(pt.accessTokenDuration)

	token.SetIssuedAt(issuedAt)
	token.SetNotBefore(issuedAt)
	token.SetExpiration(expiredAt)

	encryptedToken := token.V4Encrypt(pt.key, nil)
	return encryptedToken, payload, expiredAt, nil
}

func (pt *PasetoToken) VerifyAccessToken(tokenString string) (*domain.TokenPayload, error) {

	var tokenPayload domain.TokenPayload
	parsedToken, err := pt.safeParse(tokenString)
	if err != nil {
		return nil, err // توکن نامعتبر است
	}
	if parsedToken == nil { // در صورت panic، این nil می‌شود
		return nil, errors.New(msg.ErrInvalidToken)
	}

	if err := parsedToken.Get("payload", &tokenPayload); err != nil {
		return nil, fmt.Errorf("%s: failed to get 'payload' claim from access token: %w", msg.ErrInvalidToken, err)
	}

	if tokenPayload.Type != "access" {
		return nil, fmt.Errorf("%s: token type is not 'access'", msg.ErrInvalidToken)
	}

	return &tokenPayload, nil
}

func (pt *PasetoToken) CreateRefreshToken(user *domain.User) (string, *domain.RefreshTokenPayload, time.Time, error) {
	jti, err := uuid.NewRandom()
	if err != nil {
		return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	}
	payload := &domain.RefreshTokenPayload{
		JTI:      jti,
		UserID:   user.ID,
		UserRole: user.Role,
		Type:     "refresh",
	}
	token := paseto.NewToken()
	if err := token.Set("payload", payload); err != nil {
		return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
	}

	issuedAt := time.Now().UTC()
	expiredAt := issuedAt.Add(pt.refreshTokenDuration)

	token.SetIssuedAt(issuedAt)
	token.SetNotBefore(issuedAt)
	token.SetExpiration(expiredAt)

	encryptedToken := token.V4Encrypt(pt.key, nil)
	return encryptedToken, payload, expiredAt, nil
}

func (pt *PasetoToken) VerifyRefreshToken(tokenString string) (*domain.RefreshTokenPayload, error) {
	var tokenPayload domain.RefreshTokenPayload

	parsedToken, err := pt.parser.ParseV4Local(pt.key, tokenString, nil)
	if err != nil {

		return nil, fmt.Errorf("%s (refresh token): %w", msg.ErrInvalidToken, err)
	}

	if err := parsedToken.Get("payload", &tokenPayload); err != nil {
		return nil, fmt.Errorf("%s: failed to get 'payload' claim from refresh token: %w", msg.ErrInvalidToken, err)
	}

	if tokenPayload.Type != "refresh" {
		return nil, fmt.Errorf("%s: token type is not 'refresh'", msg.ErrInvalidToken)
	}
	return &tokenPayload, nil
}


func (pt *PasetoToken) CreateImpersonationToken(targetUser *domain.User, adminID int64) (string, *domain.TokenPayload, time.Time, error) {
    jti, err := uuid.NewRandom()
    if err != nil {
        return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
    }

    payload := &domain.TokenPayload{
        JTI:                 jti,
        UserID:              targetUser.ID,
        UserRole:            targetUser.Role,
        UserState:           targetUser.State,
        CityID:              targetUser.CityID,
        AdminAccess:         nil, // Admin access does not apply to the impersonated user
        Type:                "access",
        ImpersonatorAdminID: &adminID, // <-- شناسه ادمین را اینجا ذخیره می‌کنیم
    }

    token := paseto.NewToken()
    if err := token.Set("payload", payload); err != nil {
        return "", nil, time.Time{}, fmt.Errorf("%s: %w", msg.ErrTokenCreation, err)
    }

    issuedAt := time.Now().UTC()
    // توکن تقلیدی بهتر است زمان انقضای کوتاه‌تری داشته باشد
    expiredAt := issuedAt.Add(pt.accessTokenDuration / 2) // مثلا نصف زمان عادی

    token.SetIssuedAt(issuedAt)
    token.SetNotBefore(issuedAt)
    token.SetExpiration(expiredAt)

    encryptedToken := token.V4Encrypt(pt.key, nil)
    return encryptedToken, payload, expiredAt, nil
}

func (pt *PasetoToken) GetAccessTokenDuration() time.Duration {
	return pt.accessTokenDuration
}

func (pt *PasetoToken) GetRefreshTokenDuration() time.Duration {
	return pt.refreshTokenDuration
}
