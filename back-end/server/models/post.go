package models

import (
    "time"
)

type Post struct {
    PostID     uint      `gorm:"primaryKey;column:post_id" json:"post_id"`
    CategoryID uint      `gorm:"column:category_id;not null" json:"category_id"`
    Title      string    `gorm:"size:255;not null;column:title" json:"title"`
    Image      string    `gorm:"size:500;column:image" json:"image"`
    Author     string    `gorm:"size:100;not null;column:author" json:"author"`
    Content    string    `gorm:"type:LONGTEXT;column:content" json:"content"`
    Views      uint      `gorm:"default:0;column:views" json:"views"`
    Status     string    `gorm:"type:ENUM('draft', 'published', 'archived');default:'draft';column:status" json:"status"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}