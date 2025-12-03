package handlers

import (
	"backend/models"
	"context"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ======================== ADMIN DASHBOARD & STATISTICS ========================

type DashboardStats struct {
	TotalOrders     int64   `json:"total_orders"`
	PendingOrders   int64   `json:"pending_orders"`
	CompletedOrders int64   `json:"completed_orders"`
	TotalRevenue    float64 `json:"total_revenue"`
	TotalUsers      int64   `json:"total_users"`
	TotalProducts   int64   `json:"total_products"`
}

// AdminGetDashboardStats returns dashboard statistics
func AdminGetDashboardStats(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		stats := DashboardStats{}

		// Count total orders across collections (use correct collection names)
		invoiceCount, _ := mongoDB.Collection("invoices").EstimatedDocumentCount(ctx)
		travelCount, _ := mongoDB.Collection("travel_insurance_invoices").EstimatedDocumentCount(ctx)
		homeCount, _ := mongoDB.Collection("home_insurance_invoices").EstimatedDocumentCount(ctx)
		accidentCount, _ := mongoDB.Collection("accident_invoices").EstimatedDocumentCount(ctx)
		stats.TotalOrders = invoiceCount + travelCount + homeCount + accidentCount

		// Count pending orders (Chưa thanh toán)
		pendingFilter := bson.M{"status": "Chưa thanh toán"}
		pendingInvoices, _ := mongoDB.Collection("invoices").CountDocuments(ctx, pendingFilter)
		pendingTravel, _ := mongoDB.Collection("travel_insurance_invoices").CountDocuments(ctx, pendingFilter)
		pendingHome, _ := mongoDB.Collection("home_insurance_invoices").CountDocuments(ctx, pendingFilter)
		pendingAccident, _ := mongoDB.Collection("accident_invoices").CountDocuments(ctx, pendingFilter)
		stats.PendingOrders = pendingInvoices + pendingTravel + pendingHome + pendingAccident

		// Count completed orders (Đã thanh toán)
		completedFilter := bson.M{"status": "Đã thanh toán"}
		completedInvoices, _ := mongoDB.Collection("invoices").CountDocuments(ctx, completedFilter)
		completedTravel, _ := mongoDB.Collection("travel_insurance_invoices").CountDocuments(ctx, completedFilter)
		completedHome, _ := mongoDB.Collection("home_insurance_invoices").CountDocuments(ctx, completedFilter)
		completedAccident, _ := mongoDB.Collection("accident_invoices").CountDocuments(ctx, completedFilter)
		stats.CompletedOrders = completedInvoices + completedTravel + completedHome + completedAccident

		// Get total users and products
		stats.TotalUsers, _ = mongoDB.Collection("users").EstimatedDocumentCount(ctx)
		stats.TotalProducts, _ = mongoDB.Collection("products").EstimatedDocumentCount(ctx)

		// Calculate total revenue from invoices
		pipeline := mongo.Pipeline{
			bson.D{
				bson.E{Key: "$group", Value: bson.D{
					bson.E{Key: "_id", Value: nil},
					bson.E{Key: "total", Value: bson.D{
						bson.E{Key: "$sum", Value: "$insurance_amount"},
					}},
				}},
			},
		}
		cursor, _ := mongoDB.Collection("invoices").Aggregate(ctx, pipeline)
		var revenueResult []bson.M
		if err := cursor.All(ctx, &revenueResult); err == nil && len(revenueResult) > 0 {
			if total, ok := revenueResult[0]["total"]; ok {
				if floatVal, ok := total.(float64); ok {
					stats.TotalRevenue = floatVal
				}
			}
		}

		c.JSON(http.StatusOK, stats)
	}
}

// ======================== ORDER MANAGEMENT ========================

