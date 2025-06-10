package handlers

import (
	"backend/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateInvoice(db *gorm.DB) gin.HandlerFunc {
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
        if invoice.Status == "" {
            invoice.Status = "Chưa thanh toán"
        }
        if err := invoice.Validate(); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        tx := db.Begin()
        if err := tx.Table("invoices").Create(&invoice).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu invoice!"})
            return
        }
        tx.Commit()
        c.JSON(http.StatusOK, gin.H{"message": "Invoice đã lưu!", "invoice_id": invoice.InvoiceID})
    }
}

func CreateTravelInsuranceInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            models.TravelInsuranceInvoice
            Participants []models.TravelParticipant `json:"participants"`
        }
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
        // 1. Tạo insurance_form
        insuranceForm := models.InsuranceForm{
            InsuranceType:    "travel",
            PolicyHolderName: "",
            InsuranceStart:   input.TravelInsuranceInvoice.DepartureDate,
            InsuranceDuration: int(input.TravelInsuranceInvoice.ReturnDate.Sub(input.TravelInsuranceInvoice.DepartureDate).Hours() / 24),
            TotalPremium:     input.TravelInsuranceInvoice.TotalAmount,
        }
        if err := tx.Create(&insuranceForm).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi tạo insurance_form!"})
            return
        }
        input.TravelInsuranceInvoice.FormID = &insuranceForm.FormID

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
        c.JSON(200, gin.H{
            "message": "TravelInsuranceInvoice đã lưu!",
            "invoice_id": input.TravelInsuranceInvoice.InvoiceID,
            "form_id": insuranceForm.FormID,
        })
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
func CreateMotorbikeInsuranceForm(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var motorbikeForm models.MotorbikeInsuranceForm

        if err := c.ShouldBindJSON(&motorbikeForm); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // 1. Tạo bản ghi insurance_forms trước
        insuranceForm := models.InsuranceForm{
            InsuranceType:     "motorbike",
            PolicyHolderName:  motorbikeForm.OwnerName,
            InsuranceStart:    motorbikeForm.InsuranceStart,
            InsuranceDuration: int(motorbikeForm.InsuranceDuration),
            TotalPremium:      motorbikeForm.InsuranceFee,
        }
        if err := db.Create(&insuranceForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo insurance_form!"})
            return
        }

        // 2. Gán form_id vừa tạo vào motorbikeForm
        motorbikeForm.FormID = &insuranceForm.FormID

        // 3. Lưu MotorbikeInsuranceForm, bỏ qua trường vehicle_type
        if err := db.Omit("vehicle_type").Create(&motorbikeForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu thông tin xe máy!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "MotorbikeInsuranceForm đã lưu!", "form_id": insuranceForm.FormID})
    }
}
func CreateInsuranceParticipantInfo(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var participant models.InsuranceParticipantInfo

        if err := c.ShouldBindJSON(&participant); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // 1. Tạo insurance_forms trước
        insuranceForm := models.InsuranceForm{
        CustomerID:      participant.CustomerID,
        InsuranceType:   "cancer insurance",
        PolicyHolderName: participant.FullName,
        InsuranceStart:  time.Now(), // hoặc participant.BirthDate nếu muốn test
        InsuranceDuration: int(participant.InsuranceDuration),
        TotalPremium:    participant.PremiumFee,
    }
        if err := db.Create(&insuranceForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo insurance_form!"})
            return
        }

        // 2. Gán form_id vừa tạo vào participant
        participant.FormID = &insuranceForm.FormID

        // 3. Lưu participant
        if err := db.Create(&participant).Error; err != nil {
            c.JSON(500, gin.H{"error": "Lỗi khi lưu thông tin người tham gia!"})
            return
        }

        c.JSON(200, gin.H{
            "message": "Lưu thành công!",
            "participant_id": participant.ParticipantID,
            "form_id": insuranceForm.FormID,
        })
    }
}
func CreatePersonalInsuranceForm(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var personalForm models.PersonalInsuranceForm

        if err := c.ShouldBindJSON(&personalForm); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // 1. Tạo bản ghi insurance_forms trước (nếu cần liên kết FormID)
        insuranceForm := models.InsuranceForm{
            InsuranceType:     "personal",
            PolicyHolderName:  personalForm.FullName,
            InsuranceStart:    personalForm.InsuranceStart,
            InsuranceDuration: int(personalForm.InsuranceDuration),
            TotalPremium:      personalForm.InsuranceFee,
        }
        if err := db.Create(&insuranceForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo insurance_form!"})
            return
        }

        // 2. Gán form_id vừa tạo vào personalForm
        personalForm.FormID = &insuranceForm.FormID

        // 3. Lưu PersonalInsuranceForm
        if err := db.Create(&personalForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu bảo hiểm sức khỏe cá nhân!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message": "PersonalInsuranceForm đã lưu!",
            "form_id": insuranceForm.FormID,
        })
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
func CreateAccidentInsuranceInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            models.Invoice
            Participants []models.Participant `json:"participants"`
        }
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
        if err := input.Validate(); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
        tx.Model(&models.Invoice{}).
            Where("invoice_id = ?", input.Invoice.InvoiceID).
            Update("insurance_quantity", len(input.Participants))
        tx.Commit()
        c.JSON(200, gin.H{
            "message": "Invoice bảo hiểm tai nạn đã lưu!",
            "invoice_id": input.Invoice.InvoiceID,
            "insurance_quantity": len(input.Participants),
        })
    }
}
func ConfirmPurchase(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            InvoiceID        uint   `json:"invoice_id"`
            CustomerID       uint   `json:"customer_id"`
            FormID           uint   `json:"form_id"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // Lấy thông tin form bảo hiểm để cập nhật vào invoice
        var insuranceForm models.InsuranceForm
        if err := db.First(&insuranceForm, input.FormID).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không tìm thấy form bảo hiểm!"})
            return
        }

        // Tính insurance_end từ insurance_start và insurance_duration
        insuranceEnd := insuranceForm.InsuranceStart.AddDate(0, int(insuranceForm.InsuranceDuration), 0)

        // Cập nhật invoice với các trường mới
        if err := db.Table("invoices").
            Where("invoice_id = ?", input.InvoiceID).
            Updates(map[string]interface{}{
                "customer_id":       input.CustomerID,
                "form_id":           input.FormID,
                "insurance_start":   insuranceForm.InsuranceStart,
                "insurance_end":     insuranceEnd,
                "insurance_amount":  insuranceForm.TotalPremium,
            }).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật invoice!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Xác nhận mua hàng thành công!", "invoice_id": input.InvoiceID})
    }
}
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
            "message": "Đã cập nhật customer_id cho invoice!",
            "invoice_id": input.InvoiceID,
            "customer_id": input.CustomerID,
        })
    }
}
func CreateVehicleInsuranceForm(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            CustomerRegistration models.CustomerRegistration   `json:"customer_registration"`
            InsuranceVehicleInfo models.InsuranceVehicleInfo   `json:"insurance_vehicle_info"`
            InsuranceForm        models.InsuranceForm          `json:"insurance_form"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        tx := db.Begin()

        // 1. Lưu customer_registration
        if err := tx.Create(&input.CustomerRegistration).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi lưu khách hàng!"})
            return
        }

        // 2. Lưu insurance_vehicle_info (nếu cần)
        if err := tx.Create(&input.InsuranceVehicleInfo).Error; err != nil {
            tx.Rollback()
            c.JSON(500, gin.H{"error": "Lỗi khi lưu thông tin xe!"})
            return
        }

        // 3. Lưu insurance_form, gán customer_id
        input.InsuranceForm.CustomerID = &input.CustomerRegistration.CustomerID
            if err := tx.Create(&input.InsuranceForm).Error; err != nil {
                tx.Rollback()
                c.JSON(500, gin.H{"error": "Lỗi khi lưu insurance_form!"})
                return
            }
            db.Model(&models.InsuranceForm{}).
                Where("form_id = ?", input.InsuranceForm.FormID).
                Update("customer_id", input.CustomerRegistration.CustomerID)

        tx.Commit()
        c.JSON(200, gin.H{
            "message":      "Lưu thành công!",
            "customer_id":  input.CustomerRegistration.CustomerID,
            "form_id":      input.InsuranceForm.FormID,
        })
    }
}