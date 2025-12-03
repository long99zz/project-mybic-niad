package middlewares

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
) // Middleware kiểm tra JWT
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Thiếu token"})
			c.Abort()
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		// Load JWT_SECRET bên trong hàm để đảm bảo .env đã được load
		secretKey := []byte(os.Getenv("JWT_SECRET"))

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			log.Printf("[AuthMiddleware] Token parse error: %v", err)
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

		log.Printf("[AuthMiddleware] Token claims: %v", claims)

		// Lưu user_id và role vào context
		// user_id có thể là string hoặc float64 (từ JSON)
		var userID string
		if userIDStr, ok := claims["user_id"].(string); ok {
			userID = userIDStr
		} else if userIDFloat, ok := claims["user_id"].(float64); ok {
			// Convert float64 to string properly (e.g., 1.0 -> "1")
			userID = fmt.Sprintf("%.0f", userIDFloat)
		} else {
			log.Printf("[AuthMiddleware] user_id type: %T, value: %v", claims["user_id"], claims["user_id"])
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id format invalid"})
			c.Abort()
			return
		}

		role := ""
		if roleStr, ok := claims["role"].(string); ok {
			role = roleStr
		}

		log.Printf("[AuthMiddleware] Setting user_id: %s, role: %s", userID, role)
		c.Set("user_id", userID)
		c.Set("role", role)

		c.Next()
	}
}
