
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
    "gorm.io/gorm"
    "backend/server/internal/services"
    "backend/server/models"
)

// GetMyInvoices godoc
// @Summary Lấy danh sách hóa đơn của user hiện tại
// @Tags Invoice
// @Produce json
// @Success 200 {array} models.Invoice
// @Failure 401 {object} map[string]interface{}
// @Router /api/my-invoices [get]


var validate = validator.New()



// @Summary Tạo hóa đơn bảo hiểm xe máy  Tạo hóa đơn bảo hiểm xe ô tô, ung thư, sức khỏe cá nhân
// @Tags MotorbikeOwnerCarOwner
// @Accept json
// @Produce json
// @Param invoice body models.Invoice true "Invoice info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_motorbike_owner/create_invoice [post]
// @Router /api/insurance_car_owner/create_invoice [post]
// @Router /api/insurance_cancer/create_invoice [post]
// @Router /api/insurance_personal/create_invoice [post]
func CreateInvoice(db *gorm.DB) gin.HandlerFunc {
    service := services.NewInvoiceService(db)
    return func(c *gin.Context) {
        var invoice models.Invoice
        userID, exists := c.Get("user_id")
        if exists {
            uid := userID.(uint)
            invoice.UserID = &uid
        } else {
            invoice.UserID = nil
        }
        if err := c.ShouldBindJSON(&invoice); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        if err := validate.Struct(invoice); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        if err := service.CreateInvoice(&invoice); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        c.JSON(http.StatusOK, gin.H{"message": "Invoice đã lưu!", "invoice_id": invoice.InvoiceID})
    }
}
type ConfirmPurchaseInput struct {
    InvoiceID  uint `json:"invoice_id"`
    CustomerID uint `json:"customer_id"`
    FormID     uint `json:"form_id"`
}
// CreateConfirmPurchase godoc
// @Summary Xác nhận mua bảo hiểm xe ô tô, xe máy, ung thư, sức khỏe cá nhân
// @Tags CarOwner
// @Accept json
// @Produce json
// @Param confirm body handlers.ConfirmPurchaseInput true "Confirm info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_car_owner/confirm_purchase [post]
// @Router /api/insurance_motorbike_owner/confirm_purchase [post]
// @Router /api/insurance_cancer/confirm_purchase [post]
// @Router /api/insurance_personal/confirm_purchase [post]
func ConfirmPurchase(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input ConfirmPurchaseInput

        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
            return
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        var insuranceForm models.InsuranceForm
        if err := db.First(&insuranceForm, input.FormID).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không tìm thấy form bảo hiểm!"})
            return
        }

        insuranceEnd := insuranceForm.InsuranceStart.AddDate(0, int(insuranceForm.InsuranceDuration), 0)

        if err := db.Table("invoices").
            Where("invoice_id = ? AND user_id = ?", input.InvoiceID, userID).
            Updates(map[string]interface{}{
                "customer_id":      input.CustomerID,
                "form_id":          input.FormID,
                "insurance_start":  insuranceForm.InsuranceStart,
                "insurance_end":    insuranceEnd,
                "insurance_amount": insuranceForm.TotalPremium,
            }).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật invoice!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Xác nhận mua hàng thành công!", "invoice_id": input.InvoiceID})
    }
}
// UpdateInvoiceCustomer godoc
// @Summary Gán customer_id vào hóa đơn tai nạn
// @Tags Accident
// @Accept json
// @Produce json
// @Param update body object true "Update info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_accident/update_invoice_customer [post]
func UpdateInvoiceCustomer(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            InvoiceID  uint `json:"invoice_id"`
            CustomerID uint `json:"customer_id"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        if err := db.Model(&models.Invoice{}).
            Where("invoice_id = ?", input.InvoiceID).
            Update("customer_id", input.CustomerID).Error; err != nil {
            c.JSON(500, gin.H{"error": "Lỗi khi cập nhật customer_id cho invoice!"})
            return
        }

        c.JSON(200, gin.H{
            "message":    "Đã cập nhật customer_id cho invoice!",
            "invoice_id": input.InvoiceID,
            "customer_id": input.CustomerID,
        })
    }
}

// AccidentInvoiceRequest dùng cho body request
type AccidentInvoiceRequest struct {
    models.Invoice
    Participants []models.Participant `json:"participants"`
}

// AccidentInvoiceResponse dùng cho response
type AccidentInvoiceResponse struct {
    Invoice      models.Invoice        `json:"invoice"`
    Participants []models.Participant  `json:"participants"`
}

// CreateAccidentInsuranceInvoice godoc
// @Summary Tạo hóa đơn bảo hiểm tai nạn (kèm danh sách người tham gia)
// @Tags Accident
// @Accept json
// @Produce json
// @Param invoice body handlers.AccidentInvoiceRequest true "Invoice info"
// @Success 200 {object} handlers.AccidentInvoiceResponse
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_accident/create_accident [post]
func CreateAccidentInsuranceInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input AccidentInvoiceRequest
        userID, exists := c.Get("user_id")
        if exists {
            uid := userID.(uint)
            input.Invoice.UserID = &uid
        } else {
            input.Invoice.UserID = nil
        }
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        tx := db.Begin()
        if err := tx.Create(&input.Invoice).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi lưu invoice!"})
            return
        }
        for _, p := range input.Participants {
            participant := p
            participant.InvoiceID = input.Invoice.InvoiceID
            if err := tx.Create(&participant).Error; err != nil {
                tx.Rollback()
                c.JSON(500, gin.H{"error": "Lỗi khi lưu người tham gia!"})
                return
            }
        }
        tx.Commit()
        c.JSON(200, AccidentInvoiceResponse{
            Invoice:      input.Invoice,
            Participants: input.Participants,
        })
    }
}
// GetInvoice godoc
// @Summary Lấy thông tin hóa đơn
// @Tags Invoice
// @Produce json
// @Param id path int true "Invoice ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/invoice/{id} [get]
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