package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TravelParticipant struct {
	ID             primitive.ObjectID  `bson:"_id,omitempty" json:"participant_id"`
	InvoiceID      *primitive.ObjectID `bson:"invoice_id,omitempty" json:"invoice_id"` // liên kết với TravelInsuranceInvoice
	CmndImg        string              `bson:"cmnd_img" json:"cmnd_img"`
	FullName       string              `bson:"full_name" json:"full_name"`
	Gender         string              `bson:"gender" json:"gender"`
	BirthDate      time.Time           `bson:"birth_date" json:"birth_date"`
	IdentityNumber string              `bson:"identity_number" json:"identity_number"`
	CreatedAt      time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time           `bson:"updated_at" json:"updated_at"`
}
