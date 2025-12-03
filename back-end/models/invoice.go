package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Invoice struct { // hóa đơn
	ID                   primitive.ObjectID  `bson:"_id,omitempty" json:"InvoiceID"`
	MasterInvoiceID      *primitive.ObjectID `bson:"master_invoice_id,omitempty" json:"master_invoice_id"` // FK → invoices_master
	CustomerID           *primitive.ObjectID `bson:"customer_id,omitempty" json:"CustomerID"`              // Cho phép NULL
	ProductID            primitive.ObjectID  `bson:"product_id" json:"ProductID"`
	UserID               *primitive.ObjectID `bson:"user_id,omitempty" json:"UserID"` // Cho phép NULL nếu không đăng nhập
	FormID               *primitive.ObjectID `bson:"form_id,omitempty" json:"FormID"` // Có thể NULL
	InsurancePackage     string              `bson:"insurance_package" json:"InsurancePackage"`
	InsuranceStart       time.Time           `bson:"insurance_start" json:"-"` // Không bind trực tiếp từ JSON
	InsuranceStartString string              `bson:"-" json:"InsuranceStart"`  // Trường tạm để nhận chuỗi ngày từ frontend
	InsuranceEnd         time.Time           `bson:"insurance_end" json:"-"`   // Không bind trực tiếp từ JSON
	InsuranceEndString   string              `bson:"-" json:"InsuranceEnd"`    // Trường tạm để nhận chuỗi ngày từ frontend
	InsuranceAmount      float64             `bson:"insurance_amount" json:"InsuranceAmount"`
	InsuranceQuantity    uint                `bson:"insurance_quantity" json:"InsuranceQuantity"`
	ContractType         string              `bson:"contract_type" json:"ContractType"`
	Status               string              `bson:"status" json:"Status"`
	CreatedAt            time.Time           `bson:"created_at" json:"CreatedAt"`
	UpdatedAt            time.Time           `bson:"updated_at" json:"UpdatedAt"`
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
