package models

import (
    "time"
    "gorm.io/gorm"
)

type InsuranceParticipantInfo struct {
    gorm.Model
    ParticipantID          uint    `gorm:"primaryKey;autoIncrement"`
    FormID                 uint    `gorm:"not null;index"`
    CmndImg                string  `gorm:"size:255;not null"` // Đường dẫn ảnh CMND
    FullName               string  `gorm:"size:255;not null"`
    BirthDate              time.Time `gorm:"type:date;not null"`
    Gender                 string  `gorm:"type:enum('Nam','Nữ','Khác');not null"`
    IdentityNumber         string  `gorm:"size:50;not null"`
    MainBenefit            string  `gorm:"size:255;not null"`
    StrokeAdditionalBenefit bool   `gorm:"default:false"` // Dùng bool thay vì tinyint(1)
    HasCancer              bool   `gorm:"default:false"`
    HadStroke              bool   `gorm:"default:false"`
    StageFourDisease       bool   `gorm:"default:false"`
}