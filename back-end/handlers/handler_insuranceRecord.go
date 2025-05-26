package handlers

import (
    "net/http"
    "gorm.io/gorm"
    "backend/models"
    "github.com/gin-gonic/gin"
    "fmt"
)

func CreateInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var invoice models.Invoice
         // 🔹 Lấy user_id từ token đăng nhập
        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
            return
        }

        invoice.UserID = userID.(uint) // Gán user_id vào invoice

        // 🔹 Kiểm tra JSON đầu vào
        if err := c.ShouldBindJSON(&invoice); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // 🔹 Đảm bảo `contract_type` hợp lệ
        if err := invoice.Validate(); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        // 🔹 Chỉ định tên bảng chính xác để tránh lỗi GORM tự động thêm "s"
        if err := db.Table("invoices").Create(&invoice).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu invoice!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Invoice đã lưu!", "invoice_id": invoice.InvoiceID})
    }
}
func CreateCarInsuranceForm(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var carInsurance models.CarInsuranceForm

        if err := c.ShouldBindJSON(&carInsurance); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        if err := carInsurance.Validate(); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // 1. Tạo bản ghi insurance_forms trước
        insuranceForm := models.InsuranceForm{
            InsuranceType: "car", // hoặc lấy từ request nếu cần
                PolicyHolderName:  carInsurance.OwnerName,
                InsuranceStart:    carInsurance.InsuranceStart, // Đảm bảo là "YYYY-MM-DD"
                InsuranceDuration: int(carInsurance.InsuranceDuration),
                TotalPremium:      carInsurance.InsuranceFee,
        }
        if err := db.Create(&insuranceForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo insurance_form!"})
            return
        }

        // 2. Gán form_id vừa tạo vào carInsurance
        carInsurance.FormID = &insuranceForm.FormID

        // 3. Lưu carInsuranceForm
        if err := db.Create(&carInsurance).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu bảo hiểm xe!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "CarInsuranceForm đã lưu!", "form_id": insuranceForm.FormID})
    }
}
func CreateCustomerRegistration(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var customer models.CustomerRegistration

        // 🔹 Kiểm tra JSON đầu vào
        if err := c.ShouldBindJSON(&customer); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // 🔹 Đảm bảo `customer_type` hợp lệ
       if err := customer.Validate(); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

        // 🔹 Chỉ định tên bảng chính xác để tránh lỗi GORM tự động thêm "s"
        if err := db.Table("customer_registration").Create(&customer).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu khách hàng!"})
            return
        }

        // 🔹 Lấy `customer_id` vừa tạo bằng `LAST_INSERT_ID()`
        var customerID uint
        db.Raw("SELECT LAST_INSERT_ID()").Scan(&customerID)
        fmt.Println("🚀 Đã tạo customer ID:", customerID)

        c.JSON(http.StatusOK, gin.H{"message": "Customer đã lưu!", "customer_id": customerID})
    }
}
func ConfirmPurchase(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            InvoiceID   uint `json:"invoice_id"`
            CustomerID  uint `json:"customer_id"`
            FormID      uint `json:"form_id"`
        }

        // Lấy user_id từ token đăng nhập (nếu cần xác thực)
        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Bạn chưa đăng nhập!"})
            return
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // Update lại invoice với customer_id và form_id
        if err := db.Table("invoices").
            Where("invoice_id = ? AND user_id = ?", input.InvoiceID, userID).
            Updates(map[string]interface{}{
                "customer_id": input.CustomerID,
                "form_id":     input.FormID,
            }).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật invoice!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Xác nhận mua hàng thành công!", "invoice_id": input.InvoiceID})
    }
}