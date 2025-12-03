package handlers

import (
	"backend/models"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// GenerateTokenMongo tạo JWT token với MongoDB ObjectID
func GenerateTokenMongo(userID interface{}, role string) (string, error) {
	secretKey := os.Getenv("JWT_SECRET")
	var userIDStr string

	// Convert userID to string regardless of type
	if oid, ok := userID.(primitive.ObjectID); ok {
		userIDStr = oid.Hex()
	} else {
		userIDStr = fmt.Sprintf("%v", userID)
	}

	log.Printf("[JWT] Generating token for user: %s, role: %s, JWT_SECRET length: %d", userIDStr, role, len(secretKey))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userIDStr,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	signed, err := token.SignedString([]byte(secretKey))
	if err != nil {
		log.Printf("[JWT] Error signing token: %v", err)
		return "", err
	}
	log.Printf("[JWT] Token generated successfully")
	return signed, nil
}

// RegisterUserMongo - Đăng ký user mới với MongoDB
func RegisterUserMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Kiểm tra email đã tồn tại
		var existingUser models.User
		err := collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email đã được sử dụng!"})
			return
		}

		// Mã hóa mật khẩu
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)

		// Set role
		if user.Role == "" {
			user.Role = "Customer"
		}
		if user.Role != "Admin" && user.Role != "Customer" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Quyền không hợp lệ!"})
			return
		}

		// Set ID và timestamps
		user.ID = primitive.NewObjectID()
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()

		// Lưu vào database
		_, err = collection.InsertOne(ctx, user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tài khoản!"})
			return
		}

		// Tạo token JWT
		token, err := GenerateTokenMongo(user.ID, user.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token!"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký thành công!", "token": token})
	}
}

// LoginUserMongo - Đăng nhập user
func LoginUserMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			log.Printf("[LOGIN] Error binding JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thông tin không hợp lệ!"})
			return
		}
		log.Printf("[LOGIN] Email from input: %s", input.Email)

		var userDoc bson.M
		err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&userDoc)
		if err != nil {
			log.Printf("[LOGIN] FindOne error: %v", err)
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Email không tồn tại!"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn database!"})
			return
		}
		log.Printf("[LOGIN] User found: %v", userDoc["email"])

		// Extract fields from BSON map
		passwordStr, ok := userDoc["password"].(string)
		if !ok {
			log.Printf("[LOGIN] Password field not found or not string")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi dữ liệu người dùng!"})
			return
		}

		// Thử bcrypt compare trước
		err = bcrypt.CompareHashAndPassword([]byte(passwordStr), []byte(input.Password))

		// Nếu bcrypt thất bại, thử so sánh plain text (fallback for old data)
		if err != nil {
			log.Printf("[LOGIN] bcrypt compare failed: %v, trying plain text comparison", err)
			if passwordStr != input.Password {
				log.Printf("[LOGIN] Plain text comparison also failed")
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Mật khẩu sai!"})
				return
			}
			log.Printf("[LOGIN] Plain text match successful (legacy password)")
		}

		// Extract ID for token
		userID := userDoc["_id"]
		roleStr := "Customer"
		if role, ok := userDoc["role"].(string); ok {
			roleStr = role
		}

		// Tạo token JWT
		token, err := GenerateTokenMongo(userID, roleStr)
		if err != nil {
			log.Printf("[LOGIN] GenerateTokenMongo error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo token!"})
			return
		}

		log.Printf("[LOGIN] Login success")
		c.JSON(http.StatusOK, gin.H{
			"message": "Đăng nhập thành công!",
			"token":   token,
			"role":    roleStr,
		})
	}
}

