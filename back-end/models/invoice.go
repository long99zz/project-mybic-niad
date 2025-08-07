package models

import (
	"fmt"
	"time"
)

type Invoice struct { // hóa đơn
	InvoiceID            uint      `gorm:"primaryKey;autoIncrement;column:invoice_id"`
	CustomerID           *uint     `gorm:"index" json:"customer_id"` // Cho phép NULL
	ProductID            uint      `gorm:"not null;index" json:"product_id"`
	UserID               *uint     `gorm:"index" json:"user_id"` // Cho phép NULL nếu không đăng nhập
	FormID               *uint     `gorm:"index" json:"form_id"` // Có thể NULL
	InsurancePackage     string    `gorm:"size:255" json:"insurance_package"`
	InsuranceStart       time.Time `gorm:"type:date;not null"`       // Không bind trực tiếp JSON
	InsuranceStartString string    `json:"insurance_start" gorm:"-"` // Trường tạm để nhận chuỗi ngày
	InsuranceEnd         time.Time `gorm:"type:date;not null"`       // Không bind trực tiếp JSON
	InsuranceEndString   string    `json:"insurance_end" gorm:"-"`   // Trường tạm để nhận chuỗi ngày
	InsuranceAmount      float64   `gorm:"type:decimal(15,2);not null" json:"insurance_amount"`
	InsuranceQuantity    uint      `gorm:"default:1" json:"insurance_quantity"`
	ContractType         string    `gorm:"type:enum('Mới','Tái tục');default:'Mới'" json:"contract_type"`
	Status               string    `gorm:"type:enum('Đã thanh toán','Chưa thanh toán','Đã hủy');default:'Chưa thanh toán'" json:"status"`
	CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (i *Invoice) Validate() error {
	if i.ContractType == "" {
		i.ContractType = "Mới"
	} else if i.ContractType != "Mới" && i.ContractType != "Tái tục" {
		return fmt.Errorf("contract_type không hợp lệ! Phải là 'Mới' hoặc 'Tái tục'.")
	}
	// Parse InsuranceStartString và InsuranceEndString sang time.Time
	if i.InsuranceStartString != "" {
		parsedStartTime, err := time.Parse("2006-01-02", i.InsuranceStartString)
		if err != nil {
			return fmt.Errorf("Định dạng ngày bảo hiểm bắt đầu không hợp lệ! Expected YYYY-MM-DD.")
		}
		i.InsuranceStart = parsedStartTime
	}

	if i.InsuranceEndString != "" {
		parsedEndTime, err := time.Parse("2006-01-02", i.InsuranceEndString)
		if err != nil {
			return fmt.Errorf("Định dạng ngày bảo hiểm kết thúc không hợp lệ! Expected YYYY-MM-DD.")
		}
		i.InsuranceEnd = parsedEndTime
	}
	return nil
}

func (Invoice) TableName() string {
	return "invoices"
}
