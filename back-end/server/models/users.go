package models

import (
    "gorm.io/gorm"
    "time"
)

type User struct {
    ID            uint   `gorm:"primaryKey;column:id" json:"id"`
    AccountType   string `gorm:"size:50;column:account_type;default:''" json:"account_type"`
    FirstName     string `gorm:"column:firstname;default:''" json:"first_name"`
    LastName      string `gorm:"column:lastname;default:''" json:"last_name"`
    Phone         string `gorm:"size:15;column:phone" json:"phone"`
    Email         string `gorm:"size:255;unique;column:email" json:"email"`
    Password      string `gorm:"size:255;column:password" json:"password"` // Đã sửa từ json:"-" để có thể bind JSON
    CitizenID     string `gorm:"size:50;column:citizen_identification;default:''" json:"citizen_id"`
    Gender        string `gorm:"size:10;column:gender;default:''" json:"gender"`
    DateOfBirth   *time.Time `gorm:"type:DATE;column:date_of_birth" json:"date_of_birth"`
    Province      string `gorm:"size:255;column:province;default:''" json:"province"`
    City          string `gorm:"size:255;column:city;default:''" json:"city"`
    District      string `gorm:"size:255;column:district;default:''" json:"district"`
    SubDistrict   string `gorm:"size:255;column:sub_district;default:''" json:"sub_district"`
    HouseNumber   string `gorm:"size:50;column:house_number;default:''" json:"house_number"`
    Role          string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer';column:role" json:"role"`
    CreatedAt     time.Time `json:"created_at"`
    UpdatedAt     time.Time `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `gorm:"index" json:"-" swaggerignore:"true"`
}