package handlers
import (
    "net/http"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// CreateCarInsuranceForm godoc
// @Summary Lưu thông tin bảo hiểm xe ô tô
// @Tags CarOwner
// @Accept json
// @Produce json
// @Param carInsuranceForm body models.CarInsuranceForm true "Car insurance form"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_car_owner/create_car_insurance_form [post]
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