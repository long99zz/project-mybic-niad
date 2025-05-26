package models

import (
    "time"
)

type InsuranceVehicleInfo struct {
    FormInsuranceID         uint    `gorm:"primaryKey"`
    Purpose                 string  `gorm:"size:255"`
    VehicleType             string  `gorm:"size:100"`
    Brand                   string  `gorm:"size:100"`
    Model                   string  `gorm:"size:100"`
    ManufactureYear         *int    // Có thể NULL
    SeatCount               *int    // Có thể NULL
    VehicleValue            *float64 `gorm:"type:decimal(15,2)"`
    InsuranceAmount         *float64 `gorm:"type:decimal(15,2)"`
    RegistrationDate        *time.Time `gorm:"type:date"`
    Deductible              *float64 `gorm:"type:decimal(15,2)"`
    CoverageArea            string  `gorm:"size:255"`
    ParticipantCount        *int    // Có thể NULL
    ParticipantInsuranceAmount *float64 `gorm:"type:decimal(15,2)"`
    FormID                  *uint   `gorm:"index"`  // Cho phép NULL
    CreatedAt               time.Time `gorm:"autoCreateTime"`
    UpdatedAt               time.Time `gorm:"autoUpdateTime"`
}