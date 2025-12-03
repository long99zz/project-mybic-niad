package handlers

import (
	"backend/models"
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// ======================== CAR INSURANCE ========================

// CreateCarInsuranceForm creates a new car insurance form
func CreateCarInsuranceForm(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var form models.CarInsuranceForm
		if err := c.ShouldBindJSON(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get user ID from JWT for logging (not stored in form since model doesn't have UserID field)
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}
		_ = userIDStr // Use userIDStr for reference (would be used for associating form with user via session/context)

		form.ID = primitive.NewObjectID()
		form.CreatedAt = time.Now()
		form.UpdatedAt = time.Now()

		collection := mongoDB.Collection("insurance_forms")
		result, err := collection.InsertOne(ctx, form)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Car insurance form created successfully",
			"form_id": result.InsertedID,
		})
	}
}

// ======================== MOTORBIKE INSURANCE ========================

// CreateMotorbikeInsuranceForm creates a new motorbike insurance form
func CreateMotorbikeInsuranceForm(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var form models.MotorbikeInsuranceForm
		if err := c.ShouldBindJSON(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get user ID from JWT for logging (not stored in form since model doesn't have UserID field)
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}
		_ = userIDStr // Use userIDStr for reference

		// User ID is captured from JWT but not stored in form directly

		form.ID = primitive.NewObjectID()
		form.CreatedAt = time.Now()
		form.UpdatedAt = time.Now()

		collection := mongoDB.Collection("insurance_forms")
		result, err := collection.InsertOne(ctx, form)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Motorbike insurance form created successfully",
			"form_id": result.InsertedID,
		})
	}
}

// ======================== PERSONAL INSURANCE ========================

// CreatePersonalInsuranceForm creates a new personal insurance form
func CreatePersonalInsuranceForm(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var form models.PersonalInsuranceForm
		if err := c.ShouldBindJSON(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get user ID from JWT for logging (not stored in form since model doesn't have UserID field)
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}
		_ = userIDStr // Use userIDStr for reference

		// User ID is captured from JWT but not stored in form directly

		form.ID = primitive.NewObjectID()
		form.CreatedAt = time.Now()
		form.UpdatedAt = time.Now()

		collection := mongoDB.Collection("insurance_forms")
		result, err := collection.InsertOne(ctx, form)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create form", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Personal insurance form created successfully",
			"form_id": result.InsertedID,
		})
	}
}

// ======================== CUSTOMER REGISTRATION ========================

// CreateCustomerRegistration creates a new customer registration
func CreateCustomerRegistration(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var customer models.CustomerRegistration
		if err := c.ShouldBindJSON(&customer); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		if err := customer.Validate(); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		customer.ID = primitive.NewObjectID()
		customer.CreatedAt = time.Now()
		customer.UpdatedAt = time.Now()

		collection := mongoDB.Collection("customer_registrations")
		result, err := collection.InsertOne(ctx, customer)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer", "detail": err.Error()})
			return
		}

		customerID := ""
		if objID, ok := result.InsertedID.(primitive.ObjectID); ok {
			customerID = objID.Hex()
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":     "Customer registered successfully",
			"customer_id": customerID,
		})
	}
}

// UpdateCustomerRegistration updates customer registration
func UpdateCustomerRegistration(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		customerIDStr := c.Query("customer_id")
		customerID, err := primitive.ObjectIDFromHex(customerIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
			return
		}

		var updateData models.CustomerRegistration
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := mongoDB.Collection("customer_registrations")
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": customerID},
			bson.M{"$set": bson.M{
				"customer_type":   updateData.CustomerType,
				"identity_number": updateData.IdentityNumber,
				"full_name":       updateData.FullName,
				"address":         updateData.Address,
				"email":           updateData.Email,
				"phone_number":    updateData.PhoneNumber,
				"invoice_request": updateData.InvoiceRequest,
				"notes":           updateData.Notes,
				"updated_at":      time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer", "detail": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Customer updated successfully"})
	}
}

// ======================== VEHICLE INSURANCE ========================

// CreateVehicleInsuranceForm creates a new vehicle insurance form
func CreateVehicleInsuranceForm(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vehicleForm models.InsuranceVehicleInfo
		if err := c.ShouldBindJSON(&vehicleForm); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// User ID is captured from JWT but not stored in form directly

		vehicleForm.ID = primitive.NewObjectID()
		vehicleForm.CreatedAt = time.Now()
		vehicleForm.UpdatedAt = time.Now()

		collection := mongoDB.Collection("vehicle_insurance_forms")
		result, err := collection.InsertOne(ctx, vehicleForm)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vehicle form", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Vehicle insurance form created successfully",
			"form_id": result.InsertedID,
		})
	}
}

