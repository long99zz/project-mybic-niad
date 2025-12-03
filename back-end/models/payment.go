package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PaymentTransaction model để lưu lịch sử giao dịch thanh toán
type PaymentTransaction struct {
	ID            primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	InvoiceID     *primitive.ObjectID `bson:"invoice_id,omitempty" json:"invoice_id"`
	TxnRef        string              `bson:"txn_ref" json:"txn_ref"`               // Mã giao dịch
	TransactionNo string              `bson:"transaction_no" json:"transaction_no"` // Mã giao dịch từ VNPay
	Amount        int64               `bson:"amount" json:"amount"`                 // Số tiền
	BankCode      string              `bson:"bank_code" json:"bank_code"`           // Mã ngân hàng
	Status        string              `bson:"status" json:"status"`                 // PENDING, 00 (success), failed
	ResponseCode  string              `bson:"response_code" json:"response_code"`   // Mã phản hồi từ VNPay
	CreatedAt     time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time           `bson:"updated_at" json:"updated_at"`
}
