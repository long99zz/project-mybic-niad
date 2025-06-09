package models

import (
    "time"
)

type InsuranceParticipantInfo struct { // Thông tin người tham gia bảo hiểm
    ParticipantID            uint      `gorm:"primaryKey;autoIncrement" json:"participant_id"`
    FormID                   *uint     `gorm:"index" json:"form_id"`
    CustomerID               *uint `gorm:"index" json:"customer_id"` // cho phép NULL
    CmndImg                  string    `gorm:"size:255;not null" json:"cmnd_img"`
    FullName                 string    `gorm:"size:255;not null" json:"full_name"`
    BirthDate                time.Time `gorm:"type:date;not null" json:"birth_date"`
    Gender                   string    `gorm:"size:10;not null" json:"gender"`
    IdentityNumber           string    `gorm:"size:50;not null" json:"identity_number"`
    MainBenefit              string    `gorm:"size:255;not null" json:"main_benefit"`
    StrokeAdditionalBenefit  bool      `gorm:"default:false" json:"stroke_additional_benefit"`
    HasCancer                bool      `gorm:"default:false" json:"has_cancer"`
    HadStroke                bool      `gorm:"default:false" json:"had_stroke"`
    StageFourDisease         bool      `gorm:"default:false" json:"stage_four_disease"`
    InsuranceDuration        uint      `gorm:"not null" json:"insurance_duration"`
    PremiumFee               float64   `gorm:"not null;default:0" json:"premium_fee"`
    CreatedAt                time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt                time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
func (InsuranceParticipantInfo) TableName() string {
    return "insurance_participant_info"
}