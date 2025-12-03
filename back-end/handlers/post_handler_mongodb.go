package handlers

import (
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddPostMongo - Thêm bài viết mới
func AddPostMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("posts")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var post models.Post
		if err := c.ShouldBindJSON(&post); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: Get user_id from JWT and associate with post
		// Note: Post model doesn't currently have a UserID field

		// Set MongoDB fields
		post.ID = primitive.NewObjectID()
		post.CreatedAt = time.Now()
		post.UpdatedAt = time.Now()

		_, err := collection.InsertOne(ctx, post)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể thêm bài viết"})
			return
		}

		c.JSON(http.StatusCreated, post)
	}
}

// UpdatePostMongo - Cập nhật bài viết
func UpdatePostMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("posts")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		postIDStr := c.Param("id")
		postID, err := primitive.ObjectIDFromHex(postIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID bài viết không hợp lệ!"})
			return
		}

		// Check if post exists
		var existingPost models.Post
		err = collection.FindOne(ctx, bson.M{"_id": postID}).Decode(&existingPost)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài viết"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi kiểm tra bài viết!"})
			return
		}

		var input models.Post
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Prepare update
		update := bson.M{
			"$set": bson.M{
				"title":      input.Title,
				"content":    input.Content,
				"status":     input.Status,
				"updated_at": time.Now(),
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": postID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi cập nhật bài viết!"})
			return
		}

		// Return updated post
		var updatedPost models.Post
		collection.FindOne(ctx, bson.M{"_id": postID}).Decode(&updatedPost)
		c.JSON(http.StatusOK, updatedPost)
	}
}

// DeletePostMongo - Xóa bài viết
func DeletePostMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("posts")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		postIDStr := c.Param("id")
		postID, err := primitive.ObjectIDFromHex(postIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID bài viết không hợp lệ!"})
			return
		}

		result, err := collection.DeleteOne(ctx, bson.M{"_id": postID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi xóa bài viết!"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Bài viết không tồn tại!"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Xóa bài viết thành công!"})
	}
}

// GetPostsMongo - Lấy danh sách bài viết với pagination
func GetPostsMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("posts")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		page := int64(1)
		limit := int64(10)

		opts := options.Find().
			SetSkip((page - 1) * limit).
			SetLimit(limit).
			SetSort(bson.M{"created_at": -1})

		cursor, err := collection.Find(ctx, bson.M{}, opts)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn bài viết!"})
			return
		}
		defer cursor.Close(ctx)

		var posts []models.Post
		if err := cursor.All(ctx, &posts); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi đọc dữ liệu!"})
			return
		}

		total, err := collection.CountDocuments(ctx, bson.M{})
		if err != nil {
			total = 0
		}

		c.JSON(http.StatusOK, gin.H{
			"data":  posts,
			"total": total,
			"page":  page,
			"limit": limit,
		})
	}
}

// GetPostMongo - Lấy chi tiết bài viết
func GetPostMongo(db *mongo.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		collection := db.Collection("posts")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		postIDStr := c.Param("id")
		postID, err := primitive.ObjectIDFromHex(postIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID bài viết không hợp lệ!"})
			return
		}

		var post models.Post
		err = collection.FindOne(ctx, bson.M{"_id": postID}).Decode(&post)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài viết"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn bài viết!"})
			return
		}

		c.JSON(http.StatusOK, post)
	}
}
