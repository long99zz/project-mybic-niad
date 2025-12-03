package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TravelInsuranceInvoice struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"invoice_id"`
	MasterInvoiceID   interface{}        `bson:"master_invoice_id,omitempty" json:"master_invoice_id"` // Can be int, string, or ObjectID
	UserID            interface{}        `bson:"user_id,omitempty" json:"user_id"`                     // Can be int, string, or ObjectID
	FormID            interface{}        `bson:"form_id,omitempty" json:"form_id"`                     // Can be int, string, or ObjectID
	Status            string             `bson:"status" json:"status"`
	DepartureLocation string             `bson:"departure_location" json:"departure_location"`
	Destination       string             `bson:"destination" json:"destination"`
	DepartureDate     time.Time          `bson:"departure_date" json:"departure_date"`
	ReturnDate        time.Time          `bson:"return_date" json:"return_date"`
	TotalDuration     int                `bson:"-" json:"total_duration"` // Calculated field
	GroupSize         int                `bson:"group_size" json:"group_size"`
	InsuranceProgram  string             `bson:"insurance_program" json:"insurance_program"`
	TotalAmount       float64            `bson:"total_amount" json:"total_amount"`
	InsurancePackage  string             `bson:"insurance_package" json:"insurance_package"`
	Note              string             `bson:"note" json:"note"`
	CustomerID        interface{}        `bson:"customer_id,omitempty" json:"customer_id"` // Can be int, string, or ObjectID
	ProductID         interface{}        `bson:"product_id,omitempty" json:"product_id"`   // Can be int, string, or ObjectID
	CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at" json:"updated_at"`
}
