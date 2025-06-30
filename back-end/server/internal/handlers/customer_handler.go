package handlers
import (
    "net/http"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
	"fmt"
)
// CreateCustomerRegistration godoc
// @Summary Đăng ký khách hàng
// @Tags Customer
// @Accept json
// @Produce json
// @Param customer body models.CustomerRegistration true "Customer info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_car_owner/create_customer_registration [post]
// @Router /api/insurance_motorbike_owner/create_customer_registration [post]
// @Router /api/insurance_home/create_customer_registration [post]
// @Router /api/insurance_travel/create_customer_registration [post]
// @Router /api/insurance_personal/create_customer_registration [post]
// @Router /api/insurance_cancer/create_customer_registration [post]
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