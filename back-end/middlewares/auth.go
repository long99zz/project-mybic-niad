package middlewares

import (
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "net/http"
    "strings"
	"os"

)

// Khóa bí mật JWT (nên lưu vào biến môi trường)

var secretKey = []byte(os.Getenv("JWT_SECRET"))

// Middleware kiểm tra JWT
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Thiếu token"})
            c.Abort()
            return
        }

        tokenString = strings.TrimPrefix(tokenString, "Bearer ")

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return secretKey, nil
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ"})
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Không thể trích xuất thông tin từ token"})
            c.Abort()
            return
        }

        // Lưu user_id và role vào context
        c.Set("user_id", uint(claims["user_id"].(float64)))
        c.Set("role", claims["role"].(string))

        c.Next()
    }
}