// ======================== INSURANCE PARTICIPANT INFO ========================

// CreateInsuranceParticipantInfo creates participant information for insurance
func CreateInsuranceParticipantInfo(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var participant models.InsuranceParticipantInfo
		if err := c.ShouldBindJSON(&participant); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// User ID is captured from JWT but not stored in participant directly

		participant.ID = primitive.NewObjectID()
		participant.CreatedAt = time.Now()
		participant.UpdatedAt = time.Now()

		collection := mongoDB.Collection("participant_info")
		result, err := collection.InsertOne(ctx, participant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create participant", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":        "Participant info created successfully",
			"participant_id": result.InsertedID,
		})
	}
}

// ======================== TRAVEL INSURANCE ========================

// CreateTravelInsuranceInvoice creates a travel insurance invoice
func CreateTravelInsuranceInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Frontend sends flat structure with all invoice fields + participants array
		var invoiceData bson.M
		if err := c.ShouldBindJSON(&invoiceData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		// Extract participants array if provided
		var participants []bson.M
		if partsInterface, ok := invoiceData["participants"]; ok {
			// participants is an array in the invoice data
			if parts, ok := partsInterface.([]interface{}); ok {
				for _, p := range parts {
					if m, ok := p.(bson.M); ok {
						participants = append(participants, m)
					}
				}
			}
			// Remove participants from invoice data since we'll save separately
			delete(invoiceData, "participants")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Support both int and ObjectID user_id
		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		invoiceID := primitive.NewObjectID()
		invoiceData["_id"] = invoiceID
		invoiceData["user_id"] = userID
		if _, ok := invoiceData["status"].(string); !ok {
			invoiceData["status"] = "Chưa thanh toán"
		}
		invoiceData["created_at"] = time.Now()
		invoiceData["updated_at"] = time.Now()

		// Parse and convert date strings to time.Time if provided
		if depDate, ok := invoiceData["departure_date"].(string); ok && depDate != "" {
			if parsedTime, err := time.Parse("2006-01-02T15:04:05Z", depDate); err == nil {
				invoiceData["departure_date"] = parsedTime
			}
		}
		if retDate, ok := invoiceData["return_date"].(string); ok && retDate != "" {
			if parsedTime, err := time.Parse("2006-01-02T15:04:05Z", retDate); err == nil {
				invoiceData["return_date"] = parsedTime
			}
		}

		// Create master invoice first
		masterInvoiceCollection := mongoDB.Collection("invoices_master")
		masterInvoice := bson.M{
			"_id":        primitive.NewObjectID(),
			"status":     "Chưa thanh toán",
			"created_at": time.Now(),
			"updated_at": time.Now(),
		}
		masterResult, err := masterInvoiceCollection.InsertOne(ctx, masterInvoice)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create master invoice", "detail": err.Error()})
			return
		}

		// Add master_invoice_id to child invoice data
		invoiceData["master_invoice_id"] = masterResult.InsertedID

		// Save invoice
		collection := mongoDB.Collection("travel_insurance_invoices")
		result, err := collection.InsertOne(ctx, invoiceData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invoice", "detail": err.Error()})
			return
		}

		// Save participants if provided
		if len(participants) > 0 {
			participantCollection := mongoDB.Collection("insurance_participant_info")
			participantDocs := make([]interface{}, 0, len(participants))
			for _, p := range participants {
				if p == nil {
					continue
				}

				// Normalize participant keys from frontend (lowercase) to stored format
				normalizedP := bson.M{
					"_id":        primitive.NewObjectID(),
					"invoice_id": invoiceID,
					"created_at": time.Now(),
					"updated_at": time.Now(),
				}

				// Map keys (frontend uses lowercase: full_name, birth_date, identity_number, gender)
				if v, ok := p["full_name"]; ok {
					normalizedP["full_name"] = v
				}
				if v, ok := p["gender"]; ok {
					normalizedP["gender"] = v
				}
				if v, ok := p["birth_date"]; ok {
					normalizedP["birth_date"] = v
				}
				if v, ok := p["identity_number"]; ok {
					normalizedP["identity_number"] = v
				}

				participantDocs = append(participantDocs, normalizedP)
			}

			if len(participantDocs) > 0 {
				_, err = participantCollection.InsertMany(ctx, participantDocs)
				if err != nil {
					// Log error but don't fail the request - invoice was created successfully
					log.Printf("Warning: Failed to save participants: %v\n", err)
				}
			}
		}

		// Return both invoice_id and master_invoice_id
		response := gin.H{
			"message": "Travel insurance invoice created successfully",
		}

		// Add invoice_id to response
		if objID, ok := result.InsertedID.(primitive.ObjectID); ok {
			response["invoice_id"] = objID.Hex()
		} else {
			response["invoice_id"] = result.InsertedID
		}

		// Add master_invoice_id to response
		if objID, ok := masterResult.InsertedID.(primitive.ObjectID); ok {
			response["master_invoice_id"] = objID.Hex()
		} else {
			response["master_invoice_id"] = masterResult.InsertedID
		}

		// Add form_id to response (same as invoice_id for consistency)
		response["form_id"] = response["invoice_id"]

		c.JSON(http.StatusCreated, response)
	}
}

