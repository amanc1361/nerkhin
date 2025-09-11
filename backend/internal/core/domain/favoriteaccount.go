package domain

import "time"

type FavoriteAccount struct {
	ID           int64 `json:"id"`
	UserID       int64 `json:"userId"`
	TargetUserID int64 `json:"targetUserId"`
}

type FavoriteAccountViewModel struct {
	FavoriteAccount
	ShopName       string    `json:"shopName"`
	ShopAddress    string    `json:"shopAddress"`
	ShopPhone1     string    `json:"shopPhone1"`
	ShopLikesCount int64     `json:"shopLikesCount"`
	ShopCreationAt time.Time `json:"shopCreationAt"`
	ShopImage      string    `json:"shopImage"`
}

type MyCustomersViewModel struct {
	FavoriteAccount
	CustomerName     string `json:"customerName"`
	CustomerShopType int16  `json:"customerShopType"`
}

func (FavoriteAccount) TableName() string {
	return "favorite_account"
}
