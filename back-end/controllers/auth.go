package controllers

import (
    "back-end/models"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "net/http"
    "time"
)

// Hàm tạo JWT
func GenerateToken(userID uint, role string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": userID,
        "role":    role,
        "exp":     time.Now().Add(24 * time.Hour).Unix(), // Token hết hạn sau 24h
    })

    return token.SignedString([]byte("JWT_SECRET"))
}

// API Đăng nhập
func LoginUser(c *gin.Context) {
    var input struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Thông tin không hợp lệ"})
        return
    }

    var user models.User
    if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Email không tồn tại"})
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Mật khẩu sai"})
        return
    }

    // Tạo token JWT
    token, err := GenerateToken(user.ID, user.Role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Đăng nhập thành công", "token": token, "role": user.Role})
}