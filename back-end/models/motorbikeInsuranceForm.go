package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MotorbikeInsuranceForm struct { // bảo hiểm xe máy
	ID                  primitive.ObjectID  `bson:"_id,omitempty" json:"motorbike_form_id"`
	FormID              *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`
	EngineCapacity      float64             `bson:"engine_capacity" json:"engine_capacity"`
	AccidentCoverage    float64             `bson:"accident_coverage" json:"accident_coverage"`
	InsuranceDuration   uint                `bson:"insurance_duration" json:"insurance_duration"`
	OwnerName           string              `bson:"owner_name" json:"owner_name"`
	RegistrationAddress string              `bson:"registration_address" json:"registration_address"`
	LicensePlateStatus  bool                `bson:"license_plate_status" json:"license_plate_status"`
	LicensePlate        string              `bson:"license_plate" json:"license_plate"`
	ChassisNumber       string              `bson:"chassis_number" json:"chassis_number"`
	EngineNumber        string              `bson:"engine_number" json:"engine_number"`
	InsuranceStart      time.Time           `bson:"insurance_start" json:"insurance_start"`
	InsuranceFee        float64             `bson:"insurance_fee" json:"insurance_fee"`
	CreatedAt           time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt           time.Time           `bson:"updated_at" json:"updated_at"`
}
