package domain

import (
	"time"

	"github.com/shopspring/decimal"
)

type Subscription struct {
	ID           int64              `json:"id"`
	Price        decimal.Decimal    `json:"price"`
	NumberOfDays SubscriptionPeriod `json:"numberOfDays"`
	CreatedAt    time.Time          `json:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt"`
}

type SubscriptionPeriod int16

const (
	periodStart SubscriptionPeriod = iota
	OneMonth
	ThreeMonths
	SixMonths
	OneYear
	periodEnd
)

func IsPeriodValid(period int16) bool {
	return period > int16(periodStart) && period < int16(periodEnd)
}

func (Subscription) TableName() string {
	return "subscription"
}
