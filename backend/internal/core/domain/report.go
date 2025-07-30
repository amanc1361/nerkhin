package domain

import "time"

type ReportFilter struct {
	State      ReportState
	SearchText string
	totalCount int64
}

type ReportViewModel struct {
	Report
	UserFullName       string   `json:"userFullName"`
	UserShopName       string   `json:"userShopName"`
	UserPhone          string   `json:"userPhone"`
	UserRole           UserRole `json:"userRole"`
	UserCity           string   `json:"userCity"`
	TargetUserFullName string   `json:"targetUserFullName"`
	TargetUserShopName string   `json:"targetUserShopName"`
	TargetUserPhone    string   `json:"targetUserPhone"`
	TargetUserRole     UserRole `json:"targetUserRole"`
	TargetUserCity     string   `json:"targetUserCity"`
}

type Report struct {
	ID           int64       `json:"id"`
	UserID       int64       `json:"userId"`
	TargetUserID int64       `json:"targetUserId"`
	Title        string      `json:"title"`
	Description  string      `json:"description"`
	State        ReportState `gorm:"column:state_c" json:"state"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
}

type ReportState int16

const (
	reportStateStart ReportState = iota
	ReportStateNew
	ReportStateChecked
	reportStateEnd
)

func IsReportStateValid(state int16) bool {
	return state > int16(reportStateStart) && state < int16(reportStateEnd)
}

func (Report) TableName() string {
	return "report"
}
