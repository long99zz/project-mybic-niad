package models

import ("gorm.io/gorm"
        "time")

type Product struct {

    ProductID uint `gorm:"primaryKey" json:"product_id"`
    Name                string `gorm:"size:255;not null" json:"name"`
    CategoryID          uint   `gorm:"index" json:"category_id"`
    Image               string `gorm:"size:255" json:"image"`
    Quantity            int    `gorm:"default:0" json:"quantity"`
    Price               float64 `gorm:"not null" json:"price"`
    SalePrice           float64 `gorm:"default:0" json:"sale_price"`
    GeneralInfo         string  `gorm:"type:text"`   // Thông tin chung
    InsuranceBenefits   string  `gorm:"type:text"`  // Bảng quyền lợi bảo hiểm
    InsuranceFee        string `gorm:"type:text"`   // Biểu phí bảo hiểm
    ClaimGuidelines     string  `gorm:"size:255"` // Hướng dẫn bồi thường
    FormRules           string  `gorm:"type:text"`  // Quy tắc biểu mẫu
    CreatedAt   time.Time       `json:"created_at"`
    UpdatedAt   time.Time       `json:"updated_at"`
    DeletedAt   gorm.DeletedAt  `gorm:"index" json:"deleted_at"`

}