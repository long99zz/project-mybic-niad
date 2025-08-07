package handlers

import (
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetInvoice(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		invoiceID := c.Param("id")

		var invoice models.Invoice
		if err := db.First(&invoice, "invoice_id = ?", invoiceID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Hóa đơn không tồn tại!", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"invoice": invoice})
	}
}
