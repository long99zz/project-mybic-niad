package handlers

import (
   "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "path/filepath"
    "github.com/google/uuid"
    "net/http"
	"backend/server/models"
	
)

// GetCategories godoc
// @Summary Lấy danh sách danh mục
// @Tags Category
// @Produce json
// @Success 200 {array} models.Category
// @Router /api/categories [get]
func GetCategories(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var categories []models.Category

        // Preload để lấy danh sách sản phẩm
        db.Preload("Products").Find(&categories)

        // Tính số lượng sản phẩm
        for i := range categories {
            categories[i].QtyProduct = len(categories[i].Products) //  Đếm số sản phẩm
            categories[i].Products = nil // Không gửi danh sách sản phẩm, chỉ gửi số lượng
        }

        c.JSON(http.StatusOK, categories)
    }
}

// AddCategory godoc
// @Summary Thêm danh mục
// @Tags Category
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Tên danh mục"
// @Param status formData string true "Trạng thái"
// @Param image formData file false "Ảnh danh mục"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/categories [post]
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

// UpdateCategory godoc
// @Summary Sửa danh mục
// @Tags Category
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Category ID"
// @Param name formData string false "Tên danh mục"
// @Param status formData string false "Trạng thái"
// @Param image formData file false "Ảnh danh mục"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/categories/{id} [put]
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

// DeleteCategory godoc
// @Summary Xóa danh mục
// @Tags Category
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/categories/{id} [delete]
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


