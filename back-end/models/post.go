package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID         primitive.ObjectID  `bson:"_id,omitempty" json:"post_id"`
	CategoryID *primitive.ObjectID `bson:"category_id,omitempty" json:"category_id"`
	Title      string              `bson:"title" json:"title"`
	Image      string              `bson:"image" json:"image"`
	Author     string              `bson:"author" json:"author"`
	Content    string              `bson:"content" json:"content"`
	Views      uint                `bson:"views" json:"views"`
	Status     string              `bson:"status" json:"status"`
	CreatedAt  time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time           `bson:"updated_at" json:"updated_at"`
}
