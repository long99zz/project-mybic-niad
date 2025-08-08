package handlers

import (
	"database/sql"
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetMyInvoices godoc
// @Summary Lấy danh sách hóa đơn của user hiện tại
// @Tags Invoice
// @Produce json
// @Success 200 {array} models.Invoice
// @Failure 401 {object} map[string]interface{}
// @Router /api/my-invoices [get]
func GetMyInvoices(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}
		uid := userID.(uint)
		fmt.Printf("[DEBUG] uid: %v\n", uid)
		// Sử dụng service nếu có, hoặc truy vấn trực tiếp
		// Trả về cả các trường ngày bảo hiểm cho từng loại hóa đơn
		var invoices = make([]map[string]interface{}, 0)
		rows, err := db.Table("invoices").
			Select("invoices.invoice_id, invoices.product_id, products.name as product_name, invoices.status, invoices.created_at, invoices.insurance_start, invoices.insurance_end").
			Joins("left join products on invoices.product_id = products.product_id").
			Where("invoices.user_id = ?", uid).
			Rows()
		if err != nil {
			// Nếu lỗi truy vấn, trả về mảng rỗng thay vì null
			c.JSON(200, invoices)
			return
		}
		defer rows.Close()
		for rows.Next() {
			var invoiceID uint
			var productID sql.NullInt64
			var productName sql.NullString
			var status string
			var createdAt, insuranceStart, insuranceEnd interface{}
			errScan := rows.Scan(&invoiceID, &productID, &productName, &status, &createdAt, &insuranceStart, &insuranceEnd)
			if errScan != nil {
				continue
			}
			// Tìm thêm ngày du lịch nếu có
			var departureDate, returnDate interface{}
			db.Table("travel_insurance_invoices").
				Select("departure_date, return_date").
				Where("invoice_id = ?", invoiceID).
				Row().Scan(&departureDate, &returnDate)
			invoices = append(invoices, map[string]interface{}{
				"invoice_id": invoiceID,
				"product_id": func() interface{} {
					if productID.Valid {
						return productID.Int64
					} else {
						return nil
					}
				}(),
				"product_name": func() interface{} {
					if productName.Valid {
						return productName.String
					} else {
						return nil
					}
				}(),
				"status":          status,
				"created_at":      createdAt,
				"insurance_start": insuranceStart,
				"insurance_end":   insuranceEnd,
				"departure_date":  departureDate,
				"return_date":     returnDate,
			})
		}
		fmt.Printf("[DEBUG] invoices: %#v\n", invoices)
		c.JSON(200, invoices)
	}
}

// GetInvoiceDetailUser godoc
// @Summary Lấy chi tiết hóa đơn của user
// @Tags Invoice
// @Produce json
// @Param id path int true "Invoice ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/invoice-detail/{id} [get]
func GetInvoiceDetailUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceID := c.Param("id")
		// Log invoiceID nhận được
		println("[DEBUG] Nhận được invoiceID:", invoiceID)
		var invoice struct {
			InvoiceID      uint   `json:"invoice_id"`
			ProductID      uint   `json:"product_id"`
			ProductName    string `json:"product_name"`
			Status         string `json:"status"`
			CreatedAt      string `json:"created_at"`
			InsuranceStart string `json:"insurance_start"`
			InsuranceEnd   string `json:"insurance_end"`
			CustomerID     *uint  `json:"customer_id"`
		}
		err := db.Table("invoices").
			Select("invoices.invoice_id, invoices.product_id, products.name as product_name, invoices.status, invoices.created_at, invoices.insurance_start, invoices.insurance_end, invoices.customer_id").
			Joins("left join products on invoices.product_id = products.product_id").
			Where("invoices.invoice_id = ?", invoiceID).
			Scan(&invoice).Error
		// Log kết quả truy vấn
		println("[DEBUG] Kết quả truy vấn invoice.InvoiceID:", invoice.InvoiceID)
		if err != nil || invoice.InvoiceID == 0 {
			println("[DEBUG] Không tìm thấy hóa đơn hoặc lỗi truy vấn!")
			c.JSON(404, gin.H{"error": "Không tìm thấy hóa đơn!"})
			return
		}
		// Lấy thông tin khách hàng
		var customer struct {
			CustomerID  uint   `json:"customer_id"`
			FullName    string `json:"full_name"`
			Email       string `json:"email"`
			PhoneNumber string `json:"phone_number"`
		}
		if invoice.CustomerID != nil {
			db.Table("customer_registration").
				Select("customer_id, full_name, email, phone_number").
				Where("customer_id = ?", *invoice.CustomerID).
				Scan(&customer)
		}
		// Lấy danh sách người tham gia (nếu có), đảm bảo birth_date trả về dạng YYYY-MM-DD
		type ParticipantResp struct {
			ParticipantID  uint   `json:"participant_id"`
			FullName       string `json:"full_name"`
			BirthDate      string `json:"birth_date"`
			Gender         string `json:"gender"`
			IdentityNumber string `json:"identity_number"`
		}
		var participants []ParticipantResp
		rows, err := db.Table("participants").
			Select("participant_id, full_name, birth_date, gender, identity_number").
			Where("invoice_id = ?", invoiceID).
			Rows()
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id uint
				var name, gender, identity string
				var birthDateRaw interface{}
				// birth_date có thể là time.Time hoặc []uint8 (MySQL driver)
				errScan := rows.Scan(&id, &name, &birthDateRaw, &gender, &identity)
				if errScan != nil {
					continue
				}
				var birthDateStr string
				switch v := birthDateRaw.(type) {
				case []uint8:
					birthDateStr = string(v)
				case string:
					birthDateStr = v
				case nil:
					birthDateStr = ""
				default:
					if t, ok := v.(interface{ Format(string) string }); ok {
						birthDateStr = t.Format("2006-01-02")
					} else {
						birthDateStr = ""
					}
				}
				// Nếu birthDateStr có dạng yyyy-mm-dd hh:mm:ss thì cắt lấy yyyy-mm-dd
				if len(birthDateStr) >= 10 {
					birthDateStr = birthDateStr[:10]
				}
				participants = append(participants, ParticipantResp{
					ParticipantID:  id,
					FullName:       name,
					BirthDate:      birthDateStr,
					Gender:         gender,
					IdentityNumber: identity,
				})
			}
		}
		response := gin.H{
			"invoice_id":      invoice.InvoiceID,
			"product_name":    invoice.ProductName,
			"status":          invoice.Status,
			"created_at":      invoice.CreatedAt,
			"insurance_start": invoice.InsuranceStart,
			"insurance_end":   invoice.InsuranceEnd,
			"customer":        customer,
			"participants":    participants,
		}
		// Log response trả về
		println("[DEBUG] Response trả về:")
		for k, v := range response {
			println("[DEBUG]", k, ":", fmt.Sprintf("%v", v))
		}
		c.JSON(200, response)
	}
}
