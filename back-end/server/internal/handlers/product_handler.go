package handlers

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "backend/server/models"
    "net/http"
    "path/filepath"
    "os"
    "log"
    "github.com/google/uuid"
    "strconv"
)

// GetProducts godoc
// @Summary Lấy danh sách sản phẩm
// @Tags Product
// @Produce json
// @Success 200 {array} models.Product
// @Router /api/products [get]
func GetProducts(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var products []models.Product

        keyword := c.Query("keyword")
        categoryID := c.Query("category_id")

        query := db
        if keyword != "" {
            query = query.Where("name LIKE ?", "%"+keyword+"%")
        }
        if categoryID != "" {
            query = query.Where("category_id = ?", categoryID)
        }

        query.Find(&products)
        c.JSON(http.StatusOK, products)
    }
}

// AddProduct godoc
// @Summary Thêm sản phẩm
// @Tags Product
// @Accept json
// @Produce json
// @Param product body models.Product true "Product info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/products [post]
func AddProduct(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var p models.Product


        if c.ContentType() == "application/json" {
            if err := c.ShouldBindJSON(&p); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu JSON không hợp lệ!", "detail": err.Error()})
                return
            }
        } else {
            p.Name = c.PostForm("name")
            p.Quantity, _ = strconv.Atoi(c.PostForm("quantity"))
            p.Price, _ = strconv.ParseFloat(c.PostForm("price"), 64)
            p.SalePrice, _ = strconv.ParseFloat(c.PostForm("sale_price"), 64)
            p.GeneralInfo = c.PostForm("general_info")
            p.ClaimGuidelines = c.PostForm("claim_guidelines")
            p.InsuranceBenefits = c.PostForm("insurance_benefits")
            p.InsuranceFee = c.PostForm("insurance_fee")
            p.FormRules   = c.PostForm("form_rules")
            categoryIDStr := c.PostForm("category_id")
            categoryID, err := strconv.Atoi(categoryIDStr)
            if err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "category_id phải là số!"})
                return
            }
            p.CategoryID = uint(categoryID)
        }


        if p.Price < 0 || p.Quantity < 0 || p.SalePrice < 0 || p.SalePrice > p.Price {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }


        var category models.Category
            if err := db.Where("category_id = ?", p.CategoryID).Order("category_id").First(&category).Error; err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Danh mục không tồn tại!", "detail": err.Error()})
                return
            }





        file, err := c.FormFile("image")
        if err == nil {
            ext := filepath.Ext(file.Filename)
            if ext != ".jpg" && ext != ".png" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Chỉ chấp nhận ảnh JPG, PNG!"})
                return
            }

            uploadDir := "upload/product"
            if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
                os.MkdirAll(uploadDir, os.ModePerm)
            }

            newFileName := uuid.New().String() + ext
            uploadPath := filepath.Join(uploadDir, newFileName)

            if err := c.SaveUploadedFile(file, uploadPath); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tải ảnh!"})
                return
            }
            p.Image = "product/" + newFileName
        } else {
            p.Image = "product/default-product.jpg"
        }


        if err := db.Create(&p).Error; err != nil {
            log.Println(" Lỗi khi lưu sản phẩm:", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu sản phẩm vào MySQL", "detail": err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Thêm sản phẩm thành công!"})
    }
}

// UpdateProduct godoc
// @Summary Sửa sản phẩm
// @Tags Product
// @Accept json
// @Produce json
// @Param id path int true "Product ID"
// @Param product body models.Product true "Product info"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/products/{id} [put]
func UpdateProduct(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var p models.Product
        productID := c.Param("id")

        if db.First(&p, productID).Error != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Sản phẩm không tồn tại"})
            return
        }

        if err := c.ShouldBindJSON(&p); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        if p.Price < 0 || p.Quantity < 0 || p.SalePrice < 0 || p.SalePrice > p.Price {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }

        db.Save(&p)
        c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sản phẩm thành công!"})
    }
}

// DeleteProduct godoc
// @Summary Xóa sản phẩm
// @Tags Product
// @Param id path int true "Product ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/products/{id} [delete]
func DeleteProduct(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {

        productID := c.Param("id")


        var product models.Product
        if err := db.Where("product_id = ?", productID).First(&product).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Sản phẩm không tồn tại!", "detail": err.Error()})
            return
        }

        if err := db.Delete(&product).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa sản phẩm!", "detail": err.Error()})
            return
        }


        c.JSON(http.StatusOK, gin.H{"message": "Xóa sản phẩm thành công!"})
    }
}
