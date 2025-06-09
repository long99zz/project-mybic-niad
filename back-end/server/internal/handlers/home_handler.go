package handlers
import (
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// @Summary Tạo hóa đơn bảo hiểm nhà
// @Tags Home
// @Accept json
// @Produce json
// @Param invoice body models.Invoice true "Invoice info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_home/create_home_invoice [post]
func CreateHomeInsuranceInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input models.HomeInsuranceInvoice
        userID, exists := c.Get("user_id")
        if exists {
            uid := userID.(uint)
            input.UserID = &uid
        } else {
            input.UserID = nil
        }
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        input.CustomerID = nil
        input.FormID = nil

        tx := db.Begin()
        if err := tx.Create(&input).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi lưu hóa đơn bảo hiểm nhà!"})
            return
        }
        tx.Commit()
        c.JSON(200, gin.H{
            "message": "Đã lưu thông tin hóa đơn bảo hiểm nhà!",
            "invoice_id": input.InvoiceID,
        })
    }
}
// UpdateHomeInvoiceCustomer godoc
// @Summary Gán customer_id vào hóa đơn nhà
// @Tags Home
// @Accept json
// @Produce json
// @Param update body object true "Update info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_home/update_invoice_customer [post]
func UpdateHomeInvoiceCustomer(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            InvoiceID  uint `json:"invoice_id"`
            CustomerID uint `json:"customer_id"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        if err := db.Model(&models.HomeInsuranceInvoice{}).
            Where("invoice_id = ?", input.InvoiceID).
            Update("customer_id", input.CustomerID).Error; err != nil {
            c.JSON(500, gin.H{"error": "Lỗi khi cập nhật customer_id cho hóa đơn nhà!"})
            return
        }

        c.JSON(200, gin.H{
            "message": "Đã cập nhật customer_id cho hóa đơn nhà!",
            "invoice_id": input.InvoiceID,
            "customer_id": input.CustomerID,
        })
    }
}