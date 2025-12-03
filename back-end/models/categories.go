package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category struct { // danh mục sản phẩm
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"category_id"`
	Name       string             `bson:"name" json:"name"`
	Image      string             `bson:"image" json:"image"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
	DeletedAt  *time.Time         `bson:"deleted_at,omitempty" json:"deleted_at,omitempty"`
	QtyProduct int                `bson:"-" json:"qty_product"`
}
