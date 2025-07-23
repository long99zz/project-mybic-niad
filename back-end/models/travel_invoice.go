package models

import (
    "time"
)

type TravelInsuranceInvoice struct {
    InvoiceID         uint      `gorm:"primaryKey;autoIncrement" json:"invoice_id"`
    UserID            *uint     `gorm:"index" json:"user_id"`     
    FormID            *uint     `gorm:"index" json:"form_id"` // Cho phép NULL
    Status            string    `gorm:"type:enum('Chưa thanh toán','Đã thanh toán','Đã hủy');not null" json:"status"`
    DepartureLocation string    `gorm:"size:255;not null" json:"departure_location"`
    Destination       string    `gorm:"size:255;not null" json:"destination"`
    DepartureDate     time.Time `gorm:"type:date;not null" json:"departure_date"`
    ReturnDate        time.Time `gorm:"type:date;not null" json:"return_date"`
    TotalDuration     int       `gorm:"-" json:"total_duration"` // vẫn để gorm:"-" nếu là GENERATED
    GroupSize         int       `gorm:"not null" json:"group_size"`
    InsuranceProgram  string    `gorm:"size:255;not null" json:"insurance_program"`
    TotalAmount       float64   `gorm:"not null" json:"total_amount"` // Đã cho phép nhập số
    InsurancePackage  string    `gorm:"size:255" json:"insurance_package"`
    Note              string    `gorm:"size:255" json:"note"` // Trường mới, ví dụ ghi chú
    CustomerID        *uint     `gorm:"index" json:"customer_id"` // cho phép NULL
    ProductID         *uint     `gorm:"index"  json:"product_id"`
    CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}