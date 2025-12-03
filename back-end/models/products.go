package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID                primitive.ObjectID  `bson:"_id,omitempty" json:"product_id"`
	Name              string              `bson:"name" json:"name"`
	CategoryID        *primitive.ObjectID `bson:"category_id,omitempty" json:"category_id"`
	Image             string              `bson:"image" json:"image"`
	Quantity          int                 `bson:"quantity" json:"quantity"`
	Price             float64             `bson:"price" json:"price"`
	SalePrice         float64             `bson:"sale_price" json:"sale_price"`
	GeneralInfo       string              `bson:"general_info" json:"general_info"`             // Thông tin chung
	InsuranceBenefits string              `bson:"insurance_benefits" json:"insurance_benefits"` // Bảng quyền lợi bảo hiểm
	InsuranceFee      string              `bson:"insurance_fee" json:"insurance_fee"`           // Biểu phí bảo hiểm
	ClaimGuidelines   string              `bson:"claim_guidelines" json:"claim_guidelines"`     // Hướng dẫn bồi thường
	FormRules         string              `bson:"form_rules" json:"form_rules"`                 // Quy tắc biểu mẫu
	CreatedAt         time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time           `bson:"updated_at" json:"updated_at"`
	DeletedAt         *time.Time          `bson:"deleted_at,omitempty" json:"deleted_at,omitempty"`
}
