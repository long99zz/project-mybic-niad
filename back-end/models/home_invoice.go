package models
import (
    "gorm.io/gorm"
)
type HomeInsuranceInvoice struct {
	gorm.Model
    InvoiceID          uint   `gorm:"primaryKey"`
    FormID             uint   `gorm:"not null"`
    CustomerID         uint   `gorm:"not null"`
    CoverageScope      string `gorm:"size:255;not null"`
    HomeType           string `gorm:"size:255;not null"`
    HomeUsageStatus    string `gorm:"type:enum('Mới','Đã sử dụng');not null"`
    HomeInsuranceAmount float64 `gorm:"not null"`
    AssetInsuranceAmount float64 `gorm:"not null"`
    InsuredPersonName  string `gorm:"size:255;not null"`
    InsuredHomeAddress string `gorm:"size:255;not null"`
    InsuranceDuration  int    `gorm:"not null"`
    ProductID          uint   `gorm:"not null"`
}