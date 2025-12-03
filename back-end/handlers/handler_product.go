package handlers

import (
	"backend/models"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gorm.io/gorm"
)

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
			p.FormRules = c.PostForm("form_rules")
			categoryIDStr := c.PostForm("category_id")
			if categoryIDStr != "" {
				if categoryOID, err := primitive.ObjectIDFromHex(categoryIDStr); err == nil {
					p.CategoryID = &categoryOID
				}
			}
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
