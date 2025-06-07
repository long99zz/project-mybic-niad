package models

import "time"

type Post struct {
    PostID     uint      `gorm:"primaryKey" json:"post_id"`
    CategoryID uint      `json:"category_id"`
    Title      string    `json:"title"`
    Image      string    `json:"image"`
    Author     string    `json:"author"`
    Content    string    `json:"content"`
    Views      uint      `json:"views"`
    Status     string    `json:"status"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}