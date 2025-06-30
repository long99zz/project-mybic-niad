package handlers

import (
    "net/http"
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
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
        if err := db.Create(&post).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể thêm bài viết"})
            return
        }
        c.JSON(http.StatusOK, post)
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
        db.Model(&post).Updates(input)
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