package models

import (
    "gorm.io/gorm"
    "time"
)

type PersonalInsuranceForm struct {
	gorm.Model
    PersonalFormID    uint    `gorm:"primaryKey;autoIncrement"`
    FormID           *uint   `gorm:"index"`  // Cho phép NULL
    CmndImg         string  `gorm:"size:255;not null"` // Đường dẫn ảnh CMND
    IdentityNumber  string  `gorm:"size:50;not null"`
    BirthDate       time.Time `gorm:"type:date;not null"`
    Gender          string  `gorm:"type:enum('Nam','Nữ','Khác');not null"`
    InsuranceProgram string `gorm:"size:255;not null"`
    DentalExtension  bool    `gorm:"default:false"`  // Dùng bool thay vì tinyint(1)
    MaternityExtension bool  `gorm:"default:false"`  // Dùng bool thay vì tinyint(1)
}