// UpdateTravelInvoiceCustomer updates customer info for a travel invoice
func UpdateTravelInvoiceCustomer(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var updateData struct {
			InvoiceID  string `json:"invoice_id" binding:"required"`
			CustomerID string `json:"customer_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		invoiceID, err := primitive.ObjectIDFromHex(updateData.InvoiceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID format"})
			return
		}

		customerID, err := primitive.ObjectIDFromHex(updateData.CustomerID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID format"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := mongoDB.Collection("travel_insurance_invoices")
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"customer_id": customerID,
				"updated_at":  time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invoice", "detail": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Invoice customer updated successfully",
			"invoice_id":  updateData.InvoiceID,
			"customer_id": updateData.CustomerID,
		})
	}
}

// ======================== ACCIDENT INSURANCE ========================

// CreateAccidentInsuranceInvoice creates an accident insurance invoice
func CreateAccidentInsuranceInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Handle both nested {invoice: {...}, participants: [...]} and flat invoice structures
		var payload struct {
			Invoice      bson.M   `json:"invoice"`
			Participants []bson.M `json:"participants"`
		}

		// Try to unmarshal as nested structure first
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Support both int and ObjectID user_id (consistent with CreateInvoice)
		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		// Extract invoice data (handle nested structure)
		var invoiceData bson.M
		if payload.Invoice != nil && len(payload.Invoice) > 0 {
			invoiceData = payload.Invoice
		} else {
			// If no nested invoice, treat entire payload as flat invoice data
			invoiceData = bson.M{}
			if err := c.ShouldBindJSON(&invoiceData); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
				return
			}
		}

		// Normalize field names from frontend (uppercase) to lowercase for consistency
		if v, ok := invoiceData["ProductID"]; ok {
			invoiceData["product_id"] = v
			delete(invoiceData, "ProductID")
		}
		if v, ok := invoiceData["InsurancePackage"]; ok {
			invoiceData["insurance_package"] = v
			delete(invoiceData, "InsurancePackage")
		}
		if v, ok := invoiceData["InsuranceStart"]; ok {
			invoiceData["insurance_start"] = v
			delete(invoiceData, "InsuranceStart")
		}
		if v, ok := invoiceData["InsuranceEnd"]; ok {
			invoiceData["insurance_end"] = v
			delete(invoiceData, "InsuranceEnd")
		}
		if v, ok := invoiceData["InsuranceAmount"]; ok {
			invoiceData["insurance_amount"] = v
			delete(invoiceData, "InsuranceAmount")
		}
		if v, ok := invoiceData["InsuranceQuantity"]; ok {
			invoiceData["insurance_quantity"] = v
			delete(invoiceData, "InsuranceQuantity")
		}
		if v, ok := invoiceData["ContractType"]; ok {
			invoiceData["contract_type"] = v
			delete(invoiceData, "ContractType")
		}
		if _, ok := invoiceData["Status"]; ok {
			delete(invoiceData, "Status") // Will be overwritten below
		}

		// Add metadata
		invoiceID := primitive.NewObjectID()
		invoiceData["_id"] = invoiceID
		invoiceData["user_id"] = userID
		invoiceData["status"] = "Chưa thanh toán"
		invoiceData["created_at"] = time.Now()
		invoiceData["updated_at"] = time.Now()

		// Parse and convert date strings to time.Time if provided
		// Support both ISO 8601 (RFC3339) and YYYY-MM-DD formats
		if insStart, ok := invoiceData["insurance_start"].(string); ok && insStart != "" {
			if parsedTime, err := time.Parse(time.RFC3339, insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05.000Z", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			}
		}
		if insEnd, ok := invoiceData["insurance_end"].(string); ok && insEnd != "" {
			if parsedTime, err := time.Parse(time.RFC3339, insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05.000Z", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			}
		}

		// Create master invoice first
		masterInvoiceCollection := mongoDB.Collection("invoices_master")
		masterInvoice := bson.M{
			"_id":        primitive.NewObjectID(),
			"status":     "Chưa thanh toán",
			"created_at": time.Now(),
			"updated_at": time.Now(),
		}
		masterResult, err := masterInvoiceCollection.InsertOne(ctx, masterInvoice)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create master invoice", "detail": err.Error()})
			return
		}

		// Add master_invoice_id to child invoice data
		invoiceData["master_invoice_id"] = masterResult.InsertedID

		// Save invoice
		collection := mongoDB.Collection("accident_invoices")
		result, err := collection.InsertOne(ctx, invoiceData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invoice", "detail": err.Error()})
			return
		}

		// Save participants if provided
		if len(payload.Participants) > 0 {
			participantCollection := mongoDB.Collection("insurance_participant_info")
			participantDocs := make([]interface{}, len(payload.Participants))
			for i, p := range payload.Participants {
				if p == nil {
					continue
				}

				// Normalize participant keys from frontend (uppercase) to lowercase
				normalizedP := bson.M{
					"_id":        primitive.NewObjectID(),
					"invoice_id": invoiceID,
					"created_at": time.Now(),
					"updated_at": time.Now(),
				}

				// Map uppercase keys to lowercase
				if v, ok := p["FullName"]; ok {
					normalizedP["full_name"] = v
				} else if v, ok := p["fullName"]; ok {
					normalizedP["full_name"] = v
				} else if v, ok := p["full_name"]; ok {
					normalizedP["full_name"] = v
				}

				if v, ok := p["Gender"]; ok {
					normalizedP["gender"] = v
				} else if v, ok := p["gender"]; ok {
					normalizedP["gender"] = v
				}

				if v, ok := p["BirthDate"]; ok {
					normalizedP["birth_date"] = v
				} else if v, ok := p["birthDate"]; ok {
					normalizedP["birth_date"] = v
				} else if v, ok := p["birth_date"]; ok {
					normalizedP["birth_date"] = v
				}

				if v, ok := p["IdentityNumber"]; ok {
					normalizedP["identity_number"] = v
				} else if v, ok := p["identityNumber"]; ok {
					normalizedP["identity_number"] = v
				} else if v, ok := p["identity_number"]; ok {
					normalizedP["identity_number"] = v
				}

				if v, ok := p["InsurancePackage"]; ok {
					normalizedP["insurance_package"] = v
				} else if v, ok := p["insurancePackage"]; ok {
					normalizedP["insurance_package"] = v
				} else if v, ok := p["insurance_package"]; ok {
					normalizedP["insurance_package"] = v
				}

				participantDocs[i] = normalizedP
			}

			if len(participantDocs) > 0 {
				_, err = participantCollection.InsertMany(ctx, participantDocs)
				if err != nil {
					// Log error but don't fail the request - invoice was created successfully
					fmt.Printf("Warning: Failed to save participants: %v\n", err)
				}
			}
		}

		// Return both invoice_id and master_invoice_id
		response := gin.H{
			"message": "Accident insurance invoice created successfully",
		}

		// Add invoice_id to response
		if objID, ok := result.InsertedID.(primitive.ObjectID); ok {
			response["invoice_id"] = objID.Hex()
		}

		// Add master_invoice_id to response
		if objID, ok := masterResult.InsertedID.(primitive.ObjectID); ok {
			response["master_invoice_id"] = objID.Hex()
		}

		c.JSON(http.StatusCreated, response)
	}
}

// UpdateInvoiceCustomer updates customer info for an accident invoice
func UpdateInvoiceCustomer(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var updateData struct {
			InvoiceID  string `json:"invoice_id" binding:"required"`
			CustomerID string `json:"customer_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		invoiceID, err := primitive.ObjectIDFromHex(updateData.InvoiceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID format"})
			return
		}

		customerID, err := primitive.ObjectIDFromHex(updateData.CustomerID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID format"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := mongoDB.Collection("accident_invoices")
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"customer_id": customerID,
				"updated_at":  time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invoice", "detail": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Invoice customer updated successfully",
			"invoice_id":  updateData.InvoiceID,
			"customer_id": updateData.CustomerID,
		})
	}
}

