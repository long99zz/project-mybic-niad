package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// InvoiceMaster: Bảng tổng hợp tất cả các invoice (nguồn chân lý cho invoice_id)
type InvoiceMaster struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"master_invoice_id"`
	InvoiceType string              `bson:"invoice_type" json:"invoice_type"`
	UserID      *primitive.ObjectID `bson:"user_id,omitempty" json:"user_id"` // NULL nếu không đăng nhập
	ProductID   *primitive.ObjectID `bson:"product_id,omitempty" json:"product_id"`
	Status      string              `bson:"status" json:"status"`
	TotalAmount float64             `bson:"total_amount" json:"total_amount"`
	CreatedAt   time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at" json:"updated_at"`
}
