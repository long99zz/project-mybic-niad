package models

import (
    "gorm.io/gorm"
    "time"
)

type User struct {
    ID            uint   `gorm:"primaryKey;column:id" json:"id"`
    AccountType   string `gorm:"size:50;column:account_type" json:"account_type"`
    FirstName     string `gorm:"size:255;column:first_name" json:"first_name"`
    LastName      string `gorm:"size:255;column:last_name" json:"last_name"`
    Phone         string `gorm:"size:15;column:phone" json:"phone"`
    Email         string `gorm:"size:255;unique;column:email" json:"email"`
    Password      string `gorm:"size:255;column:password" json:"password"`
    CitizenID     string `gorm:"size:50;column:citizen_id" json:"citizen_id"`
    Gender        string `gorm:"size:10;column:gender" json:"gender"`
    DateOfBirth   string `gorm:"type:DATE;column:date_of_birth" json:"date_of_birth"`
    Province      string `gorm:"size:255;column:province" json:"province"`
    City          *string `gorm:"size:255;column:city;default:NULL" json:"city,omitempty"`
    District      string `gorm:"size:255;column:district" json:"district"`
    SubDistrict   string `gorm:"size:255;column:sub_district" json:"sub_district"`
    HouseNumber   string `gorm:"size:50;column:house_number" json:"house_number"`
    Role          string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer';column:role" json:"role"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index" swaggerignore:"true"`
}