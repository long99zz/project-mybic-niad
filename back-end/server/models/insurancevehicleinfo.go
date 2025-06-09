package models

import (
    "time"
)

type InsuranceVehicleInfo struct { // Thông tin bảo hiểm vật chất xe ô tô
    FormInsuranceID             uint      `gorm:"primaryKey;autoIncrement" json:"form_insurance_id"`
    Purpose                     string    `gorm:"size:255" json:"purpose"`
    VehicleType                 string    `gorm:"size:100" json:"vehicle_type"`
    Brand                       string    `gorm:"size:100" json:"brand"`
    Model                       string    `gorm:"size:100" json:"model"`
    ManufactureYear             *int      `json:"manufacture_year"` // Có thể NULL
    SeatCount                   *int      `json:"seat_count"`      // Có thể NULL
    VehicleValue                *float64  `gorm:"type:decimal(15,2)" json:"vehicle_value"`
    InsuranceAmount             *float64  `gorm:"type:decimal(15,2)" json:"insurance_amount"`
    RegistrationDate            *time.Time `gorm:"type:date" json:"registration_date"`
    Deductible                  *float64  `gorm:"type:decimal(15,2)" json:"deductible"`
    CoverageArea                string    `gorm:"size:255" json:"coverage_area"`
    ParticipantCount            *int      `json:"participant_count"` // Có thể NULL
    ParticipantInsuranceAmount  *float64  `gorm:"type:decimal(15,2)" json:"participant_insurance_amount"`
    FormID                      *uint     `gorm:"index" json:"form_id"`  // Cho phép NULL
    CreatedAt                   time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt                   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (InsuranceVehicleInfo) TableName() string {
    return "insurance_vehicle_info"
}