// AdminSelectAllInvoices returns all invoices (like GetMyInvoicesMongo but without user filter)
func AdminSelectAllInvoices(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceCollection := mongoDB.Collection("invoices")
		travelCollection := mongoDB.Collection("travel_insurance_invoices")
		homeCollection := mongoDB.Collection("home_insurance_invoices")
		accidentCollection := mongoDB.Collection("accident_invoices")
		productCollection := mongoDB.Collection("products")
		userCollection := mongoDB.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		type AdminInvoiceView struct {
			InvoiceID          interface{} `json:"invoice_id"`
			MasterInvoiceID    interface{} `json:"master_invoice_id"`
			InvoiceType        string      `json:"invoice_type"`
			ProductID          interface{} `json:"product_id"`
			ProductName        string      `json:"product_name"`
			Status             string      `json:"status"`
			CreatedAt          string      `json:"created_at"`
			UpdatedAt          string      `json:"updated_at"`
			InsuranceStart     *string     `json:"insurance_start,omitempty"`
			InsuranceEnd       *string     `json:"insurance_end,omitempty"`
			InsuranceAmount    *float64    `json:"insurance_amount,omitempty"`
			CustomerName       string      `json:"customer_name,omitempty"`
			CreatedAtTimestamp int64       `json:"-"`
		}

		formatDate := func(t time.Time) string {
			if t.IsZero() {
				return ""
			}
			return t.Format("2006-01-02")
		}

		formatDatePtr := func(t time.Time) *string {
			if t.IsZero() {
				return nil
			}
			formatted := t.Format("2006-01-02")
			return &formatted
		}

		// Helper to get customer name from user_id or invoice fields
		getCustomerName := func(inv bson.M) string {
			// PRIORITY 1: Lookup from user_id first
			if userID, ok := inv["user_id"].(primitive.ObjectID); ok {
				var user bson.M
				if err := userCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user); err == nil {
					if userName, ok := user["name"].(string); ok && userName != "" {
						return userName
					}
					if email, ok := user["email"].(string); ok && email != "" {
						return email
					}
				}
			} else if userIDVal, ok := inv["user_id"]; ok {
				// Try int32 (from MongoDB)
				if userIDInt32, ok := userIDVal.(int32); ok {
					var user bson.M
					if err := userCollection.FindOne(ctx, bson.M{"_id": userIDInt32}).Decode(&user); err == nil {
						if userName, ok := user["name"].(string); ok && userName != "" {
							return userName
						}
						if email, ok := user["email"].(string); ok && email != "" {
							return email
						}
					}
				}

				// Try string conversion
				if userIDStr, ok := userIDVal.(string); ok {
					objID, err := primitive.ObjectIDFromHex(userIDStr)
					if err == nil {
						var user bson.M
						if err := userCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user); err == nil {
							if userName, ok := user["name"].(string); ok && userName != "" {
								return userName
							}
						}
					}
				}

				// Try float64
				if userIDNum, ok := userIDVal.(float64); ok {
					var user bson.M
					if err := userCollection.FindOne(ctx, bson.M{"_id": int(userIDNum)}).Decode(&user); err == nil {
						if userName, ok := user["name"].(string); ok && userName != "" {
							return userName
						}
					}
				}
			}
			// PRIORITY 2: Try customer_name field
			if name, ok := inv["customer_name"].(string); ok && name != "" {
				return name
			}
			// PRIORITY 3: Try policy_holder_name
			if name, ok := inv["policy_holder_name"].(string); ok && name != "" {
				return name
			}
			// PRIORITY 4: Try buyer_name
			if name, ok := inv["buyer_name"].(string); ok && name != "" {
				return name
			}
			// PRIORITY 5: Try insured_name
			if name, ok := inv["insured_name"].(string); ok && name != "" {
				return name
			}
			return ""
		}

		// Helper to normalize product_id from various types
		normalizeProductID := func(rawProdID interface{}) interface{} {
			if rawProdID == nil {
				return nil
			}

			// Handle ObjectID
			if pid, ok := rawProdID.(primitive.ObjectID); ok {
				return pid
			}
			if pidPtr, ok := rawProdID.(*primitive.ObjectID); ok && pidPtr != nil {
				return *pidPtr
			}

			// Handle numeric types
			if pid, ok := rawProdID.(int32); ok {
				return pid
			}
			if pid, ok := rawProdID.(int); ok {
				return pid
			}
			if pid, ok := rawProdID.(float64); ok {
				return int(pid)
			}

			// Handle string - try to parse as int
			if pidStr, ok := rawProdID.(string); ok {
				if pidInt, err := strconv.Atoi(pidStr); err == nil {
					return pidInt
				}
			}

			return rawProdID
		}

		findProductName := func(prodID interface{}) string {
			if prodID == nil {
				return "Bảo hiểm"
			}
			var productBson bson.M

			// Try direct match first
			if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					return pn
				}
			}

			// Handle string conversion (like "5", "10")
			if strID, ok := prodID.(string); ok {
				// Try as ObjectID
				if objID, err := primitive.ObjectIDFromHex(strID); err == nil {
					if err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&productBson); err == nil {
						if pn, ok := productBson["name"].(string); ok && pn != "" {
							return pn
						}
					}
				}
				// Try parsing as int
				if intVal, err := strconv.Atoi(strID); err == nil {
					if err := productCollection.FindOne(ctx, bson.M{"_id": intVal}).Decode(&productBson); err == nil {
						if pn, ok := productBson["name"].(string); ok && pn != "" {
							return pn
						}
					}
					// Also try int32
					if err := productCollection.FindOne(ctx, bson.M{"_id": int32(intVal)}).Decode(&productBson); err == nil {
						if pn, ok := productBson["name"].(string); ok && pn != "" {
							return pn
						}
					}
				}
			}

			// Try numeric conversions
			var intID int32
			switch v := prodID.(type) {
			case float64:
				intID = int32(v)
			case int:
				intID = int32(v)
			case int32:
				intID = v
			case int64:
				intID = int32(v)
			default:
				return "Bảo hiểm"
			}

			// Try int32
			if err := productCollection.FindOne(ctx, bson.M{"_id": intID}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					return pn
				}
			}

			// Try int
			if err := productCollection.FindOne(ctx, bson.M{"_id": int(intID)}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					return pn
				}
			}

			return "Bảo hiểm"
		}

		var result []AdminInvoiceView

		// 1. Get all general invoices (NO user filter for admin)
		opts := options.Find().SetSort(bson.M{"created_at": -1})
		cursor, _ := invoiceCollection.Find(ctx, bson.M{}, opts)
		if cursor != nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if cursor.All(ctx, &invoices) == nil {
				for _, inv := range invoices {
					// Try both product_id and ProductID (uppercase from frontend)
					prodID := inv["product_id"]
					if prodID == nil {
						prodID = inv["ProductID"]
					}
					prodID = normalizeProductID(prodID)
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					}
					var insStart, insEnd *string
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDatePtr(is.Time())
					}
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDatePtr(ie.Time())
					}
					var insAmount *float64
					if ia, ok := inv["insurance_amount"].(float64); ok {
						insAmount = &ia
					}

					// Get product name - lookup product_id first, then fallback to insurance_package
					productName := findProductName(prodID)
					if productName == "Bảo hiểm" {
						if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
							productName = pkg
						}
					}

					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					customerName := getCustomerName(inv)

					result = append(result, AdminInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Chung",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						UpdatedAt:          formatDate(updatedAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    insAmount,
						CustomerName:       customerName,
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// 2. Travel invoices
		cursor, _ = travelCollection.Find(ctx, bson.M{}, opts)
		if cursor != nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if cursor.All(ctx, &invoices) == nil {
				for _, inv := range invoices {
					// Try both product_id and ProductID (uppercase from frontend)
					prodID := inv["product_id"]
					if prodID == nil {
						prodID = inv["ProductID"]
					}
					prodID = normalizeProductID(prodID)
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					}
					var departureDate, returnDate *string
					if dd, ok := inv["departure_date"].(primitive.DateTime); ok {
						departureDate = formatDatePtr(dd.Time())
					}
					if rd, ok := inv["return_date"].(primitive.DateTime); ok {
						returnDate = formatDatePtr(rd.Time())
					}
					var insAmount *float64
					if amt, ok := inv["total_amount"].(float64); ok {
						insAmount = &amt
					}

					// Lookup product_id first, then fallback to insurance_package
					productName := findProductName(prodID)
					if productName == "Bảo hiểm" {
						if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
							productName = pkg
						}
					}

					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					customerName := getCustomerName(inv)

					result = append(result, AdminInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Du lịch",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						UpdatedAt:          formatDate(updatedAt),
						InsuranceStart:     departureDate,
						InsuranceEnd:       returnDate,
						InsuranceAmount:    insAmount,
						CustomerName:       customerName,
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// 3. Home invoices
		cursor, _ = homeCollection.Find(ctx, bson.M{}, opts)
		if cursor != nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if cursor.All(ctx, &invoices) == nil {
				for _, inv := range invoices {
					// Try both product_id and ProductID (uppercase from frontend)
					prodID := inv["product_id"]
					if prodID == nil {
						prodID = inv["ProductID"]
					}
					prodID = normalizeProductID(prodID)
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					}
					var insStart, insEnd *string
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDatePtr(is.Time())
					}
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDatePtr(ie.Time())
					}
					var insAmount *float64
					if amt, ok := inv["total_amount"].(float64); ok && amt > 0 {
						insAmount = &amt
					}

					// Lookup product_id first, then fallback to insurance_package
					productName := findProductName(prodID)
					if productName == "Bảo hiểm" {
						if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
							productName = pkg
						}
					}

					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					customerName := getCustomerName(inv)

					result = append(result, AdminInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Nhà",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						UpdatedAt:          formatDate(updatedAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    insAmount,
						CustomerName:       customerName,
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// 4. Accident invoices
		cursor, _ = accidentCollection.Find(ctx, bson.M{}, opts)
		if cursor != nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if cursor.All(ctx, &invoices) == nil {
				for _, inv := range invoices {
					// Try both product_id and ProductID (uppercase from frontend)
					prodID := inv["product_id"]
					if prodID == nil {
						prodID = inv["ProductID"]
					}
					prodID = normalizeProductID(prodID)
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					}
					var insStart, insEnd *string
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDatePtr(is.Time())
					}
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDatePtr(ie.Time())
					}
					var insAmount *float64
					if amt, ok := inv["insurance_amount"].(float64); ok {
						insAmount = &amt
					}

					// Lookup product_id first, then fallback to insurance_package
					productName := findProductName(prodID)
					if productName == "Bảo hiểm" {
						if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
							productName = pkg
						}
					}

					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					customerName := getCustomerName(inv)

					result = append(result, AdminInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Tai nạn",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						UpdatedAt:          formatDate(updatedAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    insAmount,
						CustomerName:       customerName,
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// Sort all results by created_at timestamp descending
		sort.Slice(result, func(i, j int) bool {
			return result[i].CreatedAtTimestamp > result[j].CreatedAtTimestamp
		})

		c.JSON(http.StatusOK, result)
	}
}

