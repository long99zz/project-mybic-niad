package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

// Helper functions for MongoDB operations

func GetCollection(db *mongo.Database, collectionName string) *mongo.Collection {
	return db.Collection(collectionName)
}

func GetContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}

// Collection names constants
const (
	CollectionUsers                   = "users"
	CollectionCategories              = "categories"
	CollectionProducts                = "products"
	CollectionInvoices                = "invoices"
	CollectionInvoicesMaster          = "invoices_master"
	CollectionTravelInvoices          = "travel_invoices"
	CollectionHomeInvoices            = "home_invoices"
	CollectionCustomerRegistrations   = "customer_registrations"
	CollectionCarInsuranceForms       = "car_insurance_forms"
	CollectionMotorbikeInsuranceForms = "motorbike_insurance_forms"
	CollectionPersonalInsuranceForms  = "personal_insurance_forms"
	CollectionInsuranceParticipants   = "insurance_participants"
	CollectionInsuranceVehicleInfo    = "insurance_vehicle_info"
	CollectionTravelParticipants      = "travel_participants"
	CollectionPaymentTransactions     = "payment_transactions"
	CollectionPosts                   = "posts"
	CollectionParticipants            = "participants"
)