// ======================== HOME INSURANCE ========================

// CreateHomeInsuranceInvoice creates a home insurance invoice
func CreateHomeInsuranceInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var invoiceData bson.M
		if err := c.ShouldBindJSON(&invoiceData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Support both int and ObjectID user_id
		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		invoiceID := primitive.NewObjectID()
		invoiceData["_id"] = invoiceID
		invoiceData["user_id"] = userID
		if _, ok := invoiceData["status"].(string); !ok {
			invoiceData["status"] = "Chưa thanh toán"
		}
		invoiceData["created_at"] = time.Now()
		invoiceData["updated_at"] = time.Now()

		// Parse and convert date strings to time.Time if provided
		// Support multiple ISO formats
		if insStart, ok := invoiceData["insurance_start"].(string); ok && insStart != "" {
			if parsedTime, err := time.Parse(time.RFC3339, insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05.000Z", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05Z", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			}
		}
		if insEnd, ok := invoiceData["insurance_end"].(string); ok && insEnd != "" {
			if parsedTime, err := time.Parse(time.RFC3339, insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05.000Z", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02T15:04:05Z", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			} else if parsedTime, err := time.Parse("2006-01-02", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			}
		}

		// Create master invoice first
		masterInvoiceCollection := mongoDB.Collection("invoices_master")
		masterInvoice := bson.M{
			"_id":        primitive.NewObjectID(),
			"status":     "Chưa thanh toán",
			"created_at": time.Now(),
			"updated_at": time.Now(),
		}
		masterResult, err := masterInvoiceCollection.InsertOne(ctx, masterInvoice)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create master invoice", "detail": err.Error()})
			return
		}

		// Add master_invoice_id to child invoice data
		invoiceData["master_invoice_id"] = masterResult.InsertedID

		collection := mongoDB.Collection("home_insurance_invoices")
		result, err := collection.InsertOne(ctx, invoiceData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invoice", "detail": err.Error()})
			return
		}

		// Return both invoice_id and master_invoice_id
		response := gin.H{
			"message": "Home insurance invoice created successfully",
		}

		// Add invoice_id to response
		if objID, ok := result.InsertedID.(primitive.ObjectID); ok {
			response["invoice_id"] = objID.Hex()
		}

		// Add master_invoice_id to response
		if objID, ok := masterResult.InsertedID.(primitive.ObjectID); ok {
			response["master_invoice_id"] = objID.Hex()
		}

		c.JSON(http.StatusCreated, response)
	}
}

