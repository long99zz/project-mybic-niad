package handlers
import (
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// CreateVehicleInsuranceForm godoc
// @Summary Lưu bảo hiểm vật chất xe ô tô
// @Tags CarOwnerVehicle
// @Accept json
// @Produce json
// @Param vehicleInsuranceForm body object true "Vehicle insurance form"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_car_owner/create_vehicle_insurance_form [post]
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