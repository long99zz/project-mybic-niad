package handlers

import (
	"backend/models"
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// AddCategoryMongo - Thêm danh mục mới
func AddCategoryMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("categories")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var category models.Category
		category.Name = c.PostForm("name")
		category.Status = c.PostForm("status")

		// Validate name
		if len(category.Name) == 0 || len(category.Name) > 255 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tên danh mục không hợp lệ!"})
			return
		}

		// Handle file upload
		file, err := c.FormFile("image")
		if err == nil {
			ext := filepath.Ext(file.Filename)
			if ext != ".jpg" && ext != ".png" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ chấp nhận ảnh JPG, PNG!"})
				return
			}

			uploadDir := "upload/categories"
			if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
				os.MkdirAll(uploadDir, os.ModePerm)
			}

			newFileName := uuid.New().String() + ext
			uploadPath := filepath.Join(uploadDir, newFileName)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tải ảnh!"})
				return
			}
			category.Image = "categories/" + newFileName
		} else {
			category.Image = "categories/default-product.jpg"
		}

		// Set MongoDB fields
		category.ID = primitive.NewObjectID()
		category.CreatedAt = time.Now()
		category.UpdatedAt = time.Now()

		// Insert category
		_, err = collection.InsertOne(ctx, category)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu danh mục!"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Thêm danh mục thành công!",
			"id":      category.ID.Hex(),
		})
	}
}

// UpdateCategoryMongo - Cập nhật danh mục
func UpdateCategoryMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("categories")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		categoryIDStr := c.Param("id")
		categoryID, err := primitive.ObjectIDFromHex(categoryIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID danh mục không hợp lệ!"})
			return
		}

		// Check if category exists
		var existingCategory models.Category
		err = collection.FindOne(ctx, bson.M{"_id": categoryID}).Decode(&existingCategory)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Danh mục không tồn tại"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra danh mục!"})
			return
		}

		// Update fields
		name := c.PostForm("name")
		status := c.PostForm("status")

		if len(name) > 255 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tên danh mục tối đa 255 ký tự!"})
			return
		}

		// Update object
		update := bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
		}

		if name != "" {
			update["$set"].(bson.M)["name"] = name
		}
		if status != "" {
			update["$set"].(bson.M)["status"] = status
		}

		// Handle image upload
		file, err := c.FormFile("image")
		if err == nil {
			ext := filepath.Ext(file.Filename)
			if ext != ".jpg" && ext != ".png" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ chấp nhận ảnh JPG, PNG!"})
				return
			}

			uploadDir := "upload/categories"
			if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
				os.MkdirAll(uploadDir, os.ModePerm)
			}

			newFileName := uuid.New().String() + ext
			uploadPath := filepath.Join(uploadDir, newFileName)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tải ảnh!"})
				return
			}
			update["$set"].(bson.M)["image"] = "categories/" + newFileName
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": categoryID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi cập nhật danh mục!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cập nhật danh mục thành công!"})
	}
}

// DeleteCategoryMongo - Xóa danh mục
func DeleteCategoryMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryCollection := db.Collection("categories")
		productCollection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		categoryIDStr := c.Param("id")
		categoryID, err := primitive.ObjectIDFromHex(categoryIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID danh mục không hợp lệ!"})
			return
		}

		// Check if category has products
		productCount, err := productCollection.CountDocuments(ctx, bson.M{"category_id": categoryID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra sản phẩm!"})
			return
		}

		if productCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không thể xóa danh mục tồn tại sản phẩm"})
			return
		}

		// Delete category
		result, err := categoryCollection.DeleteOne(ctx, bson.M{"_id": categoryID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi xóa danh mục!"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Danh mục không tồn tại!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa danh mục thành công!"})
	}
}

// GetCategoriesMongo - Lấy danh sách danh mục với số lượng sản phẩm
func GetCategoriesMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryCollection := db.Collection("categories")
		productCollection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cursor, err := categoryCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh mục!"})
			return
		}
		defer cursor.Close(ctx)

		var categories []models.Category
		if err := cursor.All(ctx, &categories); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi đọc dữ liệu!"})
			return
		}

		// Count products for each category
		type CategoryWithCount struct {
			ID         primitive.ObjectID `bson:"_id"`
			Name       string             `bson:"name"`
			Status     string             `bson:"status"`
			Image      string             `bson:"image"`
			CreatedAt  time.Time          `bson:"created_at"`
			UpdatedAt  time.Time          `bson:"updated_at"`
			QtyProduct int64              `bson:"qty_product"`
		}

		var result []CategoryWithCount

		for _, category := range categories {
			count, err := productCollection.CountDocuments(ctx, bson.M{"category_id": category.ID})
			if err != nil {
				count = 0
			}

			result = append(result, CategoryWithCount{
				ID:         category.ID,
				Name:       category.Name,
				Status:     category.Status,
				Image:      category.Image,
				CreatedAt:  category.CreatedAt,
				UpdatedAt:  category.UpdatedAt,
				QtyProduct: count,
			})
		}

		c.JSON(http.StatusOK, result)
	}
}

// GetCategoryMongo - Lấy chi tiết danh mục
func GetCategoryMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("categories")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		categoryIDStr := c.Param("id")
		categoryID, err := primitive.ObjectIDFromHex(categoryIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID danh mục không hợp lệ!"})
			return
		}

		var category models.Category
		err = collection.FindOne(ctx, bson.M{"_id": categoryID}).Decode(&category)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Danh mục không tồn tại"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh mục!"})
			return
		}

		c.JSON(http.StatusOK, category)
	}
}
