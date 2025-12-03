package handlers

import (
	"backend/models"
	"fmt"
	"sort"

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

		type MyInvoiceView struct {
			InvoiceID       uint     `json:"invoice_id"`
			InvoiceType     string   `json:"invoice_type"`
			ProductID       *uint    `json:"product_id"`
			ProductName     *string  `json:"product_name"`
			Status          string   `json:"status"`
			CreatedAt       string   `json:"created_at"`
			InsuranceStart  *string  `json:"insurance_start,omitempty"`
			InsuranceEnd    *string  `json:"insurance_end,omitempty"`
			InsuranceAmount *float64 `json:"insurance_amount,omitempty"`
			DepartureDate   *string  `json:"departure_date,omitempty"`
			ReturnDate      *string  `json:"return_date,omitempty"`
			UpdatedAt       string   `json:"updated_at"`
		}

		var result []MyInvoiceView

		// 1. Lấy hóa đơn chung (invoices)
		var commonInvoices []MyInvoiceView
		db.Raw(`
			SELECT 
				i.invoice_id,
				'Chung' AS invoice_type,
				i.product_id,
				p.name AS product_name,
				i.status,
				DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
				DATE_FORMAT(i.insurance_start, '%Y-%m-%d') AS insurance_start,
				DATE_FORMAT(i.insurance_end, '%Y-%m-%d') AS insurance_end,
				i.insurance_amount,
				NULL as departure_date,
				NULL as return_date,
				DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
			FROM invoices i
			LEFT JOIN products p ON i.product_id = p.product_id
			WHERE i.user_id = ?
			ORDER BY i.created_at DESC
		`, uid).Scan(&commonInvoices)
		result = append(result, commonInvoices...)

		// 2. Lấy hóa đơn du lịch (travel_insurance_invoices)
		var travelInvoices []MyInvoiceView
		db.Raw(`
			SELECT 
				t.invoice_id,
				'Du lịch' AS invoice_type,
				t.product_id,
				p.name AS product_name,
				t.status,
				DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
				DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS insurance_start,
				DATE_FORMAT(t.return_date, '%Y-%m-%d') AS insurance_end,
				t.total_amount AS insurance_amount,
				DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS departure_date,
				DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
				DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
			FROM travel_insurance_invoices t
			LEFT JOIN products p ON t.product_id = p.product_id
			WHERE t.user_id = ?
			ORDER BY t.created_at DESC
		`, uid).Scan(&travelInvoices)
		result = append(result, travelInvoices...)

		// 3. Lấy hóa đơn nhà (home_insurance_invoices)
		var homeInvoices []MyInvoiceView
		db.Raw(`
			SELECT 
				h.invoice_id,
				'Nhà' AS invoice_type,
				h.product_id,
				p.name AS product_name,
				h.status,
				DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
				DATE_FORMAT(h.insurance_start, '%Y-%m-%d') AS insurance_start,
				DATE_FORMAT(h.insurance_end, '%Y-%m-%d') AS insurance_end,
				COALESCE(h.total_amount, (h.home_insurance_amount + h.asset_insurance_amount)) AS insurance_amount,
				NULL as departure_date,
				NULL as return_date,
				DATE_FORMAT(h.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
			FROM home_insurance_invoices h
			LEFT JOIN products p ON h.product_id = p.product_id
			WHERE h.user_id = ?
			ORDER BY h.created_at DESC
		`, uid).Scan(&homeInvoices)
		result = append(result, homeInvoices...)

		// Sắp xếp tất cả hóa đơn theo created_at giảm dần (mới nhất trước)
		sort.Slice(result, func(i, j int) bool {
			return result[i].CreatedAt > result[j].CreatedAt
		})

		fmt.Printf("[DEBUG] Total invoices: %d\n", len(result))
		c.JSON(200, result)
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
		println("[DEBUG] Nhận được invoiceID:", invoiceID)

		// 1. Kiểm tra xem có phải master_invoice_id không
		var masterInvoice models.InvoiceMaster
		err := db.Where("_id = ?", invoiceID).First(&masterInvoice).Error

		var invoiceType string
		var actualInvoiceID string

		if err == nil {
			// Đây là master_invoice_id
			invoiceType = masterInvoice.InvoiceType
			actualInvoiceID = masterInvoice.ID.Hex()
			println("[DEBUG] Tìm thấy master invoice, type:", invoiceType)
		} else {
			// Không tìm thấy trong master, thử tìm trong các bảng con
			println("[DEBUG] Không tìm thấy master invoice, tìm trong bảng con")
			actualInvoiceID = ""
		}

		var invoice struct {
			InvoiceID       uint     `json:"invoice_id"`
			InvoiceType     string   `json:"invoice_type"`
			ProductID       *uint    `json:"product_id"`
			ProductName     string   `json:"product_name"`
			Status          string   `json:"status"`
			CreatedAt       string   `json:"created_at"`
			InsuranceStart  *string  `json:"insurance_start,omitempty"`
			InsuranceEnd    *string  `json:"insurance_end,omitempty"`
			CustomerID      *uint    `json:"customer_id"`
			InsuranceAmount *float64 `json:"insurance_amount"`
		}

		var found bool

		// 2. Query dựa trên invoice_type từ master
		if invoiceType == "Chung" || actualInvoiceID == "" {
			err := db.Table("invoices i").
				Select("i.invoice_id, 'Chung' as invoice_type, i.product_id, p.name as product_name, i.status, DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(i.insurance_start, '%Y-%m-%d') as insurance_start, DATE_FORMAT(i.insurance_end, '%Y-%m-%d') as insurance_end, i.customer_id, i.insurance_amount").
				Joins("LEFT JOIN products p ON i.product_id = p.product_id").
				Where("i.invoice_id = ? OR i.master_invoice_id = ?", invoiceID, actualInvoiceID).
				Scan(&invoice).Error

			if err == nil && invoice.InvoiceID > 0 {
				found = true
				println("[DEBUG] Tìm thấy trong invoices")
			}
		}

		// 3. Nếu không tìm thấy hoặc type là Du lịch, thử travel_insurance_invoices
		if !found && (invoiceType == "Du lịch" || actualInvoiceID == "") {
			err = db.Table("travel_insurance_invoices t").
				Select("t.invoice_id, 'Du lịch' as invoice_type, t.product_id, p.name as product_name, t.status, DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(t.departure_date, '%Y-%m-%d') as insurance_start, DATE_FORMAT(t.return_date, '%Y-%m-%d') as insurance_end, t.customer_id, t.total_amount as insurance_amount").
				Joins("LEFT JOIN products p ON t.product_id = p.product_id").
				Where("t.invoice_id = ? OR t.master_invoice_id = ?", invoiceID, actualInvoiceID).
				Scan(&invoice).Error

			if err == nil && invoice.InvoiceID > 0 {
				found = true
				println("[DEBUG] Tìm thấy trong travel_insurance_invoices")
			}
		}

		// 4. Nếu vẫn không tìm thấy hoặc type là Nhà, thử home_insurance_invoices
		if !found && (invoiceType == "Nhà" || actualInvoiceID == "") {
			err = db.Table("home_insurance_invoices h").
				Select("h.invoice_id, 'Nhà' as invoice_type, h.product_id, p.name as product_name, 'Chưa thanh toán' as status, DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(h.insurance_start, '%Y-%m-%d') as insurance_start, DATE_FORMAT(h.insurance_end, '%Y-%m-%d') as insurance_end, h.customer_id, COALESCE(h.total_amount, (h.home_insurance_amount + h.asset_insurance_amount)) as insurance_amount").
				Joins("LEFT JOIN products p ON h.product_id = p.product_id").
				Where("h.invoice_id = ? OR h.master_invoice_id = ?", invoiceID, actualInvoiceID).
				Scan(&invoice).Error

			if err == nil && invoice.InvoiceID > 0 {
				found = true
				println("[DEBUG] Tìm thấy trong home_insurance_invoices")
			}
		}

		if !found {
			println("[DEBUG] Không tìm thấy hóa đơn trong tất cả các bảng!")
			c.JSON(404, gin.H{"error": "Không tìm thấy hóa đơn!"})
			return
		}

		println("[DEBUG] InvoiceID:", invoice.InvoiceID)
		println("[DEBUG] ProductID:", invoice.ProductID)
		println("[DEBUG] ProductName:", invoice.ProductName)
		println("[DEBUG] Status:", invoice.Status)

		// Sử dụng insurance_amount từ query (đã được xử lý ở trên)
		var finalAmount interface{}
		if invoice.InsuranceAmount != nil && *invoice.InsuranceAmount > 0 {
			finalAmount = *invoice.InsuranceAmount
		} else {
			finalAmount = nil
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

		// Chọn bảng phù hợp dựa trên loại hóa đơn
		var tableName string
		if invoice.InvoiceType == "Du lịch" {
			tableName = "travel_participants"
		} else {
			tableName = "participants"
		}

		rows, err := db.Table(tableName).
			Select("participant_id, full_name, birth_date, gender, identity_number").
			Where("invoice_id = ?", invoice.InvoiceID).
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
			"invoice_id":       invoice.InvoiceID,
			"product_name":     invoice.ProductName,
			"status":           invoice.Status,
			"created_at":       invoice.CreatedAt,
			"insurance_start":  invoice.InsuranceStart,
			"insurance_end":    invoice.InsuranceEnd,
			"insurance_amount": finalAmount,
			"customer":         customer,
			"participants":     participants,
		}
		// Log response trả về
		println("[DEBUG] Response trả về:")
		for k, v := range response {
			println("[DEBUG]", k, ":", fmt.Sprintf("%v", v))
		}
		c.JSON(200, response)
	}
}
