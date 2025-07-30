package domain

type ProductRequest struct {
	ID          int64        `json:"id"`
	UserID      int64        `json:"userId"`
	Description string       `json:"description"`
	State       RequestState `gorm:"column:state_c" json:"state"`
}

type RequestState int16

const (
	NewRequest RequestState = iota + 1
	Checked
)

type ProductRequestViewModel struct {
	ProductRequest
	UserName    string `json:"userName"`
	PhoneNumber string `json:"phoneNumber"`
	UserType    int16  `json:"userType"`
	City        string `json:"city"`
}

func (ProductRequest) TableName() string {
	return "product_request"
}
