package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Participant struct {
	ID             primitive.ObjectID  `bson:"_id,omitempty" json:"ParticipantID"`
	InvoiceID      *primitive.ObjectID `bson:"invoice_id,omitempty" json:"InvoiceID"`
	CmndImg        string              `bson:"cmnd_img" json:"CmndImg"`
	FullName       string              `bson:"full_name" json:"FullName"`
	Gender         string              `bson:"gender" json:"Gender"`
	BirthDate      time.Time           `bson:"birth_date" json:"BirthDate"`
	IdentityNumber string              `bson:"identity_number" json:"IdentityNumber"`
	CreatedAt      time.Time           `bson:"created_at" json:"CreatedAt"`
	UpdatedAt      time.Time           `bson:"updated_at" json:"UpdatedAt"`
}
