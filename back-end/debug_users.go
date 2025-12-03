package main

import (
	"backend/config"
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

// Debug function để xem users collection
func debugUsers() {
	cfg := config.LoadConfig()
	client, err := config.ConnectMongoDB(cfg)
	if err != nil {
		log.Fatal("Không thể kết nối:", err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database(cfg.DBName)
	usersCollection := db.Collection("users")

	// Find all users
	cursor, err := usersCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal("Error querying users:", err)
	}
	defer cursor.Close(context.Background())

	var results []interface{}
	if err := cursor.All(context.Background(), &results); err != nil {
		log.Fatal("Error decoding users:", err)
	}

	fmt.Printf("Found %d users:\n", len(results))
	for i, result := range results {
		fmt.Printf("\nUser %d: %v\n", i+1, result)
	}
}
