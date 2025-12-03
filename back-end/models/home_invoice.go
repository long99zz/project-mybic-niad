package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// HomeInsuranceInvoice: Hóa đơn bảo hiểm nhà
type HomeInsuranceInvoice struct {
	ID                   primitive.ObjectID  `bson:"_id,omitempty" json:"invoice_id"`
	MasterInvoiceID      *primitive.ObjectID `bson:"master_invoice_id,omitempty" json:"master_invoice_id"` // FK → invoices_master
	UserID               *primitive.ObjectID `bson:"user_id,omitempty" json:"user_id"`                     // Cho phép NULL nếu không đăng nhập
	FormID               *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`                     // Liên kết với bảng insurance_forms
	CustomerID           *primitive.ObjectID `bson:"customer_id,omitempty" json:"customer_id"`             // Liên kết với bảng customers
	CoverageScope        string              `bson:"coverage_scope" json:"coverage_scope"`
	HomeType             string              `bson:"home_type" json:"home_type"`
	HomeUsageStatus      string              `bson:"home_usage_status" json:"home_usage_status"`
	HomeInsuranceAmount  float64             `bson:"home_insurance_amount" json:"home_insurance_amount"`
	AssetInsuranceAmount float64             `bson:"asset_insurance_amount" json:"asset_insurance_amount"`
	InsuredPersonName    string              `bson:"insured_person_name" json:"insured_person_name"`
	InsuredHomeAddress   string              `bson:"insured_home_address" json:"insured_home_address"`
	InsuranceDuration    int                 `bson:"insurance_duration" json:"insurance_duration"`
	InsuranceStart       time.Time           `bson:"insurance_start" json:"insurance_start"`
	InsuranceEnd         time.Time           `bson:"insurance_end" json:"insurance_end"`
	TotalAmount          float64             `bson:"total_amount" json:"total_amount"`
	Status               string              `bson:"status" json:"status"`
	ProductID            primitive.ObjectID  `bson:"product_id" json:"product_id"`
	CreatedAt            time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt            time.Time           `bson:"updated_at" json:"updated_at"`
}
