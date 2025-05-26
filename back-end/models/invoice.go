package models

import ("time"
    "fmt")
type Invoice struct {
    InvoiceID       uint `gorm:"primaryKey;autoIncrement;column:invoice_id"`
    CustomerID       uint    `gorm:"not null;index"`
    ProductID        uint    `gorm:"not null;index"`
    UserID           uint    `gorm:"not null;index"`
    FormID           *uint   `gorm:"index"` // Có thể NULL
    InsurancePackage string  `gorm:"size:255"`
    InsuranceStart   time.Time `gorm:"type:date;not null"`
    InsuranceEnd     time.Time `gorm:"type:date;not null"`
    InsuranceAmount  float64 `gorm:"type:decimal(15,2);not null"`
    InsuranceQuantity uint   `gorm:"default:1"`
    ContractType     string  `gorm:"type:enum('Mới','Tái tục')"`
    Status          string   `gorm:"type:enum('Đã thanh toán','Chưa thanh toán', 'Đã hủy')"`
    CreatedAt     time.Time `gorm:"autoCreateTime"`
    UpdatedAt     time.Time `gorm:"autoUpdateTime"`
}
func (i *Invoice) Validate() error {
    if i.ContractType == "" {
        i.ContractType = "Mới"
    } else if i.ContractType != "Mới" && i.ContractType != "Tái tục" {
        return fmt.Errorf("contract_type không hợp lệ! Phải là 'Mới' hoặc 'Tái tục'.")
    }
    return nil
}