package handlers

import (
	"backend/models"
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddProductMongo - Thêm sản phẩm mới
func AddProductMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("products")
		categoryCollection := db.Collection("categories")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

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
			categoryID, err := primitive.ObjectIDFromHex(categoryIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "category_id không hợp lệ!"})
				return
			}
			p.CategoryID = &categoryID
		}

		// Validate data
		if p.Price < 0 || p.Quantity < 0 || p.SalePrice < 0 || p.SalePrice > p.Price {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Check if category exists
		if p.CategoryID != nil {
			var category models.Category
			err := categoryCollection.FindOne(ctx, bson.M{"_id": p.CategoryID}).Decode(&category)
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Danh mục không tồn tại!"})
				return
			}
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra danh mục!"})
				return
			}
		}

		// Handle file upload
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

		// Set MongoDB fields
		p.ID = primitive.NewObjectID()
		p.CreatedAt = time.Now()
		p.UpdatedAt = time.Now()

		// Insert product
		_, err = collection.InsertOne(ctx, p)
		if err != nil {
			log.Println("Lỗi khi lưu sản phẩm:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu sản phẩm!", "detail": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Thêm sản phẩm thành công!",
			"id":      p.ID.Hex(),
		})
	}
}

// UpdateProductMongo - Cập nhật sản phẩm
func UpdateProductMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID sản phẩm không hợp lệ!"})
			return
		}

		// Check if product exists
		var existingProduct models.Product
		err = collection.FindOne(ctx, bson.M{"_id": productID}).Decode(&existingProduct)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Sản phẩm không tồn tại"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra sản phẩm!"})
			return
		}

		var updateData models.Product
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate data
		if updateData.Price < 0 || updateData.Quantity < 0 || updateData.SalePrice < 0 || updateData.SalePrice > updateData.Price {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ!"})
			return
		}

		// Prepare update
		update := bson.M{
			"$set": bson.M{
				"name":               updateData.Name,
				"quantity":           updateData.Quantity,
				"price":              updateData.Price,
				"sale_price":         updateData.SalePrice,
				"general_info":       updateData.GeneralInfo,
				"claim_guidelines":   updateData.ClaimGuidelines,
				"insurance_benefits": updateData.InsuranceBenefits,
				"insurance_fee":      updateData.InsuranceFee,
				"form_rules":         updateData.FormRules,
				"category_id":        updateData.CategoryID,
				"image":              updateData.Image,
				"updated_at":         time.Now(),
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": productID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi cập nhật sản phẩm!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sản phẩm thành công!"})
	}
}

// GetProductsMongo - Lấy danh sách sản phẩm với tìm kiếm và lọc
func GetProductsMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		keyword := c.Query("keyword")
		categoryIDStr := c.Query("category_id")
		pageStr := c.Query("page")
		limitStr := c.Query("limit")

		// Default pagination
		page := int64(1)
		limit := int64(10)

		if p, err := strconv.ParseInt(pageStr, 10, 64); err == nil && p > 0 {
			page = p
		}
		if l, err := strconv.ParseInt(limitStr, 10, 64); err == nil && l > 0 {
			limit = l
		}

		// Build filter
		filter := bson.M{}

		if keyword != "" {
			filter["name"] = bson.M{
				"$regex":   keyword,
				"$options": "i",
			}
		}

		if categoryIDStr != "" {
			categoryID, err := primitive.ObjectIDFromHex(categoryIDStr)
			if err == nil {
				filter["category_id"] = categoryID
			}
		}

		// Find products
		opts := options.Find().
			SetSkip((page - 1) * limit).
			SetLimit(limit).
			SetSort(bson.M{"created_at": -1})

		cursor, err := collection.Find(ctx, filter, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn sản phẩm!"})
			return
		}
		defer cursor.Close(ctx)

		var products []models.Product
		if err := cursor.All(ctx, &products); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi đọc dữ liệu!"})
			return
		}

		// Get total count
		total, err := collection.CountDocuments(ctx, filter)
		if err != nil {
			total = 0
		}

		c.JSON(http.StatusOK, gin.H{
			"data":  products,
			"total": total,
			"page":  page,
			"limit": limit,
		})
	}
}

// GetProductMongo - Lấy chi tiết sản phẩm
func GetProductMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID sản phẩm không hợp lệ!"})
			return
		}

		var product models.Product
		err = collection.FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Sản phẩm không tồn tại"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn sản phẩm!"})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

// DeleteProductMongo - Xóa sản phẩm
func DeleteProductMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("products")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		productIDStr := c.Param("id")
		productID, err := primitive.ObjectIDFromHex(productIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID sản phẩm không hợp lệ!"})
			return
		}

		// Check if product exists
		var product models.Product
		err = collection.FindOne(ctx, bson.M{"_id": productID}).Decode(&product)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Sản phẩm không tồn tại!"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra sản phẩm!"})
			return
		}

		// Delete product
		_, err = collection.DeleteOne(ctx, bson.M{"_id": productID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi xóa sản phẩm!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa sản phẩm thành công!"})
	}
}
