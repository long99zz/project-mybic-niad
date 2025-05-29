
package models

import (
    "time"
)

type PersonalInsuranceForm struct { // bảo hiểm sức khỏe cá nhân
    PersonalFormID      uint      `gorm:"primaryKey;autoIncrement" json:"personal_form_id"`
    FormID              *uint     `gorm:"index" json:"form_id"`  // Cho phép NULL
    FullName            string    `gorm:"size:255;not null" json:"full_name"`
    CmndImg             string    `gorm:"size:255;not null" json:"cmnd_img"`
    IdentityNumber      string    `gorm:"size:50;not null" json:"identity_number"`
    BirthDate           time.Time `gorm:"type:date;not null" json:"birth_date"`
    Gender              string    `gorm:"type:enum('Nam','Nữ','Khác');not null" json:"gender"`
    InsuranceProgram    string    `gorm:"size:255;not null" json:"insurance_program"`
    DentalExtension     bool      `gorm:"default:false" json:"dental_extension"`
    MaternityExtension  bool      `gorm:"default:false" json:"maternity_extension"`
    InsuranceStart      time.Time `gorm:"type:date;not null" json:"insurance_start"`
    InsuranceDuration   uint      `gorm:"not null" json:"insurance_duration"`
    InsuranceFee        float64   `gorm:"not null" json:"insurance_fee"`
    CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt           time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}