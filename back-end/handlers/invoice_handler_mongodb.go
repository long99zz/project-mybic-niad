package handlers

import (
	"backend/models"
	"context"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetMyInvoicesMongo - Lấy danh sách hóa đơn của user hiện tại
func GetMyInvoicesMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceCollection := db.Collection("invoices")
		travelCollection := db.Collection("travel_insurance_invoices")
		homeCollection := db.Collection("home_insurance_invoices")
		accidentCollection := db.Collection("accident_invoices")
		productCollection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		userIDVal := userIDStr.(string)
		var userIDInt int
		var userIDObj primitive.ObjectID
		var hasInt, hasObj bool

		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userIDInt = intVal
			hasInt = true
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userIDObj = objID
			hasObj = true
		} // Build query to match string OR int OR ObjectID
		userIDQuery := bson.M{"$or": []bson.M{
			{"user_id": userIDVal}, // string
		}}
		if hasInt {
			userIDQuery["$or"] = append(userIDQuery["$or"].([]bson.M), bson.M{"user_id": userIDInt})
		}
		if hasObj {
			userIDQuery["$or"] = append(userIDQuery["$or"].([]bson.M), bson.M{"user_id": userIDObj})
		}

		log.Printf("[GetMyInvoicesMongo] userIDVal=%v, hasInt=%v, hasObj=%v, query=%v", userIDVal, hasInt, hasObj, userIDQuery)

		type MyInvoiceView struct {
			InvoiceID          interface{} `json:"invoice_id"`
			MasterInvoiceID    interface{} `json:"master_invoice_id"` // For detail fetch (REQUIRED)
			InvoiceType        string      `json:"invoice_type"`
			ProductID          interface{} `json:"product_id"`
			ProductName        *string     `json:"product_name"`
			Status             string      `json:"status"`
			CreatedAt          *string     `json:"created_at"`
			InsuranceStart     *string     `json:"insurance_start"`
			InsuranceEnd       *string     `json:"insurance_end"`
			InsuranceAmount    *float64    `json:"insurance_amount"`
			DepartureDate      *string     `json:"departure_date"`
			ReturnDate         *string     `json:"return_date"`
			UpdatedAt          *string     `json:"updated_at"`
			CreatedAtTimestamp int64       `json:"-"` // For sorting only, not sent to client
		}

		// Helper function to format time to YYYY-MM-DD
		formatDate := func(t time.Time) *string {
			if t.IsZero() {
				return nil
			}
			formatted := t.Format("2006-01-02")
			return &formatted
		}

		// Helper function to find product by ID (supports int, float64, string, ObjectID)
		findProductName := func(prodID interface{}) *string {
			if prodID == nil {
				log.Printf("[findProductName] prodID is nil")
				return nil
			}
			log.Printf("[findProductName] Looking for prodID: %v (type: %T)", prodID, prodID)
			var productBson bson.M

			// Try direct match first
			if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					log.Printf("[findProductName] Found product name via direct match: %s", pn)
					return &pn
				}
			}

			// Try converting to int32 (MongoDB often stores as int32)
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
				log.Printf("[findProductName] Could not convert prodID to int32")
				return nil
			}

			if err := productCollection.FindOne(ctx, bson.M{"_id": intID}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					log.Printf("[findProductName] Found product name via int32 conversion: %s", pn)
					return &pn
				}
			}

			// Try as int (Go default)
			if err := productCollection.FindOne(ctx, bson.M{"_id": int(intID)}).Decode(&productBson); err == nil {
				if pn, ok := productBson["name"].(string); ok && pn != "" {
					log.Printf("[findProductName] Found product name via int conversion: %s", pn)
					return &pn
				}
			}

			log.Printf("[findProductName] No product found for prodID: %v", prodID)
			return nil
		}

		var result []MyInvoiceView

		// 1. Lấy hóa đơn chung (invoices)
		opts := options.Find().SetSort(bson.M{"created_at": -1})
		cursor, err := invoiceCollection.Find(ctx, userIDQuery, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if err := cursor.All(ctx, &invoices); err == nil {
				for _, inv := range invoices {
					prodID := inv["product_id"]
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					} else if ua, ok := inv["updated_at"].(time.Time); ok {
						updatedAt = ua
					}
					var insStart, insEnd *string
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDate(is.Time())
					} else if is, ok := inv["insurance_start"].(time.Time); ok && !is.IsZero() {
						insStart = formatDate(is)
					}
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDate(ie.Time())
					} else if ie, ok := inv["insurance_end"].(time.Time); ok && !ie.IsZero() {
						insEnd = formatDate(ie)
					}
					var insAmount *float64
					if ia, ok := inv["insurance_amount"].(float64); ok {
						insAmount = &ia
					}
					productName := findProductName(prodID)
					// Convert master_invoice_id to hex string for frontend
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
						log.Printf("[GetMyInvoicesMongo] Invoice %v has master_invoice_id: %s", inv["_id"], masterID)
					} else {
						masterID = inv["master_invoice_id"]
						log.Printf("[GetMyInvoicesMongo] Invoice %v master_invoice_id (raw): %v", inv["_id"], masterID)
					}
					result = append(result, MyInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Chung",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    insAmount,
						UpdatedAt:          formatDate(updatedAt),
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// 2. Lấy hóa đơn du lịch
		cursor, err = travelCollection.Find(ctx, userIDQuery, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var travelInvoices []bson.M
			if err := cursor.All(ctx, &travelInvoices); err == nil {
				log.Printf("[GetMyInvoicesMongo] Found %d travel invoices", len(travelInvoices))
				for _, inv := range travelInvoices {
					// Extract product_id with logging
					var prodID interface{}
					rawProdID := inv["product_id"]
					log.Printf("[GetMyInvoicesMongo] Travel invoice product_id raw: %v (type: %T)", rawProdID, rawProdID)

					if pid, ok := inv["product_id"].(primitive.ObjectID); ok {
						prodID = pid
					} else if pidPtr, ok := inv["product_id"].(*primitive.ObjectID); ok && pidPtr != nil {
						prodID = *pidPtr
					} else if pid, ok := inv["product_id"].(int32); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(float64); ok {
						prodID = int(pid)
					} else if pidStr, ok := inv["product_id"].(string); ok {
						if pidInt, err := strconv.Atoi(pidStr); err == nil {
							prodID = pidInt
						}
					}
					log.Printf("[GetMyInvoicesMongo] Travel invoice product_id extracted: %v (type: %T)", prodID, prodID)

					productName := findProductName(prodID)

					// Extract status
					status, _ := inv["status"].(string)

					// Extract created_at
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}

					// Extract departure_date
					var departureDate time.Time
					if dd, ok := inv["departure_date"].(primitive.DateTime); ok {
						departureDate = dd.Time()
					} else if dd, ok := inv["departure_date"].(time.Time); ok {
						departureDate = dd
					}

					// Extract return_date
					var returnDate time.Time
					if rd, ok := inv["return_date"].(primitive.DateTime); ok {
						returnDate = rd.Time()
					} else if rd, ok := inv["return_date"].(time.Time); ok {
						returnDate = rd
					}

					// Extract total_amount
					var insAmount *float64
					if amt, ok := inv["total_amount"].(float64); ok {
						insAmount = &amt
					}

					// Extract updated_at
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					} else if ua, ok := inv["updated_at"].(time.Time); ok {
						updatedAt = ua
					}

					// Convert master_invoice_id to hex string
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else if midPtr, ok := inv["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
						masterID = midPtr.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					result = append(result, MyInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Du lịch",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						InsuranceStart:     formatDate(departureDate),
						InsuranceEnd:       formatDate(returnDate),
						InsuranceAmount:    insAmount,
						DepartureDate:      formatDate(departureDate),
						ReturnDate:         formatDate(returnDate),
						UpdatedAt:          formatDate(updatedAt),
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			} else {
				log.Printf("[GetMyInvoicesMongo] Error decoding travel invoices: %v", err)
			}
		} else {
			log.Printf("[GetMyInvoicesMongo] Error finding travel invoices: %v", err)
		}

		// 3. Lấy hóa đơn nhà
		cursor, err = homeCollection.Find(ctx, userIDQuery, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var homeInvoices []bson.M
			if err := cursor.All(ctx, &homeInvoices); err == nil {
				for _, inv := range homeInvoices {
					// Extract product_id
					var prodID interface{}
					if pid, ok := inv["product_id"].(primitive.ObjectID); ok && !pid.IsZero() {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int32); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(float64); ok {
						prodID = int(pid)
					}

					// Fetch product name using findProductName
					productName := findProductName(prodID)

					// Extract created_at
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}

					// Extract insurance_start
					var insStart *string
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDate(is.Time())
					} else if is, ok := inv["insurance_start"].(time.Time); ok && !is.IsZero() {
						insStart = formatDate(is)
					} else if is, ok := inv["insurance_start"].(string); ok && is != "" {
						// Parse ISO format strings
						if t, err := time.Parse(time.RFC3339, is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", is); err == nil {
							insStart = formatDate(t)
						}
					}

					// Extract insurance_end
					var insEnd *string
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDate(ie.Time())
					} else if ie, ok := inv["insurance_end"].(time.Time); ok && !ie.IsZero() {
						insEnd = formatDate(ie)
					} else if ie, ok := inv["insurance_end"].(string); ok && ie != "" {
						// Parse ISO format strings
						if t, err := time.Parse(time.RFC3339, ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", ie); err == nil {
							insEnd = formatDate(t)
						}
					}

					// Calculate total_amount
					homeInsAmt := 0.0
					if amt, ok := inv["home_insurance_amount"].(float64); ok {
						homeInsAmt = amt
					}
					assetInsAmt := 0.0
					if amt, ok := inv["asset_insurance_amount"].(float64); ok {
						assetInsAmt = amt
					}
					totalAmount := homeInsAmt + assetInsAmt
					if amt, ok := inv["total_amount"].(float64); ok && amt > 0 {
						totalAmount = amt
					}

					// Extract status
					status, _ := inv["status"].(string)

					// Extract updated_at
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					} else if ua, ok := inv["updated_at"].(time.Time); ok {
						updatedAt = ua
					}

					// Convert master_invoice_id to hex string
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else if midPtr, ok := inv["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
						masterID = midPtr.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					result = append(result, MyInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Nhà",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    &totalAmount,
						UpdatedAt:          formatDate(updatedAt),
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// 4. Lấy hóa đơn tai nạn
		cursor, err = accidentCollection.Find(ctx, userIDQuery, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var accidentInvoices []bson.M
			if err := cursor.All(ctx, &accidentInvoices); err == nil {
				for _, inv := range accidentInvoices {
					// Try both "product_id" (lowercase) and "ProductID" (from frontend)
					prodID := inv["product_id"]
					if prodID == nil {
						prodID = inv["ProductID"]
					}
					status, _ := inv["status"].(string)
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}
					updatedAt := time.Time{}
					if ua, ok := inv["updated_at"].(primitive.DateTime); ok {
						updatedAt = ua.Time()
					} else if ua, ok := inv["updated_at"].(time.Time); ok {
						updatedAt = ua
					}
					var insStart, insEnd *string
					// Try lowercase first, then uppercase (from frontend)
					if is, ok := inv["insurance_start"].(primitive.DateTime); ok {
						insStart = formatDate(is.Time())
					} else if is, ok := inv["insurance_start"].(time.Time); ok && !is.IsZero() {
						insStart = formatDate(is)
					} else if is, ok := inv["InsuranceStart"].(primitive.DateTime); ok {
						insStart = formatDate(is.Time())
					} else if is, ok := inv["InsuranceStart"].(time.Time); ok && !is.IsZero() {
						insStart = formatDate(is)
					} else if is, ok := inv["InsuranceStart"].(string); ok && is != "" {
						// Support multiple ISO formats
						if t, err := time.Parse(time.RFC3339, is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", is); err == nil {
							insStart = formatDate(t)
						}
					} else if is, ok := inv["insurance_start"].(string); ok && is != "" {
						// Also try lowercase insurance_start as string
						if t, err := time.Parse(time.RFC3339, is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", is); err == nil {
							insStart = formatDate(t)
						}
					}
					if ie, ok := inv["insurance_end"].(primitive.DateTime); ok {
						insEnd = formatDate(ie.Time())
					} else if ie, ok := inv["insurance_end"].(time.Time); ok && !ie.IsZero() {
						insEnd = formatDate(ie)
					} else if ie, ok := inv["InsuranceEnd"].(primitive.DateTime); ok {
						insEnd = formatDate(ie.Time())
					} else if ie, ok := inv["InsuranceEnd"].(time.Time); ok && !ie.IsZero() {
						insEnd = formatDate(ie)
					} else if ie, ok := inv["InsuranceEnd"].(string); ok && ie != "" {
						// Support multiple ISO formats
						if t, err := time.Parse(time.RFC3339, ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", ie); err == nil {
							insEnd = formatDate(t)
						}
					} else if ie, ok := inv["insurance_end"].(string); ok && ie != "" {
						// Also try lowercase insurance_end as string
						if t, err := time.Parse(time.RFC3339, ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", ie); err == nil {
							insEnd = formatDate(t)
						}
					}
					var insAmount *float64
					if ia, ok := inv["insurance_amount"].(float64); ok {
						insAmount = &ia
					} else if ia, ok := inv["InsuranceAmount"].(float64); ok {
						insAmount = &ia
					}
					productName := findProductName(prodID)
					// Convert master_invoice_id to hex string for frontend
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
						log.Printf("[GetMyInvoicesMongo] Accident invoice %v has master_invoice_id: %s", inv["_id"], masterID)
					} else {
						masterID = inv["master_invoice_id"]
						log.Printf("[GetMyInvoicesMongo] Accident invoice %v master_invoice_id (raw): %v", inv["_id"], masterID)
					}
					result = append(result, MyInvoiceView{
						InvoiceID:          inv["_id"],
						MasterInvoiceID:    masterID,
						InvoiceType:        "Tai nạn",
						ProductID:          prodID,
						ProductName:        productName,
						Status:             status,
						CreatedAt:          formatDate(createdAt),
						InsuranceStart:     insStart,
						InsuranceEnd:       insEnd,
						InsuranceAmount:    insAmount,
						UpdatedAt:          formatDate(updatedAt),
						CreatedAtTimestamp: createdAt.Unix(),
					})
				}
			}
		}

		// Sort by created_at in descending order (newest first)
		// Sort by created_at in descending order (newest first)
		sort.Slice(result, func(i, j int) bool {
			return result[i].CreatedAtTimestamp > result[j].CreatedAtTimestamp
		})

		log.Printf("[GetMyInvoicesMongo] Total invoices after sort: %d", len(result))

		c.JSON(200, result)
	}
}

