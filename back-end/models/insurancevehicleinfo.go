package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InsuranceVehicleInfo struct { // Thông tin bảo hiểm vật chất xe ô tô
	ID                         primitive.ObjectID  `bson:"_id,omitempty" json:"form_insurance_id"`
	Purpose                    string              `bson:"purpose" json:"purpose"`
	VehicleType                string              `bson:"vehicle_type" json:"vehicle_type"`
	Brand                      string              `bson:"brand" json:"brand"`
	Model                      string              `bson:"model" json:"model"`
	ManufactureYear            *int                `bson:"manufacture_year,omitempty" json:"manufacture_year"`
	SeatCount                  *int                `bson:"seat_count,omitempty" json:"seat_count"`
	VehicleValue               *float64            `bson:"vehicle_value,omitempty" json:"vehicle_value"`
	InsuranceAmount            *float64            `bson:"insurance_amount,omitempty" json:"insurance_amount"`
	RegistrationDate           *time.Time          `bson:"registration_date,omitempty" json:"registration_date"`
	Deductible                 *float64            `bson:"deductible,omitempty" json:"deductible"`
	CoverageArea               string              `bson:"coverage_area" json:"coverage_area"`
	ParticipantCount           *int                `bson:"participant_count,omitempty" json:"participant_count"`
	ParticipantInsuranceAmount *float64            `bson:"participant_insurance_amount,omitempty" json:"participant_insurance_amount"`
	FormID                     *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`
	CreatedAt                  time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt                  time.Time           `bson:"updated_at" json:"updated_at"`
}
