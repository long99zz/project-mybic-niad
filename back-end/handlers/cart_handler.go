package handlers

import (
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DeleteCartInvoice godoc
// @Summary Xoá đơn hàng khỏi giỏ
// @Tags Cart
// @Param invoice_id path int true "ID đơn hàng"
// @Success 200 {object} object
// @Router /api/cart/{invoice_id} [delete]
func DeleteCartInvoice(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}
		invoiceID := c.Param("invoice_id")

		// Sử dụng transaction để xóa an toàn
		tx := db.Begin()

		var deleted bool

		// 1. Thử xóa từ bảng invoices
		var invoice models.Invoice
		if err := tx.Where("invoice_id = ? AND user_id = ? AND status = ?", invoiceID, userID, "Chưa thanh toán").First(&invoice).Error; err == nil {
			// Xóa participants liên quan (nếu có)
			tx.Where("invoice_id = ?", invoiceID).Delete(&models.Participant{})

			// Xóa invoice
			if err := tx.Delete(&invoice).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Xoá đơn hàng thất bại!"})
				return
			}

			// Xóa từ invoices_master tương ứng
			tx.Where("master_invoice_id = ?", invoice.MasterInvoiceID).Delete(&models.InvoiceMaster{})
			deleted = true
		}

		// 2. Nếu không tìm thấy, thử xóa từ travel_insurance_invoices
		if !deleted {
			var travelInvoice models.TravelInsuranceInvoice
			if err := tx.Where("invoice_id = ? AND user_id = ? AND status = ?", invoiceID, userID, "Chưa thanh toán").First(&travelInvoice).Error; err == nil {
				// Xóa travel participants liên quan (nếu có)
				tx.Where("invoice_id = ?", invoiceID).Delete(&models.TravelParticipant{})

				// Xóa travel invoice
				if err := tx.Delete(&travelInvoice).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Xoá đơn hàng thất bại!"})
					return
				}

				// Xóa từ invoices_master tương ứng
				tx.Where("master_invoice_id = ?", travelInvoice.MasterInvoiceID).Delete(&models.InvoiceMaster{})
				deleted = true
			}
		}

		// 3. Nếu vẫn không tìm thấy, thử xóa từ home_insurance_invoices
		if !deleted {
			var homeInvoice models.HomeInsuranceInvoice
			if err := tx.Where("invoice_id = ? AND user_id = ?", invoiceID, userID).First(&homeInvoice).Error; err == nil {
				// Xóa home invoice
				if err := tx.Delete(&homeInvoice).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Xoá đơn hàng thất bại!"})
					return
				}

				// Xóa từ invoices_master tương ứng
				tx.Where("master_invoice_id = ?", homeInvoice.MasterInvoiceID).Delete(&models.InvoiceMaster{})
				deleted = true
			}
		}

		if !deleted {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy đơn hàng hoặc không có quyền xoá!"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi hoàn tất xoá đơn hàng!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Đã xoá đơn hàng khỏi giỏ!"})
	}
}

// GetCart godoc
// @Summary Lấy giỏ hàng
// @Tags Cart
// @Produce json
// @Success 200 {array} object
// @Router /api/cart [get]
func GetCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		type CartInvoiceView struct {
			InvoiceID       uint     `json:"invoice_id"`
			InvoiceType     string   `json:"invoice_type"`
			ProductID       *uint    `json:"product_id"`
			ProductName     string   `json:"product_name"`
			CustomerName    string   `json:"customer_name"`
			InsuranceStart  *string  `json:"insurance_start,omitempty"`
			InsuranceEnd    *string  `json:"insurance_end,omitempty"`
			InsuranceAmount *float64 `json:"insurance_amount,omitempty"`
			Status          *string  `json:"status,omitempty"`
			DepartureDate   *string  `json:"departure_date,omitempty"`
			ReturnDate      *string  `json:"return_date,omitempty"`
			UpdatedAt       string   `json:"updated_at"`
		}

		var result []CartInvoiceView
		var temp []CartInvoiceView

		// 1. Hóa đơn chung (chỉ lấy đơn chưa thanh toán của user hiện tại)
		temp = []CartInvoiceView{}
		db.Raw(`
            SELECT 
                i.invoice_id,
                'Chung' AS invoice_type,
                i.product_id,
                p.name AS product_name,
                CONCAT(u.last_name, ' ', u.first_name) AS customer_name,
                DATE_FORMAT(i.insurance_start, '%Y-%m-%d') AS insurance_start,
                DATE_FORMAT(i.insurance_end, '%Y-%m-%d') AS insurance_end,
                i.insurance_amount,
                i.status,
                NULL AS departure_date,
                NULL AS return_date,
                DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM invoices i
            LEFT JOIN products p ON i.product_id = p.product_id
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.user_id = ? AND i.status = 'Chưa thanh toán'
        `, userID).Scan(&temp)
		result = append(result, temp...)

		// 2. Hóa đơn du lịch (chỉ lấy đơn chưa thanh toán của user hiện tại)
		temp = []CartInvoiceView{}
		db.Raw(`
            SELECT 
                t.invoice_id,
                'Du lịch' AS invoice_type,
                t.product_id,
                p.name AS product_name,
                CONCAT(u.last_name, ' ', u.first_name) AS customer_name,
                DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS insurance_start,
                DATE_FORMAT(t.return_date, '%Y-%m-%d') AS insurance_end,
                t.total_amount AS insurance_amount,
                t.status,
                DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS departure_date,
                DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
                DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM travel_insurance_invoices t
            LEFT JOIN products p ON t.product_id = p.product_id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ? AND t.status = 'Chưa thanh toán'
        `, userID).Scan(&temp)
		result = append(result, temp...)

		// 3. Hóa đơn nhà (chỉ lấy đơn chưa thanh toán của user hiện tại)
		temp = []CartInvoiceView{}
		db.Raw(`
            SELECT 
                h.invoice_id,
                'Nhà' AS invoice_type,
                h.product_id,
                p.name AS product_name,
                CONCAT(u.last_name, ' ', u.first_name) AS customer_name,
                DATE_FORMAT(h.insurance_start, '%Y-%m-%d') AS insurance_start,
                DATE_FORMAT(h.insurance_end, '%Y-%m-%d') AS insurance_end,
                COALESCE(h.total_amount, (h.home_insurance_amount + h.asset_insurance_amount)) AS insurance_amount,
                h.status,
                NULL AS departure_date,
                NULL AS return_date,
                DATE_FORMAT(h.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM home_insurance_invoices h
            LEFT JOIN products p ON h.product_id = p.product_id
            LEFT JOIN users u ON h.user_id = u.id
            WHERE h.user_id = ? AND h.status = 'Chưa thanh toán'
        `, userID).Scan(&temp)
		result = append(result, temp...)

		c.JSON(http.StatusOK, result)
	}
}
