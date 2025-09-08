package domain

import (
	"time"

	"github.com/shopspring/decimal"
)

type UserSubscriptionViewModel struct {
	UserSubscription
	Price        decimal.Decimal    `json:"price"`
	NumberOfDays SubscriptionPeriod `json:"numberOfDays"`
}

type UserSubscription struct {
	ID             int64     `json:"id"`
	UserID         int64     `json:"userId"`
	CityID         int64     `json:"cityId"`
	SubscriptionID int64     `json:"subscriptionId"`
	ExpiresAt      time.Time `json:"expiresAt"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type PaymentConfig struct {
	CurrentUserID  int64
	CityID         int64
	SubscriptionID int64
	CallBackUrl    string
}

type PaymentGatewayInfo struct {
	PaymentUrl string `json:"paymentUrl"`
	Authority  string `json:"authority"`
}
type UserSubscriptionWithCity struct {
	ID             int64     `json:"id"`
	UserID         int64     `json:"userId"`
	CityID         int64     `json:"cityId"`
	City           string    `json:"city"` // نام شهر
	SubscriptionID int64     `json:"subscriptionId"`
	ExpiresAt      time.Time `json:"expiresAt"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
type PaymentTransactionHistory struct {
	ID           int64              `json:"id"`
	UserID       int64              `json:"userId"`
	CityID       int64              `json:"cityId"`
	RefID        string             `json:"refId"`
	Authority    string             `json:"authority"`
	Cost         decimal.Decimal    `gorm:"column:cost_c" json:"cost"`
	NumberOfDays SubscriptionPeriod `json:"numberOfDays"`
	CreatedAt    time.Time          `json:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt"`
}

type PaymentTransactionHistoryViewModel struct {
	PaymentTransactionHistory
	FullName       string    `json:"fullName"`
	City           string    `json:"city"`
	ExpirationDate time.Time `json:"expirationDate"`
}

type TempAuthority struct {
	ID             int64     `json:"id"`
	Authority      string    `json:"authority"`
	UserID         int64     `json:"userId"`
	CityID         int64     `json:"cityId"`
	SubscriptionID int64     `json:"subscriptionId"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

func (UserSubscription) TableName() string {
	return "user_subscription"
}

func (PaymentTransactionHistory) TableName() string {
	return "user_payment_transaction_history"
}

func (TempAuthority) TableName() string {
	return "temp_authority"
}
