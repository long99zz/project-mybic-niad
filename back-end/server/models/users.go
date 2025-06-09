package models

import (
    "gorm.io/gorm"
    "time"
)

type User struct {
    ID            uint   `gorm:"primaryKey;column:id"`
    AccountType   string `gorm:"size:50;column:account_type"`
    FirstName     string `gorm:"size:255;column:first_name"`
    LastName      string `gorm:"size:255;column:last_name"`
    Phone         string `gorm:"size:15;column:phone"`
    Email         string `gorm:"size:255;unique;column:email"`
    Password      string `gorm:"size:255;column:password"`
    CitizenID     string `gorm:"size:50;column:citizen_id"`
    Gender        string `gorm:"size:10;column:gender"`
    DateOfBirth   string `gorm:"type:DATE;column:date_of_birth"`
    Province      string `gorm:"size:255;column:province"`
    City          string `gorm:"size:255;column:city"`
    District      string `gorm:"size:255;column:district"`
    SubDistrict   string `gorm:"size:255;column:sub_district"`
    HouseNumber   string `gorm:"size:50;column:house_number"`
    Role          string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer';column:role"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index" swaggerignore:"true"`
}