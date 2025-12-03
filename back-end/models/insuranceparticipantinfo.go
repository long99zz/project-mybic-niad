package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InsuranceParticipantInfo struct { // Thông tin người tham gia bảo hiểm
	ID                      primitive.ObjectID  `bson:"_id,omitempty" json:"participant_id"`
	FormID                  *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`
	CustomerID              *primitive.ObjectID `bson:"customer_id,omitempty" json:"customer_id"`
	CmndImg                 string              `bson:"cmnd_img" json:"cmnd_img"`
	FullName                string              `bson:"full_name" json:"full_name"`
	BirthDate               time.Time           `bson:"birth_date" json:"birth_date"`
	Gender                  string              `bson:"gender" json:"gender"`
	IdentityNumber          string              `bson:"identity_number" json:"identity_number"`
	MainBenefit             string              `bson:"main_benefit" json:"main_benefit"`
	StrokeAdditionalBenefit bool                `bson:"stroke_additional_benefit" json:"stroke_additional_benefit"`
	HasCancer               bool                `bson:"has_cancer" json:"has_cancer"`
	HadStroke               bool                `bson:"had_stroke" json:"had_stroke"`
	StageFourDisease        bool                `bson:"stage_four_disease" json:"stage_four_disease"`
	InsuranceDuration       uint                `bson:"insurance_duration" json:"insurance_duration"`
	PremiumFee              float64             `bson:"premium_fee" json:"premium_fee"`
	CreatedAt               time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt               time.Time           `bson:"updated_at" json:"updated_at"`
}
