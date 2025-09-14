package domain

import (
	"time"

	"github.com/shopspring/decimal"
)

type UserFilter struct {
	Role       UserRole
	State      UserState
	SearchText string
	CityID     int64
}

type UserViewModel struct {
	User
	IsActive             bool   `json:"isActive"`
	CityName             string `json:"cityName"`
	SubscriptionDaysLeft int32  `json:"subscriptionDaysLeft"`
}

type User struct {
	ID            int64               `json:"id"`
	Phone         string              `json:"phone"`
	CityID        int64               `json:"cityId"`
	Role          UserRole            `json:"role"`
	State         UserState           `gorm:"column:state_c" json:"state"`
	FullName      string              `json:"fullName"`
	ShopName      string              `json:"shopName"`
	ShopAddress   string              `json:"shopAddress"`
	ShopPhone1    string              `json:"shopPhone1"`
	ShopPhone2    string              `json:"shopPhone2"`
	ShopPhone3    string              `json:"shopPhone3"`
	InstagramUrl  string              `json:"instagramUrl"`
	TelegramUrl   string              `json:"telegramUrl"`
	WhatsappUrl   string              `json:"whatsappUrl"`
	WebsiteUrl    string              `json:"websiteUrl"`
	ImageUrl      string              `json:"imageUrl"`
	DollarPrice   decimal.NullDecimal `json:"dollarPrice"`
	LikesCount    int32               `json:"likesCount"`
	ProductsCount int32               `json:"productsCount"`
	Latitude      decimal.NullDecimal `json:"latitude"`
	Longitude     decimal.NullDecimal `json:"longitude"`
	DeviceLimit   int                 `gorm:"default:1" json:"deviceLimit"`
	IsLiked       bool                `gorm:"-" json:"isLiked"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
type ActiveDevice struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	UserID      int64     `json:"userId"`
	DeviceID    string    `json:"deviceId"`
	UserAgent   string    `json:"userAgent"`
	IPAddress   string    `json:"ipAddress"`
	LastLoginAt time.Time `json:"lastLoginAt"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (ActiveDevice) TableName() string {
	return "active_devices"
}

type AdminAccess struct {
	ID                 int64 `json:"id"`
	UserID             int64 `json:"userId"`
	SaveProduct        bool  `json:"saveProduct"`
	ChangeUserState    bool  `json:"changeUserState"`
	ChangeShopState    bool  `json:"changeShopState"`
	ChangeAccountState bool  `json:"changeAccountState"`
}

func (AdminAccess) TableName() string {
	return "admin_access"
}

type UserRole int16

type UserState int16

const (
	roleStart UserRole = iota
	SuperAdmin
	Admin
	Wholesaler
	Retailer
	roleEnd
)

const (
	stateStart UserState = iota
	NewUser
	RejectedUser
	InactiveAccount
	InactiveShop
	ApprovedUser
	stateEnd
)

func IsUserRoleValid(userRole UserRole) bool {
	return userRole > roleStart && userRole < roleEnd
}

func IsUserStateValid(userState UserState) bool {
	return userState > stateStart && userState < stateEnd
}

func (User) TableName() string {
	return "user_t"
}

type VerificationCode struct {
	ID     int64
	UserID int64
	Code   string
}

func (VerificationCode) TableName() string {
	return "verification_code"
}
