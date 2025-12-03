package handlers

import (
	"backend/models"
	"context"
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

// GetCartMongo - Lấy giỏ hàng (hóa đơn chưa thanh toán)
func GetCartMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		userIDVal := userIDStr.(string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		type CartItem struct {
			InvoiceID       interface{} `json:"invoice_id"`
			MasterInvoiceID interface{} `json:"master_invoice_id"` // REQUIRED for delete
			InvoiceType     string      `json:"invoice_type"`
			ProductID       interface{} `json:"product_id"`
			ProductName     *string     `json:"product_name"`
			Status          string      `json:"status"`
			CreatedAt       *string     `json:"created_at"`
			InsuranceStart  *string     `json:"insurance_start"`
			InsuranceEnd    *string     `json:"insurance_end"`
			InsuranceAmount *float64    `json:"insurance_amount"`
			DepartureDate   *string     `json:"departure_date"`
			ReturnDate      *string     `json:"return_date"`
		}

		formatDate := func(t time.Time) *string {
			if t.IsZero() {
				return nil
			}
			formatted := t.Format("2006-01-02")
			return &formatted
		}

		var cartItems []CartItem
		productCollection := db.Collection("products")

		// 1. Lấy từ invoices (chưa thanh toán)
		invoiceCollection := db.Collection("invoices")
		opts := options.Find().SetSort(bson.M{"created_at": -1})
		cursor, err := invoiceCollection.Find(ctx, bson.M{"user_id": userID, "status": "Chưa thanh toán"}, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var invoices []bson.M
			if err := cursor.All(ctx, &invoices); err == nil {
				for _, inv := range invoices {
					prodID := inv["product_id"]
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
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
					var productName *string
					if prodID != nil {
						var productBson bson.M
						if err := productCollection.FindOne(ctx, bson.M{"_id": prodID}).Decode(&productBson); err == nil {
							if pn, ok := productBson["name"].(string); ok && pn != "" {
								productName = &pn
							}
						}
					}
					// Convert master_invoice_id to hex string
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}
					cartItems = append(cartItems, CartItem{
						InvoiceID:       inv["_id"],
						MasterInvoiceID: masterID,
						InvoiceType:     "Chung",
						ProductID:       prodID,
						ProductName:     productName,
						Status:          "Chưa thanh toán",
						CreatedAt:       formatDate(createdAt),
						InsuranceStart:  insStart,
						InsuranceEnd:    insEnd,
						InsuranceAmount: insAmount,
					})
				}
			}
		}

		// 2. Lấy từ travel_insurance_invoices (chưa thanh toán)
		travelCollection := db.Collection("travel_insurance_invoices")
		cursor, err = travelCollection.Find(ctx, bson.M{"user_id": userID, "status": "Chưa thanh toán"}, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var travelInvoices []bson.M
			if err := cursor.All(ctx, &travelInvoices); err == nil {
				for _, inv := range travelInvoices {
					// Extract product_id
					var prodID interface{}
					if pid, ok := inv["product_id"].(primitive.ObjectID); ok {
						prodID = pid
					} else if pidPtr, ok := inv["product_id"].(*primitive.ObjectID); ok && pidPtr != nil {
						prodID = *pidPtr
					} else if pid, ok := inv["product_id"].(int32); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int); ok {
						prodID = pid
					}

					// Fetch product name
					var productName *string
					if prodID != nil {
						if objID, ok := prodID.(primitive.ObjectID); ok {
							var product models.Product
							if err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&product); err == nil {
								productName = &product.Name
							}
						}
					}

					// Extract created_at
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}

					// Extract departure_date
					var departureDate *string
					if dd, ok := inv["departure_date"].(primitive.DateTime); ok {
						departureDate = formatDate(dd.Time())
					} else if dd, ok := inv["departure_date"].(time.Time); ok && !dd.IsZero() {
						departureDate = formatDate(dd)
					}

					// Extract return_date
					var returnDate *string
					if rd, ok := inv["return_date"].(primitive.DateTime); ok {
						returnDate = formatDate(rd.Time())
					} else if rd, ok := inv["return_date"].(time.Time); ok && !rd.IsZero() {
						returnDate = formatDate(rd)
					}

					// Extract total_amount
					var insAmount *float64
					if amt, ok := inv["total_amount"].(float64); ok {
						insAmount = &amt
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

					cartItems = append(cartItems, CartItem{
						InvoiceID:       inv["_id"],
						MasterInvoiceID: masterID,
						InvoiceType:     "Du lịch",
						ProductID:       prodID,
						ProductName:     productName,
						Status:          "Chưa thanh toán",
						CreatedAt:       formatDate(createdAt),
						DepartureDate:   departureDate,
						ReturnDate:      returnDate,
						InsuranceAmount: insAmount,
					})
				}
			}
		}

		// 3. Lấy từ home_insurance_invoices (chưa thanh toán)
		homeCollection := db.Collection("home_insurance_invoices")
		cursor, err = homeCollection.Find(ctx, bson.M{"user_id": userID, "status": "Chưa thanh toán"}, opts)
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

					// Fetch product name
					var productName *string
					if prodID != nil {
						if objID, ok := prodID.(primitive.ObjectID); ok {
							var product models.Product
							if err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&product); err == nil {
								productName = &product.Name
							}
						} else if intID, ok := prodID.(int); ok {
							var product models.Product
							if err := productCollection.FindOne(ctx, bson.M{"_id": intID}).Decode(&product); err == nil {
								productName = &product.Name
							}
						} else if int32ID, ok := prodID.(int32); ok {
							var product models.Product
							if err := productCollection.FindOne(ctx, bson.M{"_id": int32ID}).Decode(&product); err == nil {
								productName = &product.Name
							}
						}
					}

					// Extract created_at
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}

					// Extract insurance_start (handle multiple formats and types)
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

					// Extract insurance_end (handle multiple formats and types)
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

					// Convert master_invoice_id to hex string
					var masterID interface{}
					if mid, ok := inv["master_invoice_id"].(primitive.ObjectID); ok {
						masterID = mid.Hex()
					} else if midPtr, ok := inv["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
						masterID = midPtr.Hex()
					} else {
						masterID = inv["master_invoice_id"]
					}

					cartItems = append(cartItems, CartItem{
						InvoiceID:       inv["_id"],
						MasterInvoiceID: masterID,
						InvoiceType:     "Nhà",
						ProductID:       prodID,
						ProductName:     productName,
						Status:          "Chưa thanh toán",
						CreatedAt:       formatDate(createdAt),
						InsuranceStart:  insStart,
						InsuranceEnd:    insEnd,
						InsuranceAmount: &totalAmount,
					})
				}
			}
		}

		// 4. Lấy từ accident_invoices (chưa thanh toán)
		accidentCollection := db.Collection("accident_invoices")
		cursor, err = accidentCollection.Find(ctx, bson.M{"user_id": userID, "status": "Chưa thanh toán"}, opts)
		if err == nil {
			defer cursor.Close(ctx)
			var accidentInvoices []bson.M
			if err := cursor.All(ctx, &accidentInvoices); err == nil {
				for _, inv := range accidentInvoices {
					// Extract product_id (try both lowercase and uppercase, and different types)
					var prodID interface{}
					if pid, ok := inv["product_id"].(primitive.ObjectID); ok && !pid.IsZero() {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int32); ok {
						prodID = pid
					} else if pid, ok := inv["product_id"].(int); ok {
						prodID = pid
					} else if pid, ok := inv["ProductID"].(primitive.ObjectID); ok && !pid.IsZero() {
						prodID = pid
					} else if pid, ok := inv["ProductID"].(int32); ok {
						prodID = pid
					} else if pid, ok := inv["ProductID"].(int); ok {
						prodID = pid
					}

					// Fetch product name
					var productName *string
					if prodID != nil {
						if objID, ok := prodID.(primitive.ObjectID); ok {
							var product models.Product
							if err := productCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&product); err == nil {
								productName = &product.Name
							}
						}
					}

					// Extract created_at
					createdAt := time.Time{}
					if ca, ok := inv["created_at"].(primitive.DateTime); ok {
						createdAt = ca.Time()
					} else if ca, ok := inv["created_at"].(time.Time); ok {
						createdAt = ca
					}

					// Extract insurance_start (handle multiple formats and types)
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
					} else if is, ok := inv["InsuranceStart"].(primitive.DateTime); ok {
						insStart = formatDate(is.Time())
					} else if is, ok := inv["InsuranceStart"].(time.Time); ok && !is.IsZero() {
						insStart = formatDate(is)
					} else if is, ok := inv["InsuranceStart"].(string); ok && is != "" {
						// Parse ISO format strings
						if t, err := time.Parse(time.RFC3339, is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", is); err == nil {
							insStart = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", is); err == nil {
							insStart = formatDate(t)
						}
					}

					// Extract insurance_end (handle multiple formats and types)
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
					} else if ie, ok := inv["InsuranceEnd"].(primitive.DateTime); ok {
						insEnd = formatDate(ie.Time())
					} else if ie, ok := inv["InsuranceEnd"].(time.Time); ok && !ie.IsZero() {
						insEnd = formatDate(ie)
					} else if ie, ok := inv["InsuranceEnd"].(string); ok && ie != "" {
						// Parse ISO format strings
						if t, err := time.Parse(time.RFC3339, ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02T15:04:05.000Z", ie); err == nil {
							insEnd = formatDate(t)
						} else if t, err := time.Parse("2006-01-02", ie); err == nil {
							insEnd = formatDate(t)
						}
					}

					// Extract insurance_amount
					var insAmount *float64
					if amt, ok := inv["insurance_amount"].(float64); ok {
						insAmount = &amt
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

					cartItems = append(cartItems, CartItem{
						InvoiceID:       inv["_id"],
						MasterInvoiceID: masterID,
						InvoiceType:     "Tai nạn",
						ProductID:       prodID,
						ProductName:     productName,
						Status:          "Chưa thanh toán",
						CreatedAt:       formatDate(createdAt),
						InsuranceStart:  insStart,
						InsuranceEnd:    insEnd,
						InsuranceAmount: insAmount,
					})
				}
			}
		}

		// Sort by created_at DESC
		sort.Slice(cartItems, func(i, j int) bool {
			if cartItems[i].CreatedAt == nil || cartItems[j].CreatedAt == nil {
				return cartItems[i].CreatedAt != nil
			}
			ti, _ := time.Parse("2006-01-02", *cartItems[i].CreatedAt)
			tj, _ := time.Parse("2006-01-02", *cartItems[j].CreatedAt)
			return ti.After(tj)
		})

		c.JSON(http.StatusOK, cartItems)
	}
}

