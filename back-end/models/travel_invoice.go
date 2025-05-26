package models
import (
    "gorm.io/gorm"
)
type TravelInsuranceInvoice struct {
	gorm.Model
    InvoiceID        uint   `gorm:"primaryKey"`
    TravelFormID     uint   `gorm:"not null"`
    CustomerID       uint   `gorm:"not null"`
    Status           string `gorm:"type:enum('Chưa thanh toán','Đã thanh toán','Đã hủy');not null"`
    DepartureLocation string `gorm:"size:255;not null"`
    Destination      string `gorm:"size:255;not null"`
    DepartureDate    string `gorm:"type:date;not null"`
    ReturnDate       string `gorm:"type:date;not null"`
    TotalDuration    int    `gorm:"not null"`
    GroupSize        int    `gorm:"not null"`
    InsurancePackage string `gorm:"size:255;not null"`
    InsuranceProgram string `gorm:"size:255;not null"`
    ProductID        uint   `gorm:"not null"`
}