// UpdateHomeInvoiceCustomer updates customer info for a home invoice
func UpdateHomeInvoiceCustomer(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var updateData struct {
			InvoiceID  string `json:"invoice_id" binding:"required"`
			CustomerID string `json:"customer_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		invoiceID, err := primitive.ObjectIDFromHex(updateData.InvoiceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID format"})
			return
		}

		customerID, err := primitive.ObjectIDFromHex(updateData.CustomerID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID format"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collection := mongoDB.Collection("home_insurance_invoices")
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"customer_id": customerID,
				"updated_at":  time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invoice", "detail": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Invoice customer updated successfully",
			"invoice_id":  updateData.InvoiceID,
			"customer_id": updateData.CustomerID,
		})
	}
}

// ======================== CONFIRM PURCHASE ========================

// ConfirmPurchase confirms a purchase/insurance policy
func ConfirmPurchase(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			InvoiceID  interface{} `json:"invoice_id"`
			CustomerID interface{} `json:"customer_id"`
			FormID     interface{} `json:"form_id"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		if input.InvoiceID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing invoice_id"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Support both int and ObjectID invoice_id
		var invoiceID interface{} = input.InvoiceID
		if invoiceIDStr, ok := input.InvoiceID.(string); ok {
			if intVal, err := strconv.Atoi(invoiceIDStr); err == nil {
				invoiceID = intVal
			} else if objID, err := primitive.ObjectIDFromHex(invoiceIDStr); err == nil {
				invoiceID = objID
			}
		} else if invoiceIDFloat, ok := input.InvoiceID.(float64); ok {
			invoiceID = int(invoiceIDFloat)
		}

		// Determine which collection to update based on query parameter or default
		collectionName := c.Query("collection")
		if collectionName == "" {
			collectionName = "invoices" // Default collection
		}

		collection := mongoDB.Collection(collectionName)
		result, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     "Đã thanh toán",
				"updated_at": time.Now(),
			}},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to confirm purchase", "detail": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		// NOTE: ConfirmPurchase chỉ nên được gọi SAU KHI thanh toán thành công
		// Không tạo master invoice mới ở đây vì master invoice đã được tạo khi create invoice
		// Chỉ cần update status của master invoice nếu cần
		masterInvoiceCollection := mongoDB.Collection("invoices_master")

		// Tìm master invoice liên kết với invoice này
		var childInvoice bson.M
		err = collection.FindOne(ctx, bson.M{"_id": invoiceID}).Decode(&childInvoice)
		if err == nil {
			if masterID, ok := childInvoice["master_invoice_id"]; ok {
				// Update master invoice status
				_, err := masterInvoiceCollection.UpdateOne(
					ctx,
					bson.M{"_id": masterID},
					bson.M{"$set": bson.M{
						"status":     "Đã thanh toán",
						"updated_at": time.Now(),
					}},
				)
				if err != nil {
					log.Printf("[ConfirmPurchase] Failed to update master invoice: %v", err)
				}
			}
		}

		// Get master_invoice_id from child invoice
		masterInvoiceID := ""
		if childInvoice != nil {
			if masterID, ok := childInvoice["master_invoice_id"].(primitive.ObjectID); ok {
				masterInvoiceID = masterID.Hex()
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message":           "Purchase confirmed successfully",
			"invoice_id":        input.InvoiceID,
			"master_invoice_id": masterInvoiceID,
		})
	}
}

