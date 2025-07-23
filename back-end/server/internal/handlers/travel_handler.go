package handlers
import (
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// TravelInvoiceRequest dùng cho body request
type TravelInvoiceRequest struct {
    models.TravelInsuranceInvoice
    Participants []models.TravelParticipant `json:"participants"`
}

// TravelInvoiceResponse dùng cho response
type TravelInvoiceResponse struct {
    Invoice      models.TravelInsuranceInvoice `json:"invoice"`
    Participants []models.TravelParticipant    `json:"participants"`
}

// CreateTravelInsuranceInvoice godoc
// @Summary Tạo hóa đơn bảo hiểm du lịch (kèm danh sách người tham gia)
// @Tags Travel
// @Accept json
// @Produce json
// @Param invoice body handlers.TravelInvoiceRequest true "Invoice info"
// @Success 200 {object} handlers.TravelInvoiceResponse
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_travel/create_travel_invoice [post]
func CreateTravelInsuranceInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input TravelInvoiceRequest
        userID, exists := c.Get("user_id")
        if exists {
            uid := userID.(uint)
            input.TravelInsuranceInvoice.UserID = &uid
        } else {
            input.TravelInsuranceInvoice.UserID = nil
        }
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        tx := db.Begin()
        // 1. Tạo insurance_form nếu cần (tùy logic)
        // 2. Lưu hóa đơn du lịch
        if err := tx.Create(&input.TravelInsuranceInvoice).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi lưu hóa đơn du lịch!"})
            return
        }
        // 3. Lưu từng participant
        for _, p := range input.Participants {
            participant := p
            participant.InvoiceID = input.TravelInsuranceInvoice.InvoiceID
            if err := tx.Create(&participant).Error; err != nil {
                tx.Rollback()
                c.JSON(500, gin.H{"error": "Lỗi khi lưu người tham gia!"})
                return
            }
        }
        tx.Commit()
        c.JSON(200, TravelInvoiceResponse{
            Invoice:      input.TravelInsuranceInvoice,
            Participants: input.Participants,
        })
    }
}
// UpdateTravelInvoiceCustomer godoc
// @Summary Gán customer_id vào hóa đơn du lịch
// @Tags Travel
// @Accept json
// @Produce json
// @Param update body object true "Update info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_travel/update_invoice_customer [post]
func UpdateTravelInvoiceCustomer(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            InvoiceID   uint `json:"invoice_id"`
            CustomerID  uint `json:"customer_id"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        if err := db.Model(&models.TravelInsuranceInvoice{}).
            Where("invoice_id = ?", input.InvoiceID).
            Update("customer_id", input.CustomerID).Error; err != nil {
            c.JSON(500, gin.H{"error": "Lỗi khi cập nhật customer_id cho hóa đơn du lịch!"})
            return
        }

        c.JSON(200, gin.H{
            "message": "Đã cập nhật customer_id cho hóa đơn du lịch!",
            "invoice_id": input.InvoiceID,
            "customer_id": input.CustomerID,
        })
    }
}
