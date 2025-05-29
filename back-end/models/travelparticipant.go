package models

import "time"

type TravelParticipant struct {
    ParticipantID   uint      `gorm:"primaryKey;autoIncrement" json:"participant_id"`
    InvoiceID       uint      `gorm:"index;not null" json:"invoice_id"` // liên kết với TravelInsuranceInvoice
    CmndImg         string    `gorm:"size:255" json:"cmnd_img"`
    FullName        string    `gorm:"size:255;not null" json:"full_name"`
    Gender          string    `gorm:"type:enum('Nam','Nữ','Khác');not null" json:"gender"`
    BirthDate       time.Time `gorm:"type:date;not null" json:"birth_date"`
    IdentityNumber  string    `gorm:"size:50;not null" json:"identity_number"`
    CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}