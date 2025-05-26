package models

import ("gorm.io/gorm"
        "time")

type Category struct {
    CategoryID uint   `gorm:"column:category_id;primaryKey" json:"category_id"` // ✅ Xác định rõ cột
    Name       string `gorm:"size:255"`
    Image      string
    Status     string
    Products   []Product `gorm:"foreignKey:CategoryID"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
    DeletedAt  gorm.DeletedAt `gorm:"index"`
    QtyProduct int       `gorm:"-" json:"qty_product"`
}

