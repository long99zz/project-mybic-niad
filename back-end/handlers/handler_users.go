package handlers
import (
    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    "net/http"
    "gorm.io/gorm"
    "backend/models"
	"github.com/golang-jwt/jwt/v5"
    "time"
    "os"

)
func GenerateToken(userID uint, role string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": userID,
        "role":    role,
        "exp":     time.Now().Add(24 * time.Hour).Unix(), // Token hết hạn sau 24h
    })

    secretKey := os.Getenv("JWT_SECRET") // 🔥 Lấy secret từ biến môi trường
    return token.SignedString([]byte(secretKey))
}

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var user models.User
        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        // Kiểm tra email đã tồn tại chưa
        var existingUser models.User
        if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
            c.JSON(http.StatusConflict, gin.H{"error": "Email đã được sử dụng!"})
            return
        }

        // Mã hóa mật khẩu
        hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
        user.Password = string(hashedPassword)

        // Kiểm tra quyền hợp lệ
        if user.Role != "Admin" && user.Role != "Customer" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Quyền không hợp lệ!"})
            return
        }

        // Lưu vào database
        db.Create(&user)

        // Tạo token JWT ngay sau khi đăng ký
        token, err := GenerateToken(user.ID, user.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token!"})
            return
        }

        c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký thành công!", "token": token})
    }
}


func LoginUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            Email    string `json:"email"`
            Password string `json:"password"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Thông tin không hợp lệ!"})
            return
        }

        var user models.User
        if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Email không tồn tại!"})
            return
        }

        if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Mật khẩu sai!"})
            return
        }

        // Tạo token JWT
        token, err := GenerateToken(user.ID, user.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Đăng nhập thành công!", "token": token, "role": user.Role})
    }
}
func GetUserInfo(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Không có thông tin người dùng!"})
            return
        }

        var user models.User
        if err := db.First(&user, userID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng!"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "user_id":     user.ID,
            "first_name":  user.FirstName,
            "last_name":   user.LastName,
            "email":       user.Email,
            "phone":       user.Phone,
            "citizen_id":  user.CitizenID,
            "gender":      user.Gender,
            "date_of_birth": user.DateOfBirth,
            "province":    user.Province,
            "city":        user.City,
            "district":    user.District,
            "sub_district": user.SubDistrict,
            "house_number": user.HouseNumber,
            "role":        user.Role,
        })
    }
}