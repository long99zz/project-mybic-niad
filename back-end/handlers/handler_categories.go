package handlers

import (
	"backend/models"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AddCategory(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var category models.Category
		category.Name = c.PostForm("name")
		category.Status = c.PostForm("status")

		if len(category.Name) == 0 || len(category.Name) > 255 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tên danh mục không hợp lệ!"})
			return
		}

		// Xử lý upload ảnh
		file, err := c.FormFile("image")
		if err == nil {
			ext := filepath.Ext(file.Filename)
			if ext != ".jpg" && ext != ".png" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ chấp nhận ảnh JPG, PNG!"})
				return
			}

			newFileName := uuid.New().String() + ext
			uploadPath := filepath.Join("upload", newFileName)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tải ảnh!"})
				return
			}
			category.Image = newFileName
		} else {
			category.Image = "default-product.jpg"
		}
		if err := db.Create(&category).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu danh mục vào MySQL"})
			return
		}
		db.Create(&category)
		c.JSON(http.StatusOK, gin.H{"message": "Thêm danh mục thành công!"})
	}
}

func UpdateCategory(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var category models.Category
		categoryID := c.Param("id")

		// Tìm danh mục cần cập nhật
		if db.First(&category, categoryID).Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Danh mục không tồn tại"})
			return
		}

		category.Name = c.PostForm("name")
		category.Status = c.PostForm("status")

		if len(category.Name) > 255 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tên danh mục tối đa 255 ký tự!"})
			return
		}

		// Xử lý upload ảnh mới
		file, err := c.FormFile("image")
		if err == nil {
			ext := filepath.Ext(file.Filename)
			if ext != ".jpg" && ext != ".png" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ chấp nhận ảnh JPG, PNG!"})
				return
			}

			newFileName := uuid.New().String() + ext
			uploadPath := filepath.Join("upload", newFileName)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tải ảnh!"})
				return
			}
			category.Image = newFileName
		}

		db.Save(&category)
		c.JSON(http.StatusOK, gin.H{"message": "Cập nhật danh mục thành công!"})
	}
}

func DeleteCategory(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var category models.Category
		categoryID := c.Param("id")

		// Kiểm tra nếu danh mục có sản phẩm
		var productCount int64
		db.Model(&models.Product{}).Where("category_id = ?", categoryID).Count(&productCount)

		if productCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Không thể xóa danh mục tồn tại sản phẩm"})
			return
		}

		// Xóa danh mục
		if db.Delete(&category, categoryID).Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Xóa danh mục thất bại"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa danh mục thành công!"})
	}
}
func GetCategories(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []models.Category

		// Get all categories (GORM version - deprecated)
		db.Find(&categories)

		// TODO: Get product count from MongoDB products collection
		// For now, QtyProduct is calculated in the model or left as 0

		c.JSON(http.StatusOK, categories)
	}
}