// CreateInvoice is a generic invoice creation handler
func CreateInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var invoiceData bson.M
		if err := c.ShouldBindJSON(&invoiceData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "detail": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Support both int and ObjectID user_id
		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		invoiceData["_id"] = primitive.NewObjectID()
		invoiceData["user_id"] = userID
		invoiceData["status"] = "Chưa thanh toán"
		invoiceData["created_at"] = time.Now()
		invoiceData["updated_at"] = time.Now()

		// Parse and convert date strings to time.Time
		if insStart, ok := invoiceData["insurance_start"].(string); ok && insStart != "" {
			if parsedTime, err := time.Parse("2006-01-02", insStart); err == nil {
				invoiceData["insurance_start"] = parsedTime
			}
		}
		if insEnd, ok := invoiceData["insurance_end"].(string); ok && insEnd != "" {
			if parsedTime, err := time.Parse("2006-01-02", insEnd); err == nil {
				invoiceData["insurance_end"] = parsedTime
			}
		}

		// If master_invoice_id provided, save it
		if masterInvoiceID, ok := invoiceData["master_invoice_id"]; ok && masterInvoiceID != nil {
			// Keep it as is
		} else {
			// If not provided, create one
			masterInvoiceCollection := mongoDB.Collection("invoices_master")
			masterInvoice := bson.M{
				"_id":        primitive.NewObjectID(),
				"status":     "Chưa thanh toán",
				"created_at": time.Now(),
				"updated_at": time.Now(),
			}
			masterResult, err := masterInvoiceCollection.InsertOne(ctx, masterInvoice)
			if err == nil {
				invoiceData["master_invoice_id"] = masterResult.InsertedID
			}
		}

		collection := mongoDB.Collection("invoices")
		result, err := collection.InsertOne(ctx, invoiceData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invoice", "detail": err.Error()})
			return
		}

		// Return both invoice_id and master_invoice_id
		response := gin.H{
			"message":    "Invoice created successfully",
			"invoice_id": result.InsertedID,
		}

		// Add master_invoice_id to response if available
		if masterID, ok := invoiceData["master_invoice_id"]; ok {
			if objID, ok := masterID.(primitive.ObjectID); ok {
				response["master_invoice_id"] = objID.Hex()
			} else {
				response["master_invoice_id"] = masterID
			}
		}

		c.JSON(http.StatusCreated, response)
	}
}