// AdminGetInvoiceDetail returns detail of a specific invoice
func AdminGetInvoiceDetail(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Query("invoice_id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var invoice models.Invoice
		err = mongoDB.Collection("invoices").FindOne(ctx, bson.M{"_id": invoiceID}).Decode(&invoice)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, invoice)
	}
}

// AdminGetOrderDetail returns detail of an order by master_invoice_id
func AdminGetOrderDetail(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		masterIDStr := c.Param("id")
		masterID, err := primitive.ObjectIDFromHex(masterIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid master invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		// Find master invoice
		var masterInvoice bson.M
		err = mongoDB.Collection("invoices_master").FindOne(ctx, bson.M{"_id": masterID}).Decode(&masterInvoice)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Master invoice not found"})
			return
		}

		// Search for child invoice in all collections
		collections := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices", "accident_invoices"}
		var childInvoice bson.M
		var invoiceType string

		for _, collName := range collections {
			// Try finding by master_invoice_id
			err := mongoDB.Collection(collName).FindOne(ctx, bson.M{"master_invoice_id": masterID}).Decode(&childInvoice)
			if err == nil {
				// Found the child invoice
				switch collName {
				case "invoices":
					invoiceType = "Chung"
				case "travel_insurance_invoices":
					invoiceType = "Du lịch"
				case "home_insurance_invoices":
					invoiceType = "Nhà"
				case "accident_invoices":
					invoiceType = "Tai nạn"
				}
				break
			} else {
				// Also try finding by _id in case the id is a child invoice id
				tempErr := mongoDB.Collection(collName).FindOne(ctx, bson.M{"_id": masterID}).Decode(&childInvoice)
				if tempErr == nil {
					switch collName {
					case "invoices":
						invoiceType = "Chung"
					case "travel_insurance_invoices":
						invoiceType = "Du lịch"
					case "home_insurance_invoices":
						invoiceType = "Nhà"
					case "accident_invoices":
						invoiceType = "Tai nạn"
					}
					break
				}
			}
		}

		if childInvoice == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Child invoice not found"})
			return
		}

		// Get user info if user_id exists
		var userName string
		var userEmail string
		var userPhone string
		var userAddress string

		// Try to get user_id from different formats
		var userID interface{}
		userID = childInvoice["user_id"]
		if userID == nil {
			userID = childInvoice["UserId"]
		}

		if userID != nil {
			var user bson.M
			var err error

			// Try different type formats for user lookup
			switch v := userID.(type) {
			case primitive.ObjectID:
				err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": v}).Decode(&user)
			case int32:
				err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": v}).Decode(&user)
				// If not found, try converting to string
				if err != nil {
					err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": fmt.Sprintf("%d", v)}).Decode(&user)
				}
			case string:
				// Try as ObjectID first
				if objID, parseErr := primitive.ObjectIDFromHex(v); parseErr == nil {
					err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
				}
				// Try as string _id
				if err != nil {
					err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": v}).Decode(&user)
				}
			case float64:
				err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": int(v)}).Decode(&user)
				// If not found, try as string
				if err != nil {
					err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": fmt.Sprintf("%d", int(v))}).Decode(&user)
				}
			case int:
				err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": v}).Decode(&user)
				// If not found, try as string
				if err != nil {
					err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": fmt.Sprintf("%d", v)}).Decode(&user)
				}
			}

			if err == nil {
				// Build full name from first_name and last_name
				firstName := ""
				lastName := ""
				if fn, ok := user["first_name"].(string); ok {
					firstName = fn
				}
				if ln, ok := user["last_name"].(string); ok {
					lastName = ln
				}

				// Try single "name" field as fallback
				if firstName == "" && lastName == "" {
					if n, ok := user["name"].(string); ok {
						userName = n
					}
				} else {
					userName = firstName + " " + lastName
					userName = strings.TrimSpace(userName)
				}

				if email, ok := user["email"].(string); ok {
					userEmail = email
				}
				if phone, ok := user["phone"].(string); ok {
					userPhone = phone
				}

				// Build address from components: house_number + sub_district + district + city + province
				var addressParts []string
				if houseNum, ok := user["house_number"].(string); ok && houseNum != "" {
					addressParts = append(addressParts, houseNum)
				}
				if subDist, ok := user["sub_district"].(string); ok && subDist != "" {
					addressParts = append(addressParts, subDist)
				}
				if district, ok := user["district"].(string); ok && district != "" {
					addressParts = append(addressParts, district)
				}
				if city, ok := user["city"].(string); ok && city != "" {
					addressParts = append(addressParts, city)
				}
				if province, ok := user["province"].(string); ok && province != "" {
					addressParts = append(addressParts, province)
				}
				if len(addressParts) > 0 {
					userAddress = strings.Join(addressParts, ", ")
				}
			}
		}

		// Get product info
		var productName string
		var categoryName string

		// Try both product_id and ProductID (for different data formats)
		var prodID interface{}
		var found bool

		if prodID, found = childInvoice["product_id"]; !found {
			if prodID, found = childInvoice["ProductID"]; !found {
				prodID = nil
			}
		}

		if prodID != nil {
			var intID int32

			// Handle different numeric types
			switch v := prodID.(type) {
			case float64:
				intID = int32(v)
			case int32:
				intID = v
			case int64:
				intID = int32(v)
			case int:
				intID = int32(v)
			}

			if intID > 0 {
				var product bson.M
				if err := mongoDB.Collection("products").FindOne(ctx, bson.M{"_id": intID}).Decode(&product); err == nil {
					// Get product name
					if name, ok := product["name"].(string); ok {
						productName = name
					}

					// Get category info from products
					if categoryID, ok := product["category_id"].(float64); ok {
						catID := int32(categoryID)
						var category bson.M
						if err := mongoDB.Collection("categories").FindOne(ctx, bson.M{"_id": catID}).Decode(&category); err == nil {
							if catName, ok := category["name"].(string); ok {
								categoryName = catName
							}
						}
					} else if categoryID, ok := product["category_id"].(int32); ok {
						var category bson.M
						if err := mongoDB.Collection("categories").FindOne(ctx, bson.M{"_id": categoryID}).Decode(&category); err == nil {
							if catName, ok := category["name"].(string); ok {
								categoryName = catName
							}
						}
					} else if categoryID, ok := product["category_id"].(int64); ok {
						var category bson.M
						if err := mongoDB.Collection("categories").FindOne(ctx, bson.M{"_id": int32(categoryID)}).Decode(&category); err == nil {
							if catName, ok := category["name"].(string); ok {
								categoryName = catName
							}
						}
					}
				}
			}
		}

		// Get participants if they exist separately
		var participants []bson.M
		participantCursor, err := mongoDB.Collection("insurance_participant_info").Find(ctx, bson.M{"invoice_id": childInvoice["_id"]})
		if err == nil {
			_ = participantCursor.All(ctx, &participants)
		}

		// Build response with all customer and participant info
		response := gin.H{
			"master_invoice_id": masterID.Hex(),
			"invoice_type":      invoiceType,
			"master_invoice":    masterInvoice,
			"child_invoice":     childInvoice,
			"product_name":      productName,
			"category_name":     categoryName,
			"customer_name":     userName,
			"customer_email":    userEmail,
			"customer_phone":    userPhone,
			"customer_address":  userAddress,
			"participants":      participants,
		}

		c.JSON(http.StatusOK, response)
	}
}

