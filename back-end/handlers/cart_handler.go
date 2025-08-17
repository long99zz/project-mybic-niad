package handlers

import (
	"backend/models"
	"encoding/json"
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
		var invoice models.Invoice
		// Chỉ cho xoá đơn chưa thanh toán của chính user
		if err := db.Where("invoice_id = ? AND user_id = ? AND status = ?", invoiceID, userID, "Chưa thanh toán").First(&invoice).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy đơn hàng hoặc không có quyền xoá!"})
			return
		}
		if err := db.Delete(&invoice).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Xoá đơn hàng thất bại!"})
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

		var result []map[string]interface{}

		// Hóa đơn chung
		var invoices []models.Invoice
		db.Where("user_id = ? AND status = ?", userID, "Chưa thanh toán").Find(&invoices)
		for _, inv := range invoices {
			m := map[string]interface{}{}
			b, _ := json.Marshal(inv)
			_ = json.Unmarshal(b, &m)
			m["invoice_type"] = "chung"
			// Join với bảng products để lấy product_name
			var product models.Product
			if err := db.First(&product, inv.ProductID).Error; err == nil {
				m["product_name"] = product.Name
			} else {
				m["product_name"] = ""
			}
			result = append(result, m)
		}

		// Hóa đơn du lịch
		var travelInvoices []models.TravelInsuranceInvoice
		db.Where("user_id = ? AND status = ?", userID, "Chưa thanh toán").Find(&travelInvoices)
		for _, inv := range travelInvoices {
			m := map[string]interface{}{}
			b, _ := json.Marshal(inv)
			_ = json.Unmarshal(b, &m)
			m["invoice_type"] = "du_lich"
			// Join với bảng products để lấy product_name
			if inv.ProductID != nil {
				var product models.Product
				if err := db.First(&product, *inv.ProductID).Error; err == nil {
					m["product_name"] = product.Name
				} else {
					m["product_name"] = ""
				}
			} else {
				m["product_name"] = ""
			}
			result = append(result, m)
		}

		c.JSON(http.StatusOK, result)
	}
}
