package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InsuranceForm struct { // Khai báo các trường trong bảng
	ID                primitive.ObjectID  `bson:"_id,omitempty" json:"form_id"`
	CustomerID        *primitive.ObjectID `bson:"customer_id,omitempty" json:"customer_id"`
	InsuranceType     string              `bson:"insurance_type" json:"insurance_type"`
	PolicyHolderName  string              `bson:"policy_holder_name" json:"policy_holder_name"`
	InsuranceStart    time.Time           `bson:"insurance_start" json:"insurance_start"`
	InsuranceDuration int                 `bson:"insurance_duration" json:"insurance_duration"`
	TotalPremium      float64             `bson:"total_premium" json:"total_premium"`
	CreatedAt         time.Time           `bson:"created_at" json:"created_at"`
}
