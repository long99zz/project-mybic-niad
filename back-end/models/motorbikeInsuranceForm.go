package models

import ("gorm.io/gorm"
"time"
)

type MotorbikeInsuranceForm struct {
    gorm.Model
    MotorbikeFormID    uint    `gorm:"primaryKey;autoIncrement"`
    FormID             *uint   `gorm:"index"`  // Cho phép NULL
    EngineCapacity     float64 `gorm:"not null"`
    AccidentCoverage   float64 `gorm:"not null"`
    InsuranceDuration  uint    `gorm:"not null"`
    OwnerName          string  `gorm:"size:255;not null"`
    RegistrationAddress string `gorm:"size:255;not null"`
    LicensePlateStatus bool    `gorm:"default:false"` // Dùng bool thay vì tinyint(1)
    LicensePlate       string  `gorm:"size:20;not null"`
    ChassisNumber      string  `gorm:"size:50;not null"`
    EngineNumber       string  `gorm:"size:50;not null"`
    InsuranceStart     time.Time `gorm:"type:date;not null"`
    InsuranceFee       float64 `gorm:"not null"`

}
