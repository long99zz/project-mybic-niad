package handlers

import (
    "net/http"
    "strconv"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)

// GetPosts godoc
// @Summary Lấy danh sách bài viết
// @Tags Post
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Limit per page"
// @Param category_id query int false "Category ID"
// @Param status query string false "Status"
// @Success 200 {object} map[string]interface{}
// @Router /api/posts [get]
func GetPosts(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
        categoryID := c.Query("category_id")
        status := c.Query("status")
        
        offset := (page - 1) * limit
        
        query := db.Model(&models.Post{})
        
        if categoryID != "" {
            query = query.Where("category_id = ?", categoryID)
        }
        
        if status != "" {
            query = query.Where("status = ?", status)
        }
        
        var posts []models.Post
        var total int64
        
        query.Count(&total)
        query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&posts)
        
        c.JSON(http.StatusOK, gin.H{
            "posts": posts,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + int64(limit) - 1) / int64(limit),
        })
    }
}

// GetPost godoc
// @Summary Lấy bài viết theo ID
// @Tags Post
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.Post
// @Failure 404 {object} map[string]interface{}
// @Router /api/posts/{id} [get]
func GetPost(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var post models.Post
        
        if err := db.First(&post, id).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài viết"})
            return
        }
        
        // Tăng lượt xem
        db.Model(&post).Update("views", post.Views+1)
        
        c.JSON(http.StatusOK, post)
    }
}

// Thêm bài viết
// AddPost godoc
// @Summary Thêm bài viết
// @Tags Post
// @Accept json
// @Produce json
// @Param post body models.Post true "Post info"
// @Success 200 {object} models.Post
// @Failure 400 {object} map[string]interface{}
// @Router /api/posts [post]
func AddPost(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var post models.Post
        if err := c.ShouldBindJSON(&post); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        
        // Validate required fields
        if post.Title == "" || post.Content == "" || post.Author == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Tiêu đề, nội dung và tác giả là bắt buộc"})
            return
        }
        
        if err := db.Create(&post).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể thêm bài viết"})
            return
        }
        
        c.JSON(http.StatusCreated, post)
    }
}

// Sửa bài viết
// UpdatePost godoc
// @Summary Sửa bài viết
// @Tags Post
// @Accept json
// @Produce json
// @Param id path int true "Post ID"
// @Param post body models.Post true "Post info"
// @Success 200 {object} models.Post
// @Failure 400 {object} map[string]interface{}
// @Router /api/posts/{id} [put]
func UpdatePost(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var post models.Post
        if err := db.First(&post, id).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài viết"})
            return
        }
        
        var input models.Post
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        
        // Validate required fields
        if input.Title == "" || input.Content == "" || input.Author == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Tiêu đề, nội dung và tác giả là bắt buộc"})
            return
        }
        
        if err := db.Model(&post).Updates(input).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật bài viết"})
            return
        }
        
        c.JSON(http.StatusOK, post)
    }
}

// Xóa bài viết
// DeletePost godoc
// @Summary Xóa bài viết
// @Tags Post
// @Param id path int true "Post ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/posts/{id} [delete]
func DeletePost(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        if err := db.Delete(&models.Post{}, id).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể xóa bài viết"})
            return
        }
        c.JSON(http.StatusOK, gin.H{"message": "Đã xóa bài viết"})
    }
}