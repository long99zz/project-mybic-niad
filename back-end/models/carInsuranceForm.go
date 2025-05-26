package models

import (
        "time"
        "fmt"
    )
type CarInsuranceForm struct {
    CarFormID           uint      `gorm:"primaryKey;autoIncrement" json:"car_form_id"`
    FormID              *uint     `gorm:"index" json:"form_id"`
    UserType            string    `gorm:"type:enum('Cá nhân','Tổ chức');not null" json:"user_type"`
    IdentityNumber      string    `gorm:"size:20;not null" json:"identity_number"`
    UsagePurpose        string    `gorm:"size:255;not null" json:"usage_purpose"`
    VehicleType         string    `gorm:"size:255;not null" json:"vehicle_type"`
    SeatCount           uint      `gorm:"not null" json:"seat_count"`
    LoadCapacity        float64   `gorm:"not null" json:"load_capacity"`
    OwnerName           string    `gorm:"size:255;not null" json:"owner_name"`
    RegistrationAddress string    `gorm:"size:255;not null" json:"registration_address"`
    LicensePlateStatus  string    `gorm:"type:enum('Mới','Cũ','Chưa có');not null" json:"license_plate_status"`
    LicensePlate        string    `gorm:"size:20;not null" json:"license_plate"`
    ChassisNumber       string    `gorm:"size:50;not null" json:"chassis_number"`
    EngineNumber        string    `gorm:"size:50;not null" json:"engine_number"`
    InsuranceStart      time.Time `gorm:"type:date;not null" json:"insurance_start"`
    InsuranceDuration   uint      `gorm:"not null" json:"insurance_duration"`
    InsuranceFee        float64   `gorm:"not null" json:"insurance_fee"`
    InsuranceAmount     float64   `gorm:"not null" json:"insurance_amount"`
    ParticipantCount    uint      `gorm:"not null" json:"participant_count"`
    CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt           time.Time `gorm:"autoUpdateTime" json:"updated_at"`
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
    return nil
}