// ChangePasswordMongo - Đổi mật khẩu user
func ChangePasswordMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Lấy user_id từ JWT context
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Bạn chưa đăng nhập!"})
			return
		}

		userIDVal := userIDStr.(string)

		// Build flexible user_id query (support both int and ObjectID)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		var input struct {
			OldPassword string `json:"oldPassword"`
			NewPassword string `json:"newPassword"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Tìm user
		var userDoc bson.M
		err := collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&userDoc)
		if err != nil {
			c.JSON(404, gin.H{"error": "Không tìm thấy user!"})
			return
		}

		// Kiểm tra mật khẩu cũ
		passwordStr, ok := userDoc["password"].(string)
		if !ok {
			c.JSON(500, gin.H{"error": "Lỗi dữ liệu người dùng!"})
			return
		}

		// Thử bcrypt compare
		err = bcrypt.CompareHashAndPassword([]byte(passwordStr), []byte(input.OldPassword))

		// Nếu bcrypt thất bại, thử so sánh plain text (fallback for old data)
		if err != nil {
			if passwordStr != input.OldPassword {
				c.JSON(401, gin.H{"error": "Mật khẩu cũ không đúng!"})
				return
			}
		}

		// Mã hóa mật khẩu mới
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(500, gin.H{"error": "Không thể mã hóa mật khẩu mới!"})
			return
		}

		// Cập nhật password
		update := bson.M{
			"$set": bson.M{
				"password":   string(hashedPassword),
				"updated_at": time.Now(),
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": userID}, update)
		if err != nil {
			c.JSON(500, gin.H{"error": "Không thể lưu mật khẩu mới!"})
			return
		}

		c.JSON(200, gin.H{"message": "Đổi mật khẩu thành công!"})
	}
}

// GetUserInfoMongo - Lấy thông tin user
func GetUserInfoMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Không có thông tin người dùng!"})
			return
		}

		// userIDStr is already a string from JWT, use it directly
		userIDVal := userIDStr.(string)

		// Try to find by ID (can be int or string)
		var userDoc bson.M
		err := collection.FindOne(ctx, bson.M{"_id": userIDVal}).Decode(&userDoc)
		if err != nil {
			// Try as integer if string fails
			var userID interface{}
			// Try parsing as int first
			if intVal, err2 := strconv.Atoi(userIDVal); err2 == nil {
				userID = intVal
			} else {
				// Try as ObjectID
				if objID, err3 := primitive.ObjectIDFromHex(userIDVal); err3 == nil {
					userID = objID
				} else {
					userID = userIDVal
				}
			}

			err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&userDoc)
			if err != nil {
				log.Printf("[GET_USER] Error finding user: %v", err)
				c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng!"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"user_id":       userIDVal,
			"first_name":    userDoc["first_name"],
			"last_name":     userDoc["last_name"],
			"email":         userDoc["email"],
			"phone":         userDoc["phone"],
			"citizen_id":    userDoc["citizen_id"],
			"gender":        userDoc["gender"],
			"date_of_birth": userDoc["date_of_birth"],
			"province":      userDoc["province"],
			"city":          userDoc["city"],
			"district":      userDoc["district"],
			"sub_district":  userDoc["sub_district"],
			"house_number":  userDoc["house_number"],
			"role":          userDoc["role"],
		})
	}
}

// UpdateUserInfoMongo - Cập nhật thông tin user
func UpdateUserInfoMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Không có thông tin người dùng!"})
			return
		}

		userIDVal := userIDStr.(string)

		// Parse request body
		var updateData struct {
			FirstName   string `json:"first_name" bson:"first_name"`
			LastName    string `json:"last_name" bson:"last_name"`
			Email       string `json:"email" bson:"email"`
			Phone       string `json:"phone" bson:"phone"`
			CitizenID   string `json:"citizen_id" bson:"citizen_id"`
			Gender      string `json:"gender" bson:"gender"`
			DateOfBirth string `json:"date_of_birth" bson:"date_of_birth"`
			Province    string `json:"province" bson:"province"`
			City        string `json:"city" bson:"city"`
			District    string `json:"district" bson:"district"`
			SubDistrict string `json:"sub_district" bson:"sub_district"`
			HouseNumber string `json:"house_number" bson:"house_number"`
			Avatar      string `json:"avatar" bson:"avatar"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			log.Printf("[UPDATE_USER] Error binding JSON: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Build update document
		updateDoc := bson.M{
			"first_name":    updateData.FirstName,
			"last_name":     updateData.LastName,
			"email":         updateData.Email,
			"phone":         updateData.Phone,
			"citizen_id":    updateData.CitizenID,
			"gender":        updateData.Gender,
			"date_of_birth": updateData.DateOfBirth,
			"province":      updateData.Province,
			"city":          updateData.City,
			"district":      updateData.District,
			"sub_district":  updateData.SubDistrict,
			"house_number":  updateData.HouseNumber,
		}

		if updateData.Avatar != "" {
			updateDoc["avatar"] = updateData.Avatar
		}

		// Try to find user by ID (can be int or string)
		var userID interface{} = userIDVal
		if intVal, err := strconv.Atoi(userIDVal); err == nil {
			userID = intVal
		} else if objID, err := primitive.ObjectIDFromHex(userIDVal); err == nil {
			userID = objID
		}

		// Update user
		result, err := collection.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{"$set": updateDoc})
		if err != nil {
			log.Printf("[UPDATE_USER] Error updating user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật thông tin!"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cập nhật thông tin thành công!"})
	}
}

// ======== Deprecated GORM handlers - sẽ xóa sau ========

// Deprecated: These functions have been migrated to MongoDB above.
// The old GORM versions in handler_users.go are kept for reference only.
