package handlers
import (
    "net/http"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// CreatePersonalInsuranceForm godoc
// @Summary Lưu bảo hiểm sức khỏe cá nhân
// @Tags Personal
// @Accept json
// @Produce json
// @Param personalInsuranceForm body models.PersonalInsuranceForm true "Personal insurance form"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_personal/create_personal_insurance_form [post]
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