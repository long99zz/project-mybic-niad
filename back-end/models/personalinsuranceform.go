package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PersonalInsuranceForm struct { // bảo hiểm sức khỏe cá nhân
	ID                 primitive.ObjectID  `bson:"_id,omitempty" json:"personal_form_id"`
	FormID             *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`
	FullName           string              `bson:"full_name" json:"full_name"`
	CmndImg            string              `bson:"cmnd_img" json:"cmnd_img"`
	IdentityNumber     string              `bson:"identity_number" json:"identity_number"`
	BirthDate          time.Time           `bson:"birth_date" json:"birth_date"`
	Gender             string              `bson:"gender" json:"gender"`
	InsuranceProgram   string              `bson:"insurance_program" json:"insurance_program"`
	DentalExtension    bool                `bson:"dental_extension" json:"dental_extension"`
	MaternityExtension bool                `bson:"maternity_extension" json:"maternity_extension"`
	InsuranceStart     time.Time           `bson:"insurance_start" json:"insurance_start"`
	InsuranceDuration  uint                `bson:"insurance_duration" json:"insurance_duration"`
	InsuranceFee       float64             `bson:"insurance_fee" json:"insurance_fee"`
	CreatedAt          time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt          time.Time           `bson:"updated_at" json:"updated_at"`
}
