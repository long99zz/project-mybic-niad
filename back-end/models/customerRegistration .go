package models

import ("time"
    "fmt"
)

type CustomerRegistration struct {
    CustomerID      uint      `gorm:"primaryKey;column:customer_id" json:"customer_id"`
    CustomerType    string    `gorm:"type:enum('Cá nhân','Tổ chức');not null" json:"customer_type"`
    IdentityNumber  string    `gorm:"size:20;unique;not null" json:"identity_number"`
    FullName        string    `gorm:"size:255;not null" json:"full_name"`
    Address         string    `gorm:"size:255" json:"address"`
    Email           string    `gorm:"size:255" json:"email"`
    PhoneNumber     string    `gorm:"size:15" json:"phone_number"`
    InvoiceRequest  bool      `gorm:"default:false" json:"invoice_request"`
    Notes           string    `json:"notes"`
    CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
func (c *CustomerRegistration) Validate() error {
    if c.CustomerType == "" {
        c.CustomerType = "Cá nhân"
    } else if c.CustomerType != "Cá nhân" && c.CustomerType != "Doanh nghiệp" {
        return fmt.Errorf("customer_type không hợp lệ! Phải là 'Cá nhân' hoặc 'Doanh nghiệp'.")
    }
    return nil
}