// GetInvoiceDetailUserMongo - Lấy chi tiết hóa đơn dựa trên master_invoice_id hoặc invoice_id (fallback)
// Accepts both master_invoice_id (preferred) or child invoice_id (for backward compatibility)
func GetInvoiceDetailUserMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		log.Printf("[GetInvoiceDetailUserMongo] Received ID: %s", idStr)
		searchID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			log.Printf("[GetInvoiceDetailUserMongo] Invalid ObjectID format: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invoice ID không hợp lệ!"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		var userObjID *primitive.ObjectID
		if obj, err := primitive.ObjectIDFromHex(userIDStr.(string)); err == nil {
			userObjID = &obj
		}

		invoiceCollection := db.Collection("invoices")
		travelCollection := db.Collection("travel_insurance_invoices")
		homeCollection := db.Collection("home_insurance_invoices")
		accidentCollection := db.Collection("accident_invoices")
		productCollection := db.Collection("products")
		customerCollection := db.Collection("customer_registration")
		participantCollection := db.Collection("participants")
		travelParticipantCollection := db.Collection("travel_participants")
		insuranceParticipantCollection := db.Collection("insurance_participant_info")

		type InvoiceDetail struct {
			InvoiceID       primitive.ObjectID  `json:"invoice_id"`
			MasterInvoiceID *primitive.ObjectID `json:"master_invoice_id,omitempty"`
			InvoiceType     string              `json:"invoice_type"`
			ProductName     string              `json:"product_name"`
			Status          string              `json:"status"`
			CreatedAt       time.Time           `json:"created_at"`
			InsuranceStart  *time.Time          `json:"insurance_start"`
			InsuranceEnd    *time.Time          `json:"insurance_end"`
			InsuranceAmount *float64            `json:"insurance_amount"`
			Customer        interface{}         `json:"customer"`
			Participants    interface{}         `json:"participants"`
		}

		var detail InvoiceDetail
		var found bool

		// Strategy 1: Try to query using searchID as master_invoice_id
		// Strategy 2: If not found, try searchID as direct invoice _id (backward compatibility)

		// Try finding invoice in 3 collections by master_invoice_id OR direct _id
		// Use bson.M to handle flexible types (int vs ObjectID for user_id)
		var invoiceDoc bson.M
		err = invoiceCollection.FindOne(ctx, bson.M{
			"$or": []bson.M{
				{"master_invoice_id": searchID},
				{"_id": searchID},
			},
		}).Decode(&invoiceDoc)

		log.Printf("[GetInvoiceDetailUserMongo] Query invoices collection result: found=%v, err=%v", err == nil, err)

		if err == nil {
			log.Printf("[GetInvoiceDetailUserMongo] Found invoice doc: %v", invoiceDoc)

			// Check authorization - handle both int and ObjectID user_id
			authorized := true
			if userObjID != nil {
				if uid, ok := invoiceDoc["user_id"].(primitive.ObjectID); ok {
					authorized = (uid == *userObjID)
				} else if uid, ok := invoiceDoc["user_id"].(int32); ok {
					// Old data with int user_id - skip check for now or convert
					log.Printf("[GetInvoiceDetailUserMongo] Invoice has int user_id: %d", uid)
				} else if uid, ok := invoiceDoc["user_id"].(int); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Invoice has int user_id: %d", uid)
				}
			}

			if !authorized {
				c.JSON(http.StatusForbidden, gin.H{"error": "Bạn không có quyền xem hóa đơn này"})
				return
			}

			found = true

			// Extract fields from bson.M
			if id, ok := invoiceDoc["_id"].(primitive.ObjectID); ok {
				detail.InvoiceID = id
			}
			if mid, ok := invoiceDoc["master_invoice_id"].(primitive.ObjectID); ok {
				detail.MasterInvoiceID = &mid
			}

			detail.InvoiceType = "Chung"
			if status, ok := invoiceDoc["status"].(string); ok {
				detail.Status = status
			}
			if createdAt, ok := invoiceDoc["created_at"].(primitive.DateTime); ok {
				t := createdAt.Time()
				detail.CreatedAt = t
			} else if createdAt, ok := invoiceDoc["created_at"].(time.Time); ok {
				detail.CreatedAt = createdAt
			}

			if insStart, ok := invoiceDoc["insurance_start"].(primitive.DateTime); ok {
				t := insStart.Time()
				detail.InsuranceStart = &t
			} else if insStart, ok := invoiceDoc["insurance_start"].(time.Time); ok {
				detail.InsuranceStart = &insStart
			}

			if insEnd, ok := invoiceDoc["insurance_end"].(primitive.DateTime); ok {
				t := insEnd.Time()
				detail.InsuranceEnd = &t
			} else if insEnd, ok := invoiceDoc["insurance_end"].(time.Time); ok {
				detail.InsuranceEnd = &insEnd
			}

			if amount, ok := invoiceDoc["insurance_amount"].(float64); ok {
				detail.InsuranceAmount = &amount
			}

			// Get product name
			if prodID, ok := invoiceDoc["product_id"].(float64); ok {
				var productDoc bson.M
				if err := productCollection.FindOne(ctx, bson.M{"_id": int(prodID)}).Decode(&productDoc); err == nil {
					if name, ok := productDoc["name"].(string); ok {
						detail.ProductName = name
						log.Printf("[GetInvoiceDetailUserMongo] Found product name from float64 id %v: %s", prodID, name)
					}
				} else {
					log.Printf("[GetInvoiceDetailUserMongo] Product not found for float64 id: %v, err: %v", prodID, err)
				}
			} else if prodID, ok := invoiceDoc["product_id"].(int32); ok {
				var productDoc bson.M
				if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
					if name, ok := productDoc["name"].(string); ok {
						detail.ProductName = name
						log.Printf("[GetInvoiceDetailUserMongo] Found product name from int32 id %d: %s", prodID, name)
					}
				} else {
					log.Printf("[GetInvoiceDetailUserMongo] Product not found for int32 id: %d, err: %v", prodID, err)
				}
			} else if prodID, ok := invoiceDoc["product_id"].(int); ok {
				var productDoc bson.M
				if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
					if name, ok := productDoc["name"].(string); ok {
						detail.ProductName = name
						log.Printf("[GetInvoiceDetailUserMongo] Found product name from int id %d: %s", prodID, name)
					}
				} else {
					log.Printf("[GetInvoiceDetailUserMongo] Product not found for int id: %d, err: %v", prodID, err)
				}
			} else if prodID, ok := invoiceDoc["product_id"].(primitive.ObjectID); ok && !prodID.IsZero() {
				var productDoc bson.M
				if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
					if name, ok := productDoc["name"].(string); ok {
						detail.ProductName = name
						log.Printf("[GetInvoiceDetailUserMongo] Found product name from ObjectID: %s", name)
					}
				}
			} else {
				log.Printf("[GetInvoiceDetailUserMongo] product_id type not recognized: %T, value: %v", invoiceDoc["product_id"], invoiceDoc["product_id"])
			}

			// Get customer info
			if custID, ok := invoiceDoc["customer_id"].(primitive.ObjectID); ok && !custID.IsZero() {
				var customer models.CustomerRegistration
				if err := customerCollection.FindOne(ctx, bson.M{"_id": custID}).Decode(&customer); err == nil {
					detail.Customer = gin.H{
						"customer_id": customer.ID.Hex(),
						"full_name":   customer.FullName,
						"email":       customer.Email,
						"phone":       customer.PhoneNumber,
					}
				}
			}

			// Get participants - try all 3 collections
			if invID, ok := invoiceDoc["_id"].(primitive.ObjectID); ok {
				// Try insurance_participant_info first (for cancer insurance, personal accident, etc.)
				participantCursor, err := insuranceParticipantCollection.Find(ctx, bson.M{"invoice_id": invID})
				if err == nil {
					var participants []bson.M
					if err := participantCursor.All(ctx, &participants); err == nil && len(participants) > 0 {
						detail.Participants = participants
						log.Printf("[GetInvoiceDetailUserMongo] Found participants in insurance_participant_info")
						participantCursor.Close(ctx)
						goto skipParticipants
					}
					participantCursor.Close(ctx)
				}

				// Try regular participants collection (for generic invoices)
				participantCursor, err = participantCollection.Find(ctx, bson.M{"invoice_id": invID})
				if err == nil {
					var participants []models.Participant
					if err := participantCursor.All(ctx, &participants); err == nil {
						detail.Participants = participants
						log.Printf("[GetInvoiceDetailUserMongo] Found participants in participants collection")
					}
					participantCursor.Close(ctx)
				}
			}
		skipParticipants:
		}

		// Try travel invoices if not found
		if !found {
			var travelDoc bson.M
			err = travelCollection.FindOne(ctx, bson.M{
				"$or": []bson.M{
					{"master_invoice_id": searchID},
					{"_id": searchID},
				},
			}).Decode(&travelDoc)

			log.Printf("[GetInvoiceDetailUserMongo] Query travel_insurance_invoices result: found=%v, err=%v", err == nil, err)

			if err == nil {
				log.Printf("[GetInvoiceDetailUserMongo] Found travel invoice: _id=%v, master_invoice_id=%v", travelDoc["_id"], travelDoc["master_invoice_id"])

				// Extract and validate user_id for authorization
				var travelUserID *primitive.ObjectID
				if uid, ok := travelDoc["user_id"].(int32); ok {
					// Old data with int user_id
					log.Printf("[GetInvoiceDetailUserMongo] Travel invoice has int user_id: %d", uid)
					if userObjID != nil {
						// Can't compare int with ObjectID - skip auth check for old data
						log.Printf("[GetInvoiceDetailUserMongo] Warning: Cannot verify authorization for old int user_id")
					}
				} else if uid, ok := travelDoc["user_id"].(int); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Travel invoice has int user_id: %d", uid)
				} else if uid, ok := travelDoc["user_id"].(primitive.ObjectID); ok {
					travelUserID = &uid
				} else if uidPtr, ok := travelDoc["user_id"].(*primitive.ObjectID); ok && uidPtr != nil {
					travelUserID = uidPtr
				}

				// Check authorization for ObjectID user_ids
				if userObjID != nil && travelUserID != nil {
					if *travelUserID != *userObjID {
						c.JSON(http.StatusForbidden, gin.H{"error": "Bạn không có quyền xem hóa đơn này"})
						return
					}
				}

				found = true

				// Extract _id
				if id, ok := travelDoc["_id"].(primitive.ObjectID); ok {
					detail.InvoiceID = id
				}

				// Extract master_invoice_id
				if mid, ok := travelDoc["master_invoice_id"].(primitive.ObjectID); ok {
					detail.MasterInvoiceID = &mid
				} else if midPtr, ok := travelDoc["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
					detail.MasterInvoiceID = midPtr
				}

				detail.InvoiceType = "Du lịch"

				// Extract status
				if status, ok := travelDoc["status"].(string); ok {
					detail.Status = status
				}

				// Extract created_at
				if ca, ok := travelDoc["created_at"].(primitive.DateTime); ok {
					t := ca.Time()
					detail.CreatedAt = t
				} else if ca, ok := travelDoc["created_at"].(time.Time); ok {
					detail.CreatedAt = ca
				}

				// Extract departure_date
				if dd, ok := travelDoc["departure_date"].(primitive.DateTime); ok {
					t := dd.Time()
					detail.InsuranceStart = &t
				} else if dd, ok := travelDoc["departure_date"].(time.Time); ok {
					detail.InsuranceStart = &dd
				}

				// Extract return_date
				if rd, ok := travelDoc["return_date"].(primitive.DateTime); ok {
					t := rd.Time()
					detail.InsuranceEnd = &t
				} else if rd, ok := travelDoc["return_date"].(time.Time); ok {
					detail.InsuranceEnd = &rd
				}

				// Extract total_amount
				if amt, ok := travelDoc["total_amount"].(float64); ok {
					detail.InsuranceAmount = &amt
				}

				// Extract product_id and fetch product
				if prodID, ok := travelDoc["product_id"].(float64); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": int(prodID)}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found travel product name from float64 id %v: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Travel product not found for float64 id: %v, err: %v", prodID, err)
					}
				} else if prodID, ok := travelDoc["product_id"].(int32); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found travel product name from int32 id %d: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Travel product not found for int32 id: %d, err: %v", prodID, err)
					}
				} else if prodID, ok := travelDoc["product_id"].(int); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found travel product name from int id %d: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Travel product not found for int id: %d, err: %v", prodID, err)
					}
				} else if prodID, ok := travelDoc["product_id"].(primitive.ObjectID); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found travel product name from ObjectID: %s", name)
						}
					}
				} else if prodIDPtr, ok := travelDoc["product_id"].(*primitive.ObjectID); ok && prodIDPtr != nil {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": *prodIDPtr}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found travel product name from ptr: %s", name)
						}
					}
				}

				// Extract customer_id and fetch customer
				if custID, ok := travelDoc["customer_id"].(primitive.ObjectID); ok {
					var customer models.CustomerRegistration
					if err := customerCollection.FindOne(ctx, bson.M{"_id": custID}).Decode(&customer); err == nil {
						detail.Customer = gin.H{
							"customer_id": customer.ID.Hex(),
							"full_name":   customer.FullName,
							"email":       customer.Email,
							"phone":       customer.PhoneNumber,
						}
					}
				} else if custIDPtr, ok := travelDoc["customer_id"].(*primitive.ObjectID); ok && custIDPtr != nil {
					var customer models.CustomerRegistration
					if err := customerCollection.FindOne(ctx, bson.M{"_id": *custIDPtr}).Decode(&customer); err == nil {
						detail.Customer = gin.H{
							"customer_id": customer.ID.Hex(),
							"full_name":   customer.FullName,
							"email":       customer.Email,
							"phone":       customer.PhoneNumber,
						}
					}
				} else if custID, ok := travelDoc["customer_id"].(int32); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Travel invoice has int customer_id: %d", custID)
				} else if custID, ok := travelDoc["customer_id"].(int); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Travel invoice has int customer_id: %d", custID)
				}

				// Fetch participants
				if invoiceID, ok := travelDoc["_id"].(primitive.ObjectID); ok {
					participantCursor, err := travelParticipantCollection.Find(ctx, bson.M{"invoice_id": invoiceID})
					if err == nil {
						var participants []models.TravelParticipant
						if err := participantCursor.All(ctx, &participants); err == nil {
							detail.Participants = participants
						}
						participantCursor.Close(ctx)
					}
				}
			}
		}

		// Try home invoices if not found
		if !found {
			var homeDoc bson.M
			err = homeCollection.FindOne(ctx, bson.M{
				"$or": []bson.M{
					{"master_invoice_id": searchID},
					{"_id": searchID},
				},
			}).Decode(&homeDoc)

			log.Printf("[GetInvoiceDetailUserMongo] Query home_insurance_invoices result: found=%v, err=%v", err == nil, err)

			if err == nil {
				log.Printf("[GetInvoiceDetailUserMongo] Found home invoice: _id=%v, master_invoice_id=%v", homeDoc["_id"], homeDoc["master_invoice_id"])

				// Extract and validate user_id for authorization
				var homeUserID *primitive.ObjectID
				if uid, ok := homeDoc["user_id"].(int32); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Home invoice has int user_id: %d", uid)
				} else if uid, ok := homeDoc["user_id"].(int); ok {
					log.Printf("[GetInvoiceDetailUserMongo] Home invoice has int user_id: %d", uid)
				} else if uid, ok := homeDoc["user_id"].(primitive.ObjectID); ok {
					homeUserID = &uid
				} else if uidPtr, ok := homeDoc["user_id"].(*primitive.ObjectID); ok && uidPtr != nil {
					homeUserID = uidPtr
				}

				// Check authorization for ObjectID user_ids
				if userObjID != nil && homeUserID != nil {
					if *homeUserID != *userObjID {
						c.JSON(http.StatusForbidden, gin.H{"error": "Bạn không có quyền xem hóa đơn này"})
						return
					}
				}

				found = true

				// Extract _id
				if id, ok := homeDoc["_id"].(primitive.ObjectID); ok {
					detail.InvoiceID = id
				}

				// Extract master_invoice_id
				if mid, ok := homeDoc["master_invoice_id"].(primitive.ObjectID); ok {
					detail.MasterInvoiceID = &mid
				} else if midPtr, ok := homeDoc["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
					detail.MasterInvoiceID = midPtr
				}

				detail.InvoiceType = "Nhà"

				// Extract status
				if status, ok := homeDoc["status"].(string); ok {
					detail.Status = status
				}

				// Extract created_at
				if ca, ok := homeDoc["created_at"].(primitive.DateTime); ok {
					t := ca.Time()
					detail.CreatedAt = t
				} else if ca, ok := homeDoc["created_at"].(time.Time); ok {
					detail.CreatedAt = ca
				}

				// Extract insurance_start
				if is, ok := homeDoc["insurance_start"].(primitive.DateTime); ok {
					t := is.Time()
					detail.InsuranceStart = &t
				} else if is, ok := homeDoc["insurance_start"].(time.Time); ok {
					detail.InsuranceStart = &is
				}

				// Extract insurance_end
				if ie, ok := homeDoc["insurance_end"].(primitive.DateTime); ok {
					t := ie.Time()
					detail.InsuranceEnd = &t
				} else if ie, ok := homeDoc["insurance_end"].(time.Time); ok {
					detail.InsuranceEnd = &ie
				}

				// Calculate total_amount
				homeInsAmt := 0.0
				if amt, ok := homeDoc["home_insurance_amount"].(float64); ok {
					homeInsAmt = amt
				}
				assetInsAmt := 0.0
				if amt, ok := homeDoc["asset_insurance_amount"].(float64); ok {
					assetInsAmt = amt
				}
				totalAmount := homeInsAmt + assetInsAmt
				if amt, ok := homeDoc["total_amount"].(float64); ok && amt > 0 {
					totalAmount = amt
				}
				detail.InsuranceAmount = &totalAmount

				// Extract product_id and fetch product
				if prodID, ok := homeDoc["product_id"].(float64); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": int(prodID)}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found home product name from float64 id %v: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Home product not found for float64 id: %v, err: %v", prodID, err)
					}
				} else if prodID, ok := homeDoc["product_id"].(int32); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found home product name from int32 id %d: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Home product not found for int32 id: %d, err: %v", prodID, err)
					}
				} else if prodID, ok := homeDoc["product_id"].(int); ok {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found home product name from int id %d: %s", prodID, name)
						}
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] Home product not found for int id: %d, err: %v", prodID, err)
					}
				} else if prodID, ok := homeDoc["product_id"].(primitive.ObjectID); ok && !prodID.IsZero() {
					var productDoc bson.M
					if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc); err == nil {
						if name, ok := productDoc["name"].(string); ok {
							detail.ProductName = name
							log.Printf("[GetInvoiceDetailUserMongo] Found home product name from ObjectID: %s", name)
						}
					}
				}
			}
		}

		// Try accident_invoices collection
		if !found {
			var accidentDoc bson.M
			err = accidentCollection.FindOne(ctx, bson.M{
				"$or": []bson.M{
					{"master_invoice_id": searchID},
					{"_id": searchID},
				},
			}).Decode(&accidentDoc)

			log.Printf("[GetInvoiceDetailUserMongo] Query accident_invoices collection result: found=%v, err=%v", err == nil, err)

			if err == nil {
				log.Printf("[GetInvoiceDetailUserMongo] Found accident invoice: _id=%v, master_invoice_id=%v", accidentDoc["_id"], accidentDoc["master_invoice_id"])

				// User validation
				docUserID := accidentDoc["user_id"]
				userIDVal := userIDStr.(string)
				var authorized bool

				switch uid := docUserID.(type) {
				case string:
					authorized = (uid == userIDVal)
				case int:
					if intVal, err := strconv.Atoi(userIDVal); err == nil {
						authorized = (uid == intVal)
					}
				case int32:
					if intVal, err := strconv.Atoi(userIDVal); err == nil {
						authorized = (int32(intVal) == uid)
					}
				case int64:
					if intVal, err := strconv.Atoi(userIDVal); err == nil {
						authorized = (int64(intVal) == uid)
					}
				case primitive.ObjectID:
					if userObjID != nil {
						authorized = (uid == *userObjID)
					}
				}

				if !authorized {
					c.JSON(http.StatusForbidden, gin.H{"error": "Bạn không có quyền xem hóa đơn này"})
					return
				}

				found = true
				invoiceObjID := accidentDoc["_id"].(primitive.ObjectID)
				detail.InvoiceID = invoiceObjID
				detail.InvoiceType = "Tai nạn"

				// Master invoice ID
				if mid, ok := accidentDoc["master_invoice_id"].(primitive.ObjectID); ok {
					detail.MasterInvoiceID = &mid
				}

				// Status
				if status, ok := accidentDoc["status"].(string); ok {
					detail.Status = status
				}

				// Created at
				if ca, ok := accidentDoc["created_at"].(primitive.DateTime); ok {
					detail.CreatedAt = ca.Time()
				} else if ca, ok := accidentDoc["created_at"].(time.Time); ok {
					detail.CreatedAt = ca
				}

				// Insurance dates - try lowercase and uppercase keys, including string parsing
				if is, ok := accidentDoc["insurance_start"].(primitive.DateTime); ok {
					t := is.Time()
					detail.InsuranceStart = &t
				} else if is, ok := accidentDoc["insurance_start"].(time.Time); ok {
					detail.InsuranceStart = &is
				} else if is, ok := accidentDoc["InsuranceStart"].(primitive.DateTime); ok {
					t := is.Time()
					detail.InsuranceStart = &t
				} else if is, ok := accidentDoc["InsuranceStart"].(time.Time); ok {
					detail.InsuranceStart = &is
				} else if is, ok := accidentDoc["insurance_start"].(string); ok && is != "" {
					if t, err := time.Parse(time.RFC3339, is); err == nil {
						detail.InsuranceStart = &t
					} else if t, err := time.Parse("2006-01-02T15:04:05Z", is); err == nil {
						detail.InsuranceStart = &t
					} else if t, err := time.Parse("2006-01-02", is); err == nil {
						detail.InsuranceStart = &t
					}
				} else if is, ok := accidentDoc["InsuranceStart"].(string); ok && is != "" {
					if t, err := time.Parse(time.RFC3339, is); err == nil {
						detail.InsuranceStart = &t
					} else if t, err := time.Parse("2006-01-02T15:04:05Z", is); err == nil {
						detail.InsuranceStart = &t
					} else if t, err := time.Parse("2006-01-02", is); err == nil {
						detail.InsuranceStart = &t
					}
				}

				if ie, ok := accidentDoc["insurance_end"].(primitive.DateTime); ok {
					t := ie.Time()
					detail.InsuranceEnd = &t
				} else if ie, ok := accidentDoc["insurance_end"].(time.Time); ok {
					detail.InsuranceEnd = &ie
				} else if ie, ok := accidentDoc["InsuranceEnd"].(primitive.DateTime); ok {
					t := ie.Time()
					detail.InsuranceEnd = &t
				} else if ie, ok := accidentDoc["InsuranceEnd"].(time.Time); ok {
					detail.InsuranceEnd = &ie
				} else if ie, ok := accidentDoc["insurance_end"].(string); ok && ie != "" {
					if t, err := time.Parse(time.RFC3339, ie); err == nil {
						detail.InsuranceEnd = &t
					} else if t, err := time.Parse("2006-01-02T15:04:05Z", ie); err == nil {
						detail.InsuranceEnd = &t
					} else if t, err := time.Parse("2006-01-02", ie); err == nil {
						detail.InsuranceEnd = &t
					}
				} else if ie, ok := accidentDoc["InsuranceEnd"].(string); ok && ie != "" {
					if t, err := time.Parse(time.RFC3339, ie); err == nil {
						detail.InsuranceEnd = &t
					} else if t, err := time.Parse("2006-01-02T15:04:05Z", ie); err == nil {
						detail.InsuranceEnd = &t
					} else if t, err := time.Parse("2006-01-02", ie); err == nil {
						detail.InsuranceEnd = &t
					}
				}

				// Insurance amount - try lowercase and uppercase
				if amt, ok := accidentDoc["insurance_amount"].(float64); ok {
					detail.InsuranceAmount = &amt
				} else if amt, ok := accidentDoc["InsuranceAmount"].(float64); ok {
					detail.InsuranceAmount = &amt
				}

				// Product name - try both product_id and ProductID
				prodID := accidentDoc["product_id"]
				if prodID == nil {
					prodID = accidentDoc["ProductID"]
				}

				if prodID != nil {
					var productDoc bson.M
					// Try different ID types
					switch pid := prodID.(type) {
					case float64:
						if err := productCollection.FindOne(ctx, bson.M{"_id": int32(pid)}).Decode(&productDoc); err == nil {
							if name, ok := productDoc["name"].(string); ok {
								detail.ProductName = name
							}
						}
					case int32:
						if err := productCollection.FindOne(ctx, bson.M{"_id": pid}).Decode(&productDoc); err == nil {
							if name, ok := productDoc["name"].(string); ok {
								detail.ProductName = name
							}
						}
					case int:
						if err := productCollection.FindOne(ctx, bson.M{"_id": int32(pid)}).Decode(&productDoc); err == nil {
							if name, ok := productDoc["name"].(string); ok {
								detail.ProductName = name
							}
						}
					case primitive.ObjectID:
						if err := productCollection.FindOne(ctx, bson.M{"_id": pid}).Decode(&productDoc); err == nil {
							if name, ok := productDoc["name"].(string); ok {
								detail.ProductName = name
							}
						}
					}
				}

				// Parse string dates for InsuranceStart
				if detail.InsuranceStart == nil {
					if is, ok := accidentDoc["insurance_start"].(string); ok && is != "" {
						if t, err := time.Parse("2006-01-02", is); err == nil {
							detail.InsuranceStart = &t
						}
					} else if is, ok := accidentDoc["InsuranceStart"].(string); ok && is != "" {
						if t, err := time.Parse("2006-01-02", is); err == nil {
							detail.InsuranceStart = &t
						}
					}
				}

				// Parse string dates for InsuranceEnd
				if detail.InsuranceEnd == nil {
					if ie, ok := accidentDoc["insurance_end"].(string); ok && ie != "" {
						if t, err := time.Parse("2006-01-02", ie); err == nil {
							detail.InsuranceEnd = &t
						}
					} else if ie, ok := accidentDoc["InsuranceEnd"].(string); ok && ie != "" {
						if t, err := time.Parse("2006-01-02", ie); err == nil {
							detail.InsuranceEnd = &t
						}
					}
				}

				log.Printf("[GetInvoiceDetailUserMongo] Accident invoice dates: start=%v, end=%v, raw_start=%v, raw_end=%v",
					detail.InsuranceStart, detail.InsuranceEnd, accidentDoc["insurance_start"], accidentDoc["InsuranceStart"])

				// Fetch participants from insurance_participant_info - try both invoice_id and master_invoice_id
				log.Printf("[GetInvoiceDetailUserMongo] Searching participants with invoice_id: %v", invoiceObjID)
				participantCursor, err := insuranceParticipantCollection.Find(ctx, bson.M{"invoice_id": invoiceObjID})
				if err == nil {
					var participants []bson.M
					if err := participantCursor.All(ctx, &participants); err == nil && len(participants) > 0 {
						detail.Participants = participants
						log.Printf("[GetInvoiceDetailUserMongo] Found %d participants for accident invoice by invoice_id", len(participants))
					} else {
						log.Printf("[GetInvoiceDetailUserMongo] No participants found by invoice_id, trying master_invoice_id")
						// Try with master_invoice_id
						if detail.MasterInvoiceID != nil {
							participantCursor2, err := insuranceParticipantCollection.Find(ctx, bson.M{"invoice_id": *detail.MasterInvoiceID})
							if err == nil {
								var participants2 []bson.M
								if err := participantCursor2.All(ctx, &participants2); err == nil && len(participants2) > 0 {
									detail.Participants = participants2
									log.Printf("[GetInvoiceDetailUserMongo] Found %d participants by master_invoice_id", len(participants2))
								}
								participantCursor2.Close(ctx)
							}
						}
					}
					participantCursor.Close(ctx)
				}
			}
		}

		if !found {
			log.Printf("[GetInvoiceDetailUserMongo] Invoice not found in any collection with ID: %s", idStr)
			c.JSON(http.StatusNotFound, gin.H{"error": "Hóa đơn không tồn tại"})
			return
		}

		log.Printf("[GetInvoiceDetailUserMongo] Successfully retrieved invoice detail")
		c.JSON(http.StatusOK, detail)
	}
}

// DeleteCartInvoiceMongo - Xóa đơn hàng khỏi giỏ (legacy - dùng cho backup)
func DeleteCartInvoiceMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		invoiceIDStr := c.Param("invoice_id")
		var invoiceID interface{} = invoiceIDStr
		if intVal, err := strconv.Atoi(invoiceIDStr); err == nil {
			invoiceID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(invoiceIDStr); err == nil {
			invoiceID = objID
		}

		collections := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices"}
		var deleteErr error
		var deleted bool

		for _, collName := range collections {
			coll := db.Collection(collName)
			res, err := coll.DeleteOne(ctx, bson.M{"_id": invoiceID, "user_id": userID})
			if err != nil {
				deleteErr = err
				continue
			}
			if res.DeletedCount > 0 {
				deleted = true
				break
			}
		}

		if deleteErr != nil && !deleted {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi xóa hóa đơn!"})
			return
		}

		if !deleted {
			c.JSON(http.StatusNotFound, gin.H{"error": "Hóa đơn không tồn tại hoặc không thuộc về bạn!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa hóa đơn thành công!"})
	}
}