// AdminUpdateOrderStatus updates order status
func AdminUpdateOrderStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderIDStr := c.Param("id")
		orderID, err := primitive.ObjectIDFromHex(orderIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		var updateData struct {
			Status string `json:"status" bson:"status"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("invoices").UpdateOne(
			ctx,
			bson.M{"_id": orderID},
			bson.M{"$set": bson.M{
				"status":     updateData.Status,
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
	}
}

// AdminDeleteOrder deletes an order
func AdminDeleteOrder(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderIDStr := c.Param("id")
		orderID, err := primitive.ObjectIDFromHex(orderIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("invoices").DeleteOne(ctx, bson.M{"_id": orderID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully"})
	}
}

// ======================== INVOICE STATUS MANAGEMENT ========================

// AdminUpdateInvoiceStatus updates invoice status
func AdminUpdateInvoiceStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		var updateData struct {
			Status string `json:"status" bson:"status"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("invoices").UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     updateData.Status,
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Invoice status updated successfully"})
	}
}

// AdminRevertInvoiceStatus reverts invoice status
func AdminRevertInvoiceStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("invoices").UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     "pending",
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Invoice status reverted successfully"})
	}
}

// AdminDeleteInvoice deletes an invoice
func AdminDeleteInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("invoices").DeleteOne(ctx, bson.M{"_id": invoiceID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Invoice deleted successfully"})
	}
}

