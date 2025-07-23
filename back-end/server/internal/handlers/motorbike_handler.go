package handlers
import (
    "net/http"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// CreateMotorbikeInsuranceForm godoc
// @Summary Lưu bảo hiểm xe máy
// @Tags MotorbikeOwner
// @Accept json
// @Produce json
// @Param motorbikeInsuranceForm body models.MotorbikeInsuranceForm true "Motorbike insurance form"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_motorbike_owner/create_motorbike_insurance_form [post]
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

        // 3. Lưu MotorbikeInsuranceForm
        if err := db.Create(&motorbikeForm).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu thông tin xe máy!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "MotorbikeInsuranceForm đã lưu!", "form_id": insuranceForm.FormID})
    }
}