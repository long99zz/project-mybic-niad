package handlers

import (
    "fmt"
    "io"
    "net/http"
    "os"
    "path/filepath"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

// UploadImage godoc
// @Summary Upload image
// @Tags Upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/upload/image [post]
func UploadImage() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Lấy file từ form (CKEditor gửi với tên 'file')
        file, header, err := c.Request.FormFile("file")
        if err != nil {
            // Thử với tên 'upload' nếu 'file' không có
            file, header, err = c.Request.FormFile("upload")
            if err != nil {
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": "Không tìm thấy file upload",
                })
                return
            }
        }
        defer file.Close()

        // Kiểm tra loại file
        ext := strings.ToLower(filepath.Ext(header.Filename))
        allowedTypes := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
        
        isAllowed := false
        for _, allowedType := range allowedTypes {
            if ext == allowedType {
                isAllowed = true
                break
            }
        }

        if !isAllowed {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)",
            })
            return
        }

        // Kiểm tra kích thước file (max 5MB)
        if header.Size > 5*1024*1024 {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "File quá lớn, tối đa 5MB",
            })
            return
        }

        // Tạo thư mục upload
        uploadDir := "../upload/posts"
        if err := os.MkdirAll(uploadDir, 0755); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Không thể tạo thư mục upload",
            })
            return
        }

        // Tạo tên file unique
        uniqueID := uuid.New().String()
        filename := fmt.Sprintf("%s_%d%s", uniqueID, time.Now().Unix(), ext)
        filePath := filepath.Join(uploadDir, filename)

        // Tạo file đích
        dst, err := os.Create(filePath)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Không thể tạo file",
            })
            return
        }
        defer dst.Close()

        // Copy file
        if _, err := io.Copy(dst, file); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Không thể lưu file",
            })
            return
        }

        // Trả về URL tuyệt đối cho frontend
        imageURL := fmt.Sprintf("http://localhost:5000/upload/posts/%s", filename)
        c.JSON(http.StatusOK, gin.H{
            "url": imageURL,
        })
    }
}