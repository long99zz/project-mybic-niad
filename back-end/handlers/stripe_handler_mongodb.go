package handlers

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
)

// CreateStripeCheckoutMongo godoc
// @Summary Tạo Stripe Checkout Session (MongoDB)
// @Tags Payment
// @Accept json
// @Produce json
// @Param body body map[string]interface{} true "Payment Info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/payment/stripe/create [post]
func CreateStripeCheckoutMongo(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			InvoiceID interface{} `json:"invoice_id" binding:"required"` // có thể là string (ObjectID) hoặc number
			Amount    int64       `json:"amount" binding:"required"`
			OrderInfo string      `json:"order_info"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Thiếu thông tin thanh toán: " + err.Error()})
			return
		}

		// Convert invoice_id to ObjectID (hỗ trợ cả string và number)
		var masterInvoiceID primitive.ObjectID
		var invoiceIDStr string

		switch v := req.InvoiceID.(type) {
		case string:
			invoiceIDStr = v
			var err error

			// First, try to parse as ObjectID (master_invoice_id)
			masterInvoiceID, err = primitive.ObjectIDFromHex(v)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invoice ID không hợp lệ: " + err.Error()})
				return
			}
			log.Printf("✅ Parsed as ObjectID: %s", invoiceIDStr)

			// Check if it's a master invoice or child invoice
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			var masterInv bson.M
			err = mongoDB.Collection("invoices_master").FindOne(ctx, bson.M{"_id": masterInvoiceID}).Decode(&masterInv)
			if err != nil {
				log.Printf("⚠️  Not found in invoices_master, checking child invoices...")
				// If it fails, might be a child invoice ID. Try to find it and get master_invoice_id
				childTables := []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices"}
				found := false
				for _, tableName := range childTables {
					var childInv bson.M
					err := mongoDB.Collection(tableName).FindOne(ctx, bson.M{"_id": masterInvoiceID}).Decode(&childInv)
					if err == nil {
						if mid, ok := childInv["master_invoice_id"].(primitive.ObjectID); ok {
							masterInvoiceID = mid
							invoiceIDStr = masterInvoiceID.Hex()
							log.Printf("✅ Found child invoice in %s, master_invoice_id: %s", tableName, invoiceIDStr)
							found = true
							break
						} else {
							log.Printf("⚠️  Child invoice found in %s but no master_invoice_id field", tableName)
						}
					}
				}

				if !found {
					c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng với ID: " + v})
					return
				}
			}
		case float64:
			// Frontend gửi number, tìm master_invoice_id trong DB
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			var masterInv bson.M
			err := mongoDB.Collection("invoices_master").FindOne(ctx, bson.M{"_id": int(v)}).Decode(&masterInv)
			if err != nil {
				c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng với ID: " + fmt.Sprintf("%d", int(v))})
				return
			}
			masterInvoiceID = masterInv["_id"].(primitive.ObjectID)
			invoiceIDStr = masterInvoiceID.Hex()
		default:
			c.JSON(400, gin.H{"error": "Invoice ID phải là string hoặc number"})
			return
		}

		// Set Stripe API key
		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Lấy thông tin từ invoices_master
		var masterInvoice bson.M
		err := mongoDB.Collection("invoices_master").FindOne(ctx, bson.M{"_id": masterInvoiceID}).Decode(&masterInvoice)
		if err != nil {
			log.Printf("❌ Error finding master invoice with _id: %s, error: %v", masterInvoiceID.Hex(), err)
			if err == mongo.ErrNoDocuments {
				c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng"})
			} else {
				c.JSON(500, gin.H{"error": "Lỗi khi truy vấn database: " + err.Error()})
			}
			return
		}
		log.Printf("✅ Found master invoice: %v", masterInvoice["_id"])

		status, _ := masterInvoice["status"].(string)
		if status != "Chưa thanh toán" {
			c.JSON(400, gin.H{"error": "Đơn hàng này đã được thanh toán hoặc đang xử lý"})
			return
		} // Tạo Stripe Checkout Session
		params := &stripe.CheckoutSessionParams{
			PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
			LineItems: []*stripe.CheckoutSessionLineItemParams{
				{
					PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
						Currency: stripe.String("vnd"), // Vietnamese Dong
						ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
							Name: stripe.String(req.OrderInfo),
						},
						UnitAmount: stripe.Int64(req.Amount),
					},
					Quantity: stripe.Int64(1),
				},
			},
			Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
			SuccessURL: stripe.String(
				fmt.Sprintf("http://localhost:5173/payment-result?session_id={CHECKOUT_SESSION_ID}&master_invoice_id=%s", invoiceIDStr),
			),
			CancelURL:         stripe.String("http://localhost:5173/cart"),
			ClientReferenceID: stripe.String(invoiceIDStr),
		}

		s, err := session.New(params)
		if err != nil {
			c.JSON(500, gin.H{"error": "Lỗi khi tạo Stripe session: " + err.Error()})
			return
		}

		// Lưu transaction vào DB (invoice_id là master_invoice_id ObjectID)
		transaction := bson.M{
			"_id":        primitive.NewObjectID(),
			"invoice_id": masterInvoiceID,
			"txn_ref":    s.ID,
			"amount":     req.Amount,
			"status":     "PENDING",
			"created_at": time.Now(),
			"updated_at": time.Now(),
		}

		_, err = mongoDB.Collection("payment_transactions").InsertOne(ctx, transaction)
		if err != nil {
			log.Printf("❌ Error saving transaction: %v", err)
		}

		c.JSON(200, gin.H{
			"payment_url":       s.URL,
			"session_id":        s.ID,
			"master_invoice_id": invoiceIDStr,
		})
	}
}

// StripeWebhookMongo godoc
// @Summary Xử lý Stripe Webhook
// @Tags Payment
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/payment/stripe/webhook [post]
func StripeWebhookMongo(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Webhook handling logic
		c.JSON(200, gin.H{"received": true})
	}
}

// StripeReturnMongo godoc
// @Summary Xử lý callback từ Stripe
// @Tags Payment
// @Produce json
// @Param session_id query string true "Checkout Session ID"
// @Param invoice_id query string true "Invoice ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/payment/stripe/return [get]
func StripeReturnMongo(mongoDB *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		// Try to get master_invoice_id first, fallback to invoice_id for backward compatibility
		masterInvoiceIDStr := c.Query("master_invoice_id")
		if masterInvoiceIDStr == "" {
			masterInvoiceIDStr = c.Query("invoice_id")
		}

		if sessionID == "" || masterInvoiceIDStr == "" {
			c.JSON(400, gin.H{"error": "Thiếu session_id hoặc master_invoice_id"})
			return
		}

		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

		s, err := session.Get(sessionID, nil)
		if err != nil {
			c.JSON(500, gin.H{"error": "Không thể xác thực giao dịch"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if s.PaymentStatus == "paid" {
			// Cập nhật status trong invoices_master
			masterInvoiceID, err := primitive.ObjectIDFromHex(masterInvoiceIDStr)
			if err != nil {
				log.Printf("❌ Error parsing master_invoice_id: %v", err)
				c.JSON(400, gin.H{"error": "Invoice ID không hợp lệ"})
				return
			}
			log.Printf("✅ Parsed master_invoice_id: %s (ObjectID: %v)", masterInvoiceIDStr, masterInvoiceID.Hex())

			// Update invoices_master status
			_, err = mongoDB.Collection("invoices_master").UpdateOne(
				ctx,
				bson.M{"_id": masterInvoiceID},
				bson.M{"$set": bson.M{"status": "Đã thanh toán", "updated_at": time.Now()}},
			)
			if err != nil {
				log.Printf("❌ Error updating invoices_master: %v", err)
			}

			// Update child invoice tables based on type
			childTables := []string{"invoices", "travel_invoices", "home_insurance_invoices"}
			for _, tableName := range childTables {
				_, err := mongoDB.Collection(tableName).UpdateMany(
					ctx,
					bson.M{"master_invoice_id": masterInvoiceID},
					bson.M{"$set": bson.M{"status": "Đã thanh toán", "updated_at": time.Now()}},
				)
				if err != nil {
					log.Printf("❌ Error updating %s: %v", tableName, err)
				}
			}

			// Update payment_transactions status
			_, err = mongoDB.Collection("payment_transactions").UpdateOne(
				ctx,
				bson.M{"txn_ref": sessionID},
				bson.M{"$set": bson.M{"status": "SUCCESS", "updated_at": time.Now()}},
			)
			if err != nil {
				log.Printf("❌ Error updating payment_transactions: %v", err)
			}

			// Lấy thông tin chi tiết từ child invoice để có product_id
			type ChildInvoiceInfo struct {
				InvoiceType string      `json:"invoice_type"`
				ProductID   interface{} `json:"product_id"`
				ProductName string      `json:"product_name"`
				Status      string      `json:"status"`
			}

			var invoiceInfo ChildInvoiceInfo
			invoiceInfo.ProductName = "Bảo hiểm" // default

			// Tìm trong các child invoice collections
			childTables = []string{"invoices", "travel_insurance_invoices", "home_insurance_invoices", "accident_invoices"}
			log.Printf("🔍 Searching for child invoice with master_invoice_id ObjectID: %v", masterInvoiceID.Hex())
			for _, tableName := range childTables {
				var childInvoice bson.M
				childErr := mongoDB.Collection(tableName).FindOne(ctx, bson.M{"master_invoice_id": masterInvoiceID}).Decode(&childInvoice)
				if childErr == nil {
					log.Printf("✅ Found child invoice in %s: %v", tableName, childInvoice["_id"])
					invoiceInfo.InvoiceType = tableName
					invoiceInfo.ProductID = childInvoice["product_id"]
					if status, ok := childInvoice["status"].(string); ok {
						invoiceInfo.Status = status
					}

					// Fallback 1: Try to get product name from insurance_package field first
					if pkgName, ok := childInvoice["insurance_package"].(string); ok && pkgName != "" {
						invoiceInfo.ProductName = pkgName
						log.Printf("✅ Got product name from insurance_package: %s", pkgName)
						break // Found, exit early
					}

					// Fallback 2: Lấy tên sản phẩm từ product collection
					var prodID interface{} = childInvoice["product_id"]
					log.Printf("🔎 Product ID from child invoice: %v (type: %T)", prodID, prodID)
					if prodID != nil {
						var productDoc bson.M
						prodErr := mongoDB.Collection("products").FindOne(ctx, bson.M{"_id": prodID}).Decode(&productDoc)
						if prodErr == nil {
							log.Printf("✅ Found product: %v", productDoc)
							if pn, ok := productDoc["name"].(string); ok {
								invoiceInfo.ProductName = pn
								log.Printf("✅ Product name: %s", pn)
							}
						} else {
							log.Printf("❌ Product not found with _id: %v, error: %v", prodID, prodErr)
							// Try different ID formats
							if prodFloat, ok := prodID.(float64); ok {
								log.Printf("🔄 Trying alternate format: int(%d)", int(prodFloat))
								prodErr = mongoDB.Collection("products").FindOne(ctx, bson.M{"_id": int(prodFloat)}).Decode(&productDoc)
								if prodErr == nil {
									log.Printf("✅ Found product with int ID: %v", productDoc)
									if pn, ok := productDoc["name"].(string); ok {
										invoiceInfo.ProductName = pn
										log.Printf("✅ Product name from int ID: %s", pn)
									}
								} else {
									log.Printf("❌ Product not found with int ID: %d", int(prodFloat))
								}
							}
						}
					}
					break // Found child invoice, stop searching
				} else {
					log.Printf("❌ No child invoice in %s, query error: %v", tableName, childErr)
				}
			}

			c.JSON(200, gin.H{
				"success":      true,
				"message":      "Thanh toán thành công",
				"invoice_id":   masterInvoiceIDStr,
				"invoice_type": invoiceInfo.InvoiceType,
				"product_id":   invoiceInfo.ProductID,
				"product_name": invoiceInfo.ProductName,
				"amount":       s.AmountTotal,
				"status":       "Đã thanh toán",
			})
		} else {
			// Payment chưa hoàn thành hoặc failed
			_, err := mongoDB.Collection("payment_transactions").UpdateOne(
				ctx,
				bson.M{"txn_ref": sessionID},
				bson.M{"$set": bson.M{"status": "FAILED", "updated_at": time.Now()}},
			)
			if err != nil {
				log.Printf("❌ Error updating payment_transactions to FAILED: %v", err)
			}

			c.JSON(200, gin.H{
				"success": false,
				"message": "Thanh toán không thành công",
			})
		}
	}
}
