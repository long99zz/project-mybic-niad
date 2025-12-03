package handlers

import (
	"fmt"
	"net/url"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
	"gorm.io/gorm"
)

// CreateStripeCheckout godoc
// @Summary Tạo Stripe Checkout Session
// @Tags Payment
// @Accept json
// @Produce json
// @Param body body map[string]interface{} true "Payment Info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/payment/stripe/create [post]
func CreateStripeCheckout(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			InvoiceID uint   `json:"invoice_id" binding:"required"` // master_invoice_id từ frontend
			Amount    int64  `json:"amount" binding:"required"`
			OrderInfo string `json:"order_info"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Thiếu thông tin thanh toán: " + err.Error()})
			return
		}

		// Set Stripe API key
		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

		// Lấy thông tin từ invoices_master (invoice_id là master_invoice_id)
		var masterInvoice struct {
			MasterInvoiceID uint
			InvoiceType     string
			ProductID       *uint
			Status          string
		}

		if err := db.Table("invoices_master").
			Where("master_invoice_id = ?", req.InvoiceID).
			First(&masterInvoice).Error; err != nil {
			c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng"})
			return
		}

		invoiceType := masterInvoice.InvoiceType
		fmt.Printf("[DEBUG STRIPE] Master invoice - Type: %s, ID: %d, Status: %s\n",
			invoiceType, masterInvoice.MasterInvoiceID, masterInvoice.Status)

		if masterInvoice.Status != "Chưa thanh toán" {
			c.JSON(400, gin.H{"error": "Đơn hàng này đã được thanh toán hoặc đang xử lý"})
			return
		}

		// Default order info
		orderInfo := req.OrderInfo
		if orderInfo == "" {
			orderInfo = fmt.Sprintf("Thanh toan don hang #%d", req.InvoiceID)
		}

		// Debug: Log số tiền nhận được
		fmt.Printf("[DEBUG STRIPE] Amount received: %d VND\n", req.Amount)

		// Encode invoice_type để tránh lỗi với ký tự không phải ASCII
		encodedInvoiceType := url.QueryEscape(invoiceType)

		// Tạo Stripe Checkout Session
		params := &stripe.CheckoutSessionParams{
			PaymentMethodTypes: stripe.StringSlice([]string{
				"card",
			}),
			LineItems: []*stripe.CheckoutSessionLineItemParams{
				{
					PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
						Currency: stripe.String("vnd"),
						ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
							Name:        stripe.String(orderInfo),
							Description: stripe.String(fmt.Sprintf("Invoice #%d", req.InvoiceID)),
						},
						UnitAmount: stripe.Int64(req.Amount),
					},
					Quantity: stripe.Int64(1),
				},
			},
			Mode:              stripe.String(string(stripe.CheckoutSessionModePayment)),
			SuccessURL:        stripe.String(os.Getenv("STRIPE_RETURN_URL") + "?session_id={CHECKOUT_SESSION_ID}&invoice_id=" + strconv.Itoa(int(req.InvoiceID)) + "&invoice_type=" + encodedInvoiceType),
			CancelURL:         stripe.String(os.Getenv("STRIPE_RETURN_URL") + "?canceled=true&invoice_id=" + strconv.Itoa(int(req.InvoiceID))),
			ClientReferenceID: stripe.String(strconv.Itoa(int(req.InvoiceID))),
		}

		s, err := session.New(params)
		if err != nil {
			fmt.Println("[ERROR STRIPE] Create session failed:", err)
			c.JSON(500, gin.H{"error": "Không thể tạo session thanh toán: " + err.Error()})
			return
		}

		fmt.Println("[DEBUG STRIPE] Session created:", s.ID)
		fmt.Println("[DEBUG STRIPE] Payment URL:", s.URL)
		fmt.Printf("[DEBUG STRIPE] Using master_invoice_id: %d for transaction\n", req.InvoiceID)

		// Lưu transaction vào DB (invoice_id là master_invoice_id)
		db.Exec(`INSERT INTO payment_transactions (invoice_id, txn_ref, amount, status, created_at) 
	VALUES (?, ?, ?, 'PENDING', NOW())`,
			req.InvoiceID, s.ID, req.Amount)

		c.JSON(200, gin.H{
			"payment_url":       s.URL,
			"session_id":        s.ID,
			"master_invoice_id": req.InvoiceID,
		})
	}
}

// StripeWebhook godoc
// @Summary Xử lý Stripe Webhook
// @Tags Payment
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/payment/stripe/webhook [post]
func StripeWebhook(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement webhook handler để xử lý payment success/failed
		c.JSON(200, gin.H{"received": true})
	}
}

// StripeReturn godoc
// @Summary Xử lý callback từ Stripe
// @Tags Payment
// @Produce json
// @Param session_id query string true "Checkout Session ID"
// @Param invoice_id query string true "Invoice ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/payment/stripe/return [get]
func StripeReturn(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		invoiceIDStr := c.Query("invoice_id")
		invoiceType := c.Query("invoice_type")
		canceled := c.Query("canceled")

		// Kiểm tra nếu user cancel
		if canceled == "true" {
			c.JSON(200, gin.H{
				"success": false,
				"message": "Thanh toán đã bị hủy",
			})
			return
		}

		if sessionID == "" || invoiceIDStr == "" {
			c.JSON(400, gin.H{"error": "Thiếu thông tin session_id hoặc invoice_id"})
			return
		}

		invoiceID, _ := strconv.Atoi(invoiceIDStr)

		// Set Stripe API key
		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

		// Retrieve session để verify payment
		s, err := session.Get(sessionID, nil)
		if err != nil {
			fmt.Println("[ERROR STRIPE] Get session failed:", err)
			c.JSON(500, gin.H{"error": "Không thể xác thực thanh toán"})
			return
		}

		fmt.Println("[DEBUG STRIPE] Session status:", s.PaymentStatus)
		fmt.Println("[DEBUG STRIPE] Invoice ID:", invoiceID)
		fmt.Printf("[DEBUG STRIPE] Invoice type from URL: %s\n", invoiceType)

		// Kiểm tra payment status
		if s.PaymentStatus == "paid" {
			// Cập nhật status trong invoices_master (nguồn chân lý)
			updateResult := db.Exec("UPDATE invoices_master SET status = 'Đã thanh toán' WHERE master_invoice_id = ?", invoiceID)
			if updateResult.Error != nil {
				fmt.Printf("[ERROR] Update invoices_master status failed: %v\n", updateResult.Error)
			} else {
				fmt.Printf("[SUCCESS] Updated invoices_master ID #%d status to 'Đã thanh toán'\n", invoiceID)
			}

			// Lấy thông tin master invoice để xác định bảng con cần update
			var masterInvoice struct {
				ProductID   *uint
				InvoiceType string
			}

			err = db.Table("invoices_master").
				Where("master_invoice_id = ?", invoiceID).
				First(&masterInvoice).Error

			if err != nil {
				fmt.Printf("[ERROR] Get master invoice failed: %v\n", err)
			} else {
				// Update child table tương ứng dựa vào invoice_type
				var childTableName string
				switch masterInvoice.InvoiceType {
				case "Chung":
					childTableName = "invoices"
				case "Du lịch":
					childTableName = "travel_insurance_invoices"
				case "Nhà":
					childTableName = "home_insurance_invoices"
				}

				if childTableName != "" {
					// Update child table status WHERE master_invoice_id = invoiceID
					childUpdateResult := db.Exec(
						fmt.Sprintf("UPDATE %s SET status = 'Đã thanh toán' WHERE master_invoice_id = ?", childTableName),
						invoiceID,
					)
					if childUpdateResult.Error != nil {
						fmt.Printf("[ERROR] Update %s status failed: %v\n", childTableName, childUpdateResult.Error)
					} else {
						fmt.Printf("[SUCCESS] Updated %s records with master_invoice_id #%d\n", childTableName, invoiceID)
					}
				}
			}

			// Cập nhật transaction status
			db.Exec(`UPDATE payment_transactions SET status = 'SUCCESS' WHERE txn_ref = ?`, sessionID)

			fmt.Printf("[DEBUG STRIPE] Master invoice query error: %v\n", err)

			var productID uint
			var productName string

			if masterInvoice.ProductID != nil {
				productID = *masterInvoice.ProductID
				fmt.Printf("[DEBUG STRIPE] Product ID from master: %d\n", productID)

				if productID > 0 {
					err = db.Table("products").Select("name").Where("product_id = ?", productID).Scan(&productName).Error
					fmt.Printf("[DEBUG STRIPE] Product name query error: %v\n", err)
				}
			}

			fmt.Printf("[DEBUG STRIPE] Final - Product ID: %d, Product Name: %s\n", productID, productName)

			c.JSON(200, gin.H{
				"success":      true,
				"message":      "Thanh toán thành công",
				"invoice_id":   invoiceID,
				"amount":       s.AmountTotal,
				"product_name": productName,
			})
		} else {
			// Payment chưa hoàn thành hoặc failed
			db.Exec(`UPDATE payment_transactions SET status = 'FAILED' WHERE txn_ref = ?`, sessionID)

			c.JSON(200, gin.H{
				"success": false,
				"message": "Thanh toán chưa hoàn thành",
			})
		}
	}
}