// DeleteCartByMasterMongo - Xóa giỏ hàng dựa trên master_invoice_id
// Param: invoice_id có thể là master_invoice_id (ObjectID hex) hoặc child invoice _id (ObjectID hex)
func DeleteCartByMasterMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		invoiceIDStr := c.Param("invoice_id")

		// Resolve master invoice id
		var masterID primitive.ObjectID
		// 1) if given is master id
		if mid, err := primitive.ObjectIDFromHex(invoiceIDStr); err == nil {
			coll := db.Collection("invoices_master")
			var m bson.M
			if err := coll.FindOne(ctx, bson.M{"_id": mid}).Decode(&m); err == nil {
				masterID = mid
			}
		}

		// 2) if masterID is still zero, try to find child invoice and read master_invoice_id
		if masterID.IsZero() {
			// try common invoices
			if childID, err := primitive.ObjectIDFromHex(invoiceIDStr); err == nil {
				tryColls := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices"}
				for _, name := range tryColls {
					coll := db.Collection(name)
					var doc bson.M
					if err := coll.FindOne(ctx, bson.M{"_id": childID}).Decode(&doc); err == nil {
						if mid, ok := doc["master_invoice_id"].(primitive.ObjectID); ok {
							masterID = mid
							break
						} else if midPtr, ok := doc["master_invoice_id"].(*primitive.ObjectID); ok && midPtr != nil {
							masterID = *midPtr
							break
						}
					}
				}
			}
		}

		if masterID.IsZero() {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy master_invoice tương ứng"})
			return
		}

		// Authorization: ensure at least one child belongs to user (or master.user_id)
		masterColl := db.Collection("invoices_master")
		var mdoc bson.M
		_ = masterColl.FindOne(ctx, bson.M{"_id": masterID}).Decode(&mdoc)

		authorized := false
		if uid, ok := mdoc["user_id"].(primitive.ObjectID); ok {
			if userObjID != nil && uid == *userObjID {
				authorized = true
			}
		}

		if !authorized {
			childColls := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices"}
			for _, name := range childColls {
				coll := db.Collection(name)
				filter := bson.M{"master_invoice_id": masterID}
				if userObjID != nil {
					filter["user_id"] = *userObjID
				}
				cnt, _ := coll.CountDocuments(ctx, filter)
				if cnt > 0 {
					authorized = true
					break
				}
			}
		}

		if !authorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "Bạn không có quyền xóa hóa đơn này"})
			return
		}

		// Delete children then master
		childColls := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices"}
		for _, name := range childColls {
			coll := db.Collection(name)
			_, _ = coll.DeleteMany(ctx, bson.M{"master_invoice_id": masterID})
		}

		_, err := masterColl.DeleteOne(ctx, bson.M{"_id": masterID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa master invoice"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa hóa đơn (master + child) thành công"})
	}
}
