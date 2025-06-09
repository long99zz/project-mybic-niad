package models

import (
    "time"
)

type MotorbikeInsuranceForm struct {
    MotorbikeFormID      uint       `gorm:"primaryKey;autoIncrement" json:"motorbike_form_id"`
    FormID               *uint      `gorm:"index" json:"form_id"`
    EngineCapacity       *float64   `gorm:"null" json:"engine_capacity"` // Cho phép null
    EngineCapacityType   string     `gorm:"size:20;not null" json:"engine_capacity_type"` // "duoi_50cc" hoặc "tren_50cc"
    AccidentCoverage     float64    `gorm:"not null" json:"accident_coverage"`
    InsuranceDuration    uint       `gorm:"not null" json:"insurance_duration"`
    OwnerName            string     `gorm:"size:255;not null" json:"owner_name"`
    RegistrationAddress  string     `gorm:"size:255;not null" json:"registration_address"`
    LicensePlateStatus   bool       `gorm:"default:false" json:"license_plate_status"`
    LicensePlate         string     `gorm:"size:20;not null" json:"license_plate"`
    ChassisNumber        string     `gorm:"size:50;not null" json:"chassis_number"`
    EngineNumber         string     `gorm:"size:50;not null" json:"engine_number"`
    InsuranceStart       time.Time  `gorm:"type:date;not null" json:"insurance_start"`
    InsuranceFee         float64    `gorm:"not null" json:"insurance_fee"`
    VehicleType          string     `gorm:"size:100;not null" json:"vehicle_type"`
    CreatedAt            time.Time  `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt            time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}