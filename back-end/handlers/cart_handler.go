package handlers
import (
    "net/http"
    "gorm.io/gorm"
    "backend/models"
    "github.com/gin-gonic/gin"
    "encoding/json"
)
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
            result = append(result, m)
        }

        c.JSON(http.StatusOK, result)
    }
}
