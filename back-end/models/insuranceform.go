package models

import (
   "time"
)
type InsuranceForm struct {
    FormID             uint    `gorm:"primaryKey;autoIncrement" json:"form_id"`
    InsuranceType      string  `gorm:"size:255;not null" json:"insurance_type"`
    PolicyHolderName   string  `gorm:"size:255;not null" json:"policy_holder_name"`
    InsuranceStart     time.Time `gorm:"type:date;not null" json:"insurance_start"`
    InsuranceDuration  int     `gorm:"not null" json:"insurance_duration"`
    TotalPremium       float64 `gorm:"not null" json:"total_premium"`
    CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}