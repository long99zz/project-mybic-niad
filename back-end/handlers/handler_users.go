package handlers

import (
	"backend/models"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
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
			fmt.Println("BindJSON error:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Validate dữ liệu bắt buộc
		if user.Email == "" || user.Password == "" || user.FirstName == "" || user.LastName == "" || user.Phone == "" {
			fmt.Println("Missing required fields")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng điền đầy đủ thông tin bắt buộc!"})
			return
		}

		// Validate email
		if !strings.Contains(user.Email, "@") {
			fmt.Println("Invalid email format")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email không hợp lệ!"})
			return
		}

		// Validate phone
		if len(user.Phone) < 10 || len(user.Phone) > 11 {
			fmt.Println("Invalid phone number")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Số điện thoại không hợp lệ!"})
			return
		}

		// Validate date of birth
		if user.DateOfBirth == "--" {
			user.DateOfBirth = time.Now().Format("2006-01-02") // Set default to current date if invalid
		}

		// Kiểm tra email đã tồn tại chưa
		var existingUser models.User
		if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
			fmt.Println("Email already exists:", user.Email)
			c.JSON(http.StatusConflict, gin.H{"error": "Email đã được sử dụng!"})
			return
		}

		// Mã hóa mật khẩu
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Hash password error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mã hóa mật khẩu!"})
			return
		}
		user.Password = string(hashedPassword)

		// Luôn set role là Customer cho tài khoản đăng ký thông thường
		user.Role = "Customer"
		user.AccountType = "Customer"

		// Log dữ liệu trước khi lưu
		fmt.Printf("Attempting to create user with data: %+v\n", map[string]interface{}{
			"email":     user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"phone":     user.Phone,
			"role":      user.Role,
			"date_of_birth": user.DateOfBirth,
		})

		// Bắt đầu transaction
		tx := db.Begin()
		if tx.Error != nil {
			fmt.Println("Begin transaction error:", tx.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể bắt đầu transaction!"})
			return
		}

		// Lưu vào database
		if err := tx.Create(&user).Error; err != nil {
			tx.Rollback()
			fmt.Println("Create user error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tài khoản! Chi tiết: " + err.Error()})
			return
		}

		// Verify user đã được tạo
		var createdUser models.User
		if err := tx.First(&createdUser, user.ID).Error; err != nil {
			tx.Rollback()
			fmt.Println("Verify user error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể xác minh tài khoản đã tạo!"})
			return
		}

		// Tạo token JWT
		token, err := GenerateToken(createdUser.ID, createdUser.Role)
		if err != nil {
			tx.Rollback()
			fmt.Println("Generate token error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token!"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			fmt.Println("Commit transaction error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể hoàn tất đăng ký!"})
			return
		}

		fmt.Printf("✅ Đăng ký thành công cho user: %s (ID: %d)\n", createdUser.Email, createdUser.ID)
		c.JSON(http.StatusCreated, gin.H{
			"message": "Đăng ký thành công!",
			"token":   token,
			"user_id": createdUser.ID,
		})
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
			"firstName":   user.FirstName,
			"lastName":    user.LastName,
			"email":       user.Email,
			"phone":       user.Phone,
			"citizenId":   user.CitizenID,
			"gender":      user.Gender,
			"dateOfBirth": user.DateOfBirth,
			"province":    user.Province,
			"city":        user.City,
			"district":    user.District,
			"subDistrict": user.SubDistrict,
			"houseNumber": user.HouseNumber,
			"role":        user.Role,
		})
	}
}