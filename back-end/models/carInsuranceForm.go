package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CarInsuranceForm struct { // bảo hiểm xe ô tô
	ID                   primitive.ObjectID  `bson:"_id,omitempty" json:"car_form_id"`
	FormID               *primitive.ObjectID `bson:"form_id,omitempty" json:"form_id"`
	UserType             string              `bson:"user_type" json:"user_type"`
	IdentityNumber       string              `bson:"identity_number" json:"identity_number"`
	UsagePurpose         string              `bson:"usage_purpose" json:"usage_purpose"`
	VehicleType          string              `bson:"vehicle_type" json:"vehicle_type"`
	SeatCount            uint                `bson:"seat_count" json:"seat_count"`
	LoadCapacity         float64             `bson:"load_capacity" json:"load_capacity"`
	OwnerName            string              `bson:"owner_name" json:"owner_name"`
	RegistrationAddress  string              `bson:"registration_address" json:"registration_address"`
	LicensePlateStatus   string              `bson:"license_plate_status" json:"license_plate_status"`
	LicensePlate         string              `bson:"license_plate" json:"license_plate"`
	ChassisNumber        string              `bson:"chassis_number" json:"chassis_number"`
	EngineNumber         string              `bson:"engine_number" json:"engine_number"`
	InsuranceStart       time.Time           `bson:"insurance_start" json:"-"`
	InsuranceStartString string              `bson:"-" json:"insurance_start"`
	InsuranceDuration    uint                `bson:"insurance_duration" json:"insurance_duration"`
	InsuranceFee         float64             `bson:"insurance_fee" json:"insurance_fee"`
	InsuranceAmount      float64             `bson:"insurance_amount" json:"insurance_amount"`
	ParticipantCount     uint                `bson:"participant_count" json:"participant_count"`
	CreatedAt            time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt            time.Time           `bson:"updated_at" json:"updated_at"`
}

func (c *CarInsuranceForm) Validate() error {
	if c.UserType == "" {
		c.UserType = "Cá nhân"
	} else if c.UserType != "Cá nhân" && c.UserType != "Tổ chức" {
		return fmt.Errorf("user_type không hợp lệ! Phải là 'Cá nhân' hoặc 'Tổ chức'.")
	}
	if c.LicensePlateStatus == "" {
		c.LicensePlateStatus = "Chưa có"
	} else if c.LicensePlateStatus != "Mới" && c.LicensePlateStatus != "Cũ" && c.LicensePlateStatus != "Chưa có" {
		return fmt.Errorf("license_plate_status không hợp lệ! Phải là 'Mới', 'Cũ' hoặc 'Chưa có'.")
	}
	if c.InsuranceStartString != "" {
		parsedTime, err := time.Parse("2006-01-02", c.InsuranceStartString)
		if err != nil {
			return fmt.Errorf("Định dạng ngày bảo hiểm bắt đầu không hợp lệ! Expected YYYY-MM-DD.")
		}
		c.InsuranceStart = parsedTime
	}
	return nil
}
