package models

import (
	"time"
)

type User struct {
	ID          interface{} `bson:"_id,omitempty" json:"id"`
	AccountType string      `bson:"account_type,omitempty" json:"account_type"`
	FirstName   string      `bson:"first_name,omitempty" json:"first_name"`
	LastName    string      `bson:"last_name,omitempty" json:"last_name"`
	Phone       string      `bson:"phone,omitempty" json:"phone"`
	Email       string      `bson:"email" json:"email"`
	Password    string      `bson:"password" json:"password"`
	CitizenID   string      `bson:"citizen_id,omitempty" json:"citizen_id"`
	Gender      string      `bson:"gender,omitempty" json:"gender"`
	DateOfBirth interface{} `bson:"date_of_birth,omitempty" json:"date_of_birth"` // Can be string or time.Time
	Province    string      `bson:"province,omitempty" json:"province"`
	City        *string     `bson:"city,omitempty" json:"city,omitempty"`
	District    string      `bson:"district,omitempty" json:"district"`
	SubDistrict string      `bson:"sub_district,omitempty" json:"sub_district"`
	HouseNumber string      `bson:"house_number,omitempty" json:"house_number"`
	Role        string      `bson:"role,omitempty" json:"role"`
	CreatedAt   time.Time   `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt   time.Time   `bson:"updated_at,omitempty" json:"updated_at"`
}
