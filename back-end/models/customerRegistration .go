package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CustomerRegistration struct { // khai báo khách hàng
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"customer_id"`
	CustomerType   string             `bson:"customer_type" json:"customer_type"`
	IdentityNumber string             `bson:"identity_number" json:"identity_number"`
	FullName       string             `bson:"full_name" json:"full_name"`
	Address        string             `bson:"address" json:"address"`
	Email          string             `bson:"email" json:"email"`
	PhoneNumber    string             `bson:"phone_number" json:"phone_number"`
	InvoiceRequest bool               `bson:"invoice_request" json:"invoice_request"`
	Notes          string             `bson:"notes" json:"notes"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

func (c *CustomerRegistration) Validate() error {
	if c.CustomerType == "" {
		c.CustomerType = "Cá nhân"
	} else if c.CustomerType != "Cá nhân" && c.CustomerType != "Tổ chức" {
		return fmt.Errorf("customer_type không hợp lệ! Phải là 'Cá nhân' hoặc 'Tổ chức'.")
	}
	return nil
}
