package domain

type Landing struct {
	ProductCount    int64 `json:"productCount"`
	WholesalerCount int64 `json:"wholesalerCount"`
	RetailerCount   int64 `json:"retailerCount"`
}
