package models

import (
    "time"
)

type Category struct { // danh mục sản phẩm
    CategoryID uint   `gorm:"column:category_id;primaryKey" json:"category_id"`
    Name       string `gorm:"size:255"`
    Image      string
    Status     string
    Products   []Product `gorm:"foreignKey:CategoryID" swaggerignore:"true"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
    DeletedAt  *time.Time `gorm:"index" json:"deleted_at,omitempty" swaggerignore:"true"`
    QtyProduct int       `gorm:"-" json:"qty_product"`
}