// AdminDeleteTravelInvoice deletes a travel invoice
func AdminDeleteTravelInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("travel_insurance_invoices").DeleteOne(ctx, bson.M{"_id": invoiceID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Travel invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Travel invoice deleted successfully"})
	}
}

// AdminUpdateTravelInvoiceStatus updates travel invoice status
func AdminUpdateTravelInvoiceStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		var updateData struct {
			Status string `json:"status" bson:"status"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("travel_insurance_invoices").UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     updateData.Status,
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Travel invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Travel invoice status updated successfully"})
	}
}

// AdminDeleteHomeInvoice deletes a home invoice
func AdminDeleteHomeInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("home_insurance_invoices").DeleteOne(ctx, bson.M{"_id": invoiceID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Home invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Home invoice deleted successfully"})
	}
}

// AdminUpdateHomeInvoiceStatus updates home invoice status
func AdminUpdateHomeInvoiceStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		var updateData struct {
			Status string `json:"status" bson:"status"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("home_insurance_invoices").UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     updateData.Status,
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Home invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Home invoice status updated successfully"})
	}
}

// AdminDeleteAccidentInvoice deletes an accident invoice
func AdminDeleteAccidentInvoice(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("accident_invoices").DeleteOne(ctx, bson.M{"_id": invoiceID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Accident invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Accident invoice deleted successfully"})
	}
}

// AdminUpdateAccidentInvoiceStatus updates accident invoice status
func AdminUpdateAccidentInvoiceStatus(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceIDStr := c.Param("id")
		invoiceID, err := primitive.ObjectIDFromHex(invoiceIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
			return
		}

		var updateData struct {
			Status string `json:"status" bson:"status"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("accident_invoices").UpdateOne(
			ctx,
			bson.M{"_id": invoiceID},
			bson.M{"$set": bson.M{
				"status":     updateData.Status,
				"updated_at": time.Now(),
			}},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Accident invoice not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Accident invoice status updated successfully"})
	}
}

// ======================== USER MANAGEMENT ========================

// AdminGetAllUsers returns all users
func AdminGetAllUsers(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		opts := options.Find().SetSkip(0).SetLimit(50)
		cursor, err := mongoDB.Collection("users").Find(ctx, bson.M{}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}
		defer cursor.Close(ctx)

		var users []models.User
		if err = cursor.All(ctx, &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode users"})
			return
		}

		// Return array directly for frontend
		c.JSON(http.StatusOK, users)
	}
}

// AdminGetUserDetail returns detail of a specific user
func AdminGetUserDetail(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr := c.Param("id")
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user models.User
		err = mongoDB.Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// AdminUpdateUser updates a user
func AdminUpdateUser(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr := c.Param("id")
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		var updateData bson.M
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("users").UpdateOne(
			ctx,
			bson.M{"_id": userID},
			bson.M{"$set": updateData},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
	}
}

// AdminDeleteUser deletes a user
func AdminDeleteUser(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr := c.Param("id")
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("users").DeleteOne(ctx, bson.M{"_id": userID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	}
}

// ======================== PRODUCT MANAGEMENT ========================

// AdminGetAllProducts returns all products
func AdminGetAllProducts(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		opts := options.Find().SetSkip(0).SetLimit(50)
		cursor, err := mongoDB.Collection("products").Find(ctx, bson.M{}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}
		defer cursor.Close(ctx)

		// Use bson.M for flexible decoding since _id might be int or ObjectID
		var products []bson.M
		if err = cursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
			return
		}

		// Return array directly for frontend
		c.JSON(http.StatusOK, products)
	}
}

// AdminGetProductDetail returns detail of a specific product
func AdminGetProductDetail(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var product models.Product
		err = mongoDB.Collection("products").FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

// AdminCreateProduct creates a new product
func AdminCreateProduct(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		product.ID = primitive.NewObjectID()
		product.CreatedAt = time.Now()
		product.UpdatedAt = time.Now()

		result, err := mongoDB.Collection("products").InsertOne(ctx, product)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":    "Product created successfully",
			"product_id": result.InsertedID,
		})
	}
}

// AdminUpdateProduct updates a product
func AdminUpdateProduct(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		var updateData bson.M
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		updateData["updated_at"] = time.Now()

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("products").UpdateOne(
			ctx,
			bson.M{"_id": productID},
			bson.M{"$set": updateData},
		)

		if err != nil || result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
	}
}

// AdminDeleteProduct deletes a product
func AdminDeleteProduct(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := mongoDB.Collection("products").DeleteOne(ctx, bson.M{"_id": productID})
		if err != nil || result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
	}
}

// ======================== STUB FUNCTIONS FOR OPTIONAL ENDPOINTS ========================

// AdminGetRevenueByMonth returns revenue by month
func AdminGetRevenueByMonth(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Aggregate revenue from all invoice collections by month
		collections := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices", "accident_invoices"}
		monthlyRevenue := make(map[string]float64)

		for _, collName := range collections {
			pipeline := mongo.Pipeline{
				{{Key: "$match", Value: bson.M{"status": "Đã thanh toán"}}},
				{{Key: "$group", Value: bson.M{
					"_id": bson.M{
						"year":  bson.M{"$year": "$created_at"},
						"month": bson.M{"$month": "$created_at"},
					},
					"total": bson.M{"$sum": bson.M{
						"$ifNull": bson.A{"$insurance_amount", "$total_amount"},
					}},
				}}},
				{{Key: "$sort", Value: bson.M{"_id.year": 1, "_id.month": 1}}},
			}

			cursor, err := mongoDB.Collection(collName).Aggregate(ctx, pipeline)
			if err != nil {
				continue
			}
			defer cursor.Close(ctx)

			var results []bson.M
			if err = cursor.All(ctx, &results); err == nil {
				for _, result := range results {
					if id, ok := result["_id"].(bson.M); ok {
						year := id["year"]
						month := id["month"]
						total, _ := result["total"].(float64)
						key := ""
						if y, ok := year.(int32); ok {
							if m, ok := month.(int32); ok {
								key = time.Month(m).String() + " " + fmt.Sprint(y)
							}
						}
						if key != "" {
							monthlyRevenue[key] += total
						}
					}
				}
			}
		}

		// Convert map to array format for frontend
		type MonthRevenue struct {
			Month   string  `json:"month"`
			Revenue float64 `json:"revenue"`
		}
		var revenueData []MonthRevenue
		for month, revenue := range monthlyRevenue {
			revenueData = append(revenueData, MonthRevenue{
				Month:   month,
				Revenue: revenue,
			})
		}

		c.JSON(http.StatusOK, revenueData)
	}
}

// AdminGetOrdersByProduct returns orders grouped by product
func AdminGetOrdersByProduct(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		collections := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices", "accident_invoices"}

		// Load products into map first
		productsCursor, err := mongoDB.Collection("products").Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load products"})
			return
		}
		defer productsCursor.Close(ctx)

		var products []bson.M
		if err = productsCursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse products"})
			return
		}

		productMap := make(map[int]bson.M)
		for _, p := range products {
			if id, ok := p["_id"]; ok {
				switch v := id.(type) {
				case int:
					productMap[v] = p
					fmt.Printf("Loaded product: ID=%d, Name=%v\n", v, p["name"])
				case int32:
					productMap[int(v)] = p
					fmt.Printf("Loaded product: ID=%d, Name=%v\n", int(v), p["name"])
				case int64:
					productMap[int(v)] = p
					fmt.Printf("Loaded product: ID=%d, Name=%v\n", int(v), p["name"])
				default:
					fmt.Printf("Unknown product _id type: %T, value: %v\n", v, v)
				}
			}
		}
		fmt.Printf("Total products loaded: %d\n", len(productMap))

		// Map to store product_name -> count (group by name, not ID)
		productCounts := make(map[string]int64)

		// Product lookup helper
		findProductName := func(prodID interface{}) string {
			if prodID == nil {
				return "Unknown"
			}

			// Convert to int
			var intID int
			switch v := prodID.(type) {
			case int:
				intID = v
			case int32:
				intID = int(v)
			case int64:
				intID = int(v)
			case float64:
				intID = int(v)
			case string:
				if parsed, err := strconv.Atoi(v); err == nil {
					intID = parsed
				} else {
					fmt.Printf("Cannot parse prodID string: %s\n", v)
					return "Unknown"
				}
			default:
				fmt.Printf("Unknown prodID type: %T, value: %v\n", v, v)
				return "Unknown"
			}

			// Look up in productMap (already loaded)
			if prod, ok := productMap[intID]; ok {
				if name, ok := prod["name"].(string); ok && name != "" {
					return name
				}
			}

			fmt.Printf("Product not found in map for ID: %d\n", intID)
			return "Unknown"
		}

		for _, collName := range collections {
			cursor, err := mongoDB.Collection(collName).Find(ctx, bson.M{})
			if err != nil {
				continue
			}

			var invoices []bson.M
			if err := cursor.All(ctx, &invoices); err != nil {
				cursor.Close(ctx)
				continue
			}
			cursor.Close(ctx)

			for _, inv := range invoices {
				// Get product_id (check both cases)
				prodID := inv["product_id"]
				if prodID == nil {
					prodID = inv["ProductID"]
				}

				if prodID != nil {
					fmt.Printf("Invoice product_id: %v (type: %T)\n", prodID, prodID)
				}

				productName := findProductName(prodID)
				productCounts[productName]++
			}
		}

		// Convert to array
		type ProductOrder struct {
			ProductName string `json:"product_name"`
			OrderCount  int64  `json:"order_count"`
		}
		var orderData []ProductOrder

		for name, count := range productCounts {
			orderData = append(orderData, ProductOrder{
				ProductName: name,
				OrderCount:  count,
			})
		}

		// Sort by order_count descending
		sort.Slice(orderData, func(i, j int) bool {
			return orderData[i].OrderCount > orderData[j].OrderCount
		})

		c.JSON(http.StatusOK, orderData)
	}
}

// AdminGetMonthlyStatistics returns monthly statistics
func AdminGetMonthlyStatistics(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Monthly statistics endpoint"})
	}
}

// AdminGetProductStatistics returns product statistics
func AdminGetProductStatistics(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Get all products first
		productsCursor, err := mongoDB.Collection("products").Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
			return
		}
		defer productsCursor.Close(ctx)

		var products []bson.M
		if err = productsCursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse products"})
			return
		}

		// Create product map for lookup (using int as key)
		productMap := make(map[int]bson.M)
		for _, p := range products {
			if id, ok := p["_id"]; ok {
				var intID int
				switch v := id.(type) {
				case int32:
					intID = int(v)
				case int64:
					intID = int(v)
				case int:
					intID = v
				default:
					continue
				}
				productMap[intID] = p
				fmt.Printf("[ProductStats] Loaded product: ID=%d (type:%T), Name=%v\n", intID, id, p["name"])
			}
		}
		fmt.Printf("[ProductStats] Total products in map: %d\n", len(productMap))

		// Query all invoice collections
		collections := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices", "accident_invoices"}

		type ProductStat struct {
			ProductID    int     `json:"product_id"`
			ProductName  string  `json:"product_name"`
			CategoryID   int     `json:"category_id"`
			CategoryName string  `json:"category_name"`
			TotalSold    int64   `json:"total_sold"`
			TotalRevenue float64 `json:"total_revenue"`
			DateGroup    string  `json:"date_group"`
		}

		// Use string key to handle both product_id and insurance_package names
		productStats := make(map[string]*ProductStat)
		nextUnknownID := -1 // For invoices with no valid product_id

		for _, collName := range collections {
			cursor, err := mongoDB.Collection(collName).Find(ctx, bson.M{})
			if err != nil {
				continue
			}

			var invoices []bson.M
			if err = cursor.All(ctx, &invoices); err != nil {
				cursor.Close(ctx)
				continue
			}
			cursor.Close(ctx)

			for _, inv := range invoices {
				// Get product_id (handle both uppercase and lowercase)
				var productID int
				if pid, ok := inv["product_id"]; ok {
					switch v := pid.(type) {
					case int32:
						productID = int(v)
					case int64:
						productID = int(v)
					case int:
						productID = v
					case float64:
						productID = int(v)
					}
				} else if pid, ok := inv["ProductID"]; ok {
					switch v := pid.(type) {
					case int32:
						productID = int(v)
					case int64:
						productID = int(v)
					case int:
						productID = v
					case float64:
						productID = int(v)
					}
				}

				// Get amount
				var amount float64
				if amt, ok := inv["insurance_amount"]; ok {
					if f, ok := amt.(float64); ok {
						amount = f
					}
				} else if amt, ok := inv["total_amount"]; ok {
					if f, ok := amt.(float64); ok {
						amount = f
					}
				}

				var statKey string
				var productName string
				var categoryID int

				// Check if product_id is valid and exists in productMap
				if productID > 0 {
					if prod, ok := productMap[productID]; ok {
						// Valid product found
						statKey = fmt.Sprintf("id_%d", productID)
						if name, ok := prod["name"].(string); ok {
							productName = name
						} else {
							productName = "Unknown Product"
						}
						if catID, ok := prod["category_id"]; ok {
							switch v := catID.(type) {
							case int32:
								categoryID = int(v)
							case int64:
								categoryID = int(v)
							case int:
								categoryID = v
							}
						}
					} else {
						// product_id exists but not in products collection
						// Try to use insurance_package as fallback
						if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
							statKey = fmt.Sprintf("pkg_%s", pkg)
							productName = pkg
						} else {
							statKey = fmt.Sprintf("id_%d", productID)
							productName = fmt.Sprintf("Unknown Product (ID: %d)", productID)
						}
					}
				} else {
					// No product_id, use insurance_package if available
					if pkg, ok := inv["insurance_package"].(string); ok && pkg != "" {
						statKey = fmt.Sprintf("pkg_%s", pkg)
						productName = pkg
					} else {
						// No product_id and no insurance_package
						statKey = fmt.Sprintf("unknown_%d", nextUnknownID)
						productName = "Unknown Insurance"
						nextUnknownID--
					}
				}

				// Initialize or update product stats
				if _, exists := productStats[statKey]; !exists {
					productStats[statKey] = &ProductStat{
						ProductID:    productID,
						ProductName:  productName,
						CategoryID:   categoryID,
						TotalSold:    0,
						TotalRevenue: 0,
						DateGroup:    "all",
					}
				}

				productStats[statKey].TotalSold++
				productStats[statKey].TotalRevenue += amount
			}
		}

		// Get category names
		categoriesCursor, err := mongoDB.Collection("categories").Find(ctx, bson.M{})
		if err == nil {
			var categories []bson.M
			if err = categoriesCursor.All(ctx, &categories); err == nil {
				categoryMap := make(map[int]string)
				for _, cat := range categories {
					if id, ok := cat["_id"]; ok {
						if name, ok := cat["name"].(string); ok {
							switch v := id.(type) {
							case int32:
								categoryMap[int(v)] = name
							case int64:
								categoryMap[int(v)] = name
							case int:
								categoryMap[v] = name
							}
						}
					}
				}

				// Update category names
				for _, stat := range productStats {
					if stat.CategoryID > 0 {
						if catName, ok := categoryMap[stat.CategoryID]; ok {
							stat.CategoryName = catName
						}
					}
				}
			}
			categoriesCursor.Close(ctx)
		}

		// Convert to array
		var results []ProductStat
		for _, stat := range productStats {
			results = append(results, *stat)
		}

		// Sort by revenue descending
		sort.Slice(results, func(i, j int) bool {
			return results[i].TotalRevenue > results[j].TotalRevenue
		})

		c.JSON(http.StatusOK, results)
	}
}

// AdminProductStatistics returns product statistics
func AdminProductStatistics(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Product statistics endpoint"})
	}
}

// AdminSearchCustomersByDate searches customers by date
func AdminSearchCustomersByDate(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Search customers by date endpoint"})
	}
}
