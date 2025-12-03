package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middlewares"
	"context"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// Global MongoDB client and database
var (
	mongoClient *mongo.Client
	mongoDB     *mongo.Database
)

func main() {
	// 🔹 Load config
	cfg := config.LoadConfig()

	// 🔹 Kết nối MongoDB
	client, err := config.ConnectMongoDB(cfg)
	if err != nil {
		log.Fatal("Không thể kết nối MongoDB:", err)
	}
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Printf("Lỗi khi ngắt kết nối MongoDB: %v", err)
		}
	}()

	// Set global MongoDB client and database
	mongoClient = client
	mongoDB = client.Database(cfg.DBName)

	log.Printf("✅ Sử dụng database: %s", cfg.DBName)

	router := gin.Default()

	// Thêm middleware CORS cho phép frontend truy cập
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // hoặc "*" nếu muốn cho tất cả
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 🔹 Định nghĩa API đăng ký & đăng nhập (MongoDB)
	router.POST("/register", handlers.RegisterUserMongo(mongoDB))
	router.POST("/login", handlers.LoginUserMongo(mongoDB))

	// 🔹 Nhóm API không yêu cầu xác thực
	publicRouter := router.Group("/api")
	publicRouter.POST("/register", handlers.RegisterUserMongo(mongoDB))
	publicRouter.POST("/login", handlers.LoginUserMongo(mongoDB))

	// 🔹 Nhóm API yêu cầu xác thực bằng JWT
	apiRouter := router.Group("/api")
	apiRouter.Use(middlewares.AuthMiddleware())

	apiRouter.GET("/user", handlers.GetUserInfoMongo(mongoDB))                        // Lấy thông tin user (MongoDB)
	apiRouter.PUT("/user", handlers.UpdateUserInfoMongo(mongoDB))                     // Cập nhật thông tin user (MongoDB)
	apiRouter.POST("/user/change-password", handlers.ChangePasswordMongo(mongoDB))    // Đổi mật khẩu (MongoDB)
	apiRouter.GET("/invoice-detail/:id", handlers.GetInvoiceDetailUserMongo(mongoDB)) // Lấy chi tiết đơn hàng cho user (MongoDB)
	apiRouter.GET("/products", handlers.GetProductsMongo(mongoDB))                    // Lấy danh sách sản phẩm (MongoDB)
	apiRouter.GET("/products/:id", handlers.GetProductMongo(mongoDB))                 // Lấy chi tiết sản phẩm (MongoDB)
	apiRouter.POST("/products", handlers.AddProductMongo(mongoDB))                    // Thêm sản phẩm (MongoDB)
	apiRouter.PUT("/products/:id", handlers.UpdateProductMongo(mongoDB))              // Cập nhật sản phẩm (MongoDB)
	apiRouter.DELETE("/products/:id", handlers.DeleteProductMongo(mongoDB))           // Xóa sản phẩm (MongoDB)
	apiRouter.GET("/categories", handlers.GetCategoriesMongo(mongoDB))                // Lấy danh sách danh mục (MongoDB)
	apiRouter.GET("/categories/:id", handlers.GetCategoryMongo(mongoDB))              // Lấy chi tiết danh mục (MongoDB)
	apiRouter.POST("/categories", handlers.AddCategoryMongo(mongoDB))                 // Thêm danh mục (MongoDB)
	apiRouter.PUT("/categories/:id", handlers.UpdateCategoryMongo(mongoDB))           // Cập nhật danh mục (MongoDB)
	apiRouter.DELETE("/categories/:id", handlers.DeleteCategoryMongo(mongoDB))        // Xóa danh mục (MongoDB)
	// Quản lý bài viết (post) - MongoDB
	apiRouter.POST("/posts", handlers.AddPostMongo(mongoDB))       // Thêm bài viết (MongoDB)
	apiRouter.PUT("/posts/:id", handlers.UpdatePostMongo(mongoDB)) // Cập nhật bài viết (MongoDB)
	// Nếu có hàm xóa:
	// apiRouter.DELETE("/posts/:id", handlers.DeletePost(mongoDB))
	// Thêm API lấy danh sách hóa đơn của user hiện tại
	apiRouter.GET("/my-invoices", handlers.GetMyInvoicesMongo(mongoDB)) // Lấy danh sách hóa đơn của user (MongoDB)
	// Đăng ký API lấy giỏ hàng
	apiRouter.GET("/cart", handlers.GetCartMongo(mongoDB))                           // Lấy giỏ hàng (MongoDB)
	apiRouter.DELETE("/cart/:invoice_id", handlers.DeleteCartByMasterMongo(mongoDB)) // Xoá đơn hàng khỏi giỏ (MongoDB) - master-based

	// Payment APIs - Stripe (MongoDB)
	apiRouter.POST("/payment/create", handlers.CreateStripeCheckoutMongo(mongoDB))  // Tạo Stripe Checkout Session
	apiRouter.POST("/payment/stripe/webhook", handlers.StripeWebhookMongo(mongoDB)) // Stripe Webhook
	// Stripe callback không cần auth
	router.GET("/api/payment/stripe/return", handlers.StripeReturnMongo(mongoDB))

	// Insurance APIs - Now with MongoDB implementation
	carapi := router.Group("/api/insurance_car_owner", middlewares.AuthMiddleware())
	{
		carapi.POST("/create_invoice", handlers.CreateInvoice(mongoDB))
		carapi.POST("/create_car_insurance_form", handlers.CreateCarInsuranceForm(mongoDB))
		carapi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		carapi.POST("/confirm_purchase", handlers.ConfirmPurchase(mongoDB))
		carapi.POST("/create_vehicle_insurance_form", handlers.CreateVehicleInsuranceForm(mongoDB))
	}
	motorbikeApi := router.Group("/api/insurance_motorbike_owner", middlewares.AuthMiddleware())
	{
		motorbikeApi.POST("/create_invoice", handlers.CreateInvoice(mongoDB))
		motorbikeApi.POST("/create_motorbike_insurance_form", handlers.CreateMotorbikeInsuranceForm(mongoDB))
		motorbikeApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		motorbikeApi.POST("/confirm_purchase", handlers.ConfirmPurchase(mongoDB))
	}
	cancerApi := router.Group("/api/insurance_cancer", middlewares.AuthMiddleware())
	{
		cancerApi.POST("/create_invoice", handlers.CreateInvoice(mongoDB))
		cancerApi.POST("/create_insurance_participant_info", handlers.CreateInsuranceParticipantInfo(mongoDB))
		cancerApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		cancerApi.POST("/confirm_purchase", handlers.ConfirmPurchase(mongoDB))
	}
	personalApi := router.Group("/api/insurance_personal", middlewares.AuthMiddleware())
	{
		personalApi.POST("/create_invoice", handlers.CreateInvoice(mongoDB))
		personalApi.POST("/create_personal_insurance_form", handlers.CreatePersonalInsuranceForm(mongoDB))
		personalApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		personalApi.POST("/confirm_purchase", handlers.ConfirmPurchase(mongoDB))
	}
	travelApi := router.Group("/api/insurance_travel", middlewares.AuthMiddleware())
	{
		travelApi.POST("/create_travel_invoice", handlers.CreateTravelInsuranceInvoice(mongoDB))
		travelApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		travelApi.POST("/update_invoice_customer", handlers.UpdateTravelInvoiceCustomer(mongoDB))
	}
	accidentApi := router.Group("/api/insurance_accident", middlewares.AuthMiddleware())
	{
		accidentApi.POST("/create_accident", handlers.CreateAccidentInsuranceInvoice(mongoDB))
		accidentApi.POST("/create_personal_form", handlers.CreatePersonalInsuranceForm(mongoDB))
		accidentApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		accidentApi.POST("/update_invoice_customer", handlers.UpdateInvoiceCustomer(mongoDB))
		accidentApi.POST("/confirm_purchase", handlers.ConfirmPurchase(mongoDB))
	}
	homeApi := router.Group("/api/insurance_home", middlewares.AuthMiddleware())
	{
		homeApi.POST("/create_home_invoice", handlers.CreateHomeInsuranceInvoice(mongoDB))
		homeApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(mongoDB))
		homeApi.POST("/update_invoice_customer", handlers.UpdateHomeInvoiceCustomer(mongoDB))
	}
	// filepath: d:\project\back-end\main.go
	// Admin API routes - Now with MongoDB implementation
	adminApi := router.Group("/api/admin", middlewares.AuthMiddleware())

	// ===== DASHBOARD & STATISTICS =====
	adminApi.GET("/dashboard/stats", handlers.AdminGetDashboardStats(mongoDB))
	adminApi.GET("/dashboard/revenue-by-month", handlers.AdminGetRevenueByMonth(mongoDB))
	adminApi.GET("/dashboard/orders-by-product", handlers.AdminGetOrdersByProduct(mongoDB))
	adminApi.GET("/statistics/monthly", handlers.AdminGetMonthlyStatistics(mongoDB))
	adminApi.GET("/statistics/products", handlers.AdminGetProductStatistics(mongoDB))
	adminApi.GET("/product-statistics", handlers.AdminGetProductStatistics(mongoDB))

	// ===== ORDER MANAGEMENT =====
	adminApi.GET("/all-invoices", handlers.AdminSelectAllInvoices(mongoDB))
	adminApi.GET("/invoice-detail", handlers.AdminGetInvoiceDetail(mongoDB))
	adminApi.GET("/orders/:id", handlers.AdminGetOrderDetail(mongoDB))
	adminApi.PUT("/orders/:id/status", handlers.AdminUpdateOrderStatus(mongoDB))
	adminApi.DELETE("/orders/:id", handlers.AdminDeleteOrder(mongoDB))

	// Old routes (keep for backward compatibility)
	adminApi.PUT("/invoice/:id/status", handlers.AdminUpdateInvoiceStatus(mongoDB))
	adminApi.PUT("/invoice/:id/revert-status", handlers.AdminRevertInvoiceStatus(mongoDB))
	adminApi.DELETE("/invoice/:id", handlers.AdminDeleteInvoice(mongoDB))
	adminApi.DELETE("/travel-invoice/:id", handlers.AdminDeleteTravelInvoice(mongoDB))
	adminApi.PUT("/travel-invoice/:id/status", handlers.AdminUpdateTravelInvoiceStatus(mongoDB))
	adminApi.DELETE("/home-invoice/:id", handlers.AdminDeleteHomeInvoice(mongoDB))
	adminApi.PUT("/home-invoice/:id/status", handlers.AdminUpdateHomeInvoiceStatus(mongoDB))
	adminApi.DELETE("/accident-invoice/:id", handlers.AdminDeleteAccidentInvoice(mongoDB))
	adminApi.PUT("/accident-invoice/:id/status", handlers.AdminUpdateAccidentInvoiceStatus(mongoDB))

	// ===== USER MANAGEMENT =====
	adminApi.GET("/users", handlers.AdminGetAllUsers(mongoDB))
	adminApi.GET("/users/:id", handlers.AdminGetUserDetail(mongoDB))
	adminApi.PUT("/users/:id", handlers.AdminUpdateUser(mongoDB))
	adminApi.DELETE("/users/:id", handlers.AdminDeleteUser(mongoDB))

	// ===== PRODUCT MANAGEMENT =====
	adminApi.GET("/products", handlers.AdminGetAllProducts(mongoDB))
	adminApi.GET("/products/:id", handlers.AdminGetProductDetail(mongoDB))
	adminApi.POST("/products", handlers.AdminCreateProduct(mongoDB))
	adminApi.PUT("/products/:id", handlers.AdminUpdateProduct(mongoDB))
	adminApi.DELETE("/products/:id", handlers.AdminDeleteProduct(mongoDB))

	adminApi.GET("/search-customers-by-date", handlers.AdminSearchCustomersByDate(mongoDB))

	// Debug endpoint to check users collection
	router.GET("/debug-users", func(c *gin.Context) {
		usersCollection := mongoDB.Collection("users")
		cursor, err := usersCollection.Find(context.Background(), map[string]interface{}{})
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(context.Background())

		var users []interface{}
		if err := cursor.All(context.Background(), &users); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"users": users, "count": len(users)})
	})

	router.GET("/debug-products", func(c *gin.Context) {
		productsCollection := mongoDB.Collection("products")
		cursor, err := productsCollection.Find(context.Background(), map[string]interface{}{})
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(context.Background())

		var products []interface{}
		if err := cursor.All(context.Background(), &products); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"products": products, "count": len(products)})
	})

	router.GET("/debug-invoices", func(c *gin.Context) {
		invoicesCollection := mongoDB.Collection("invoices")
		cursor, err := invoicesCollection.Find(context.Background(), map[string]interface{}{})
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(context.Background())

		var invoices []interface{}
		if err := cursor.All(context.Background(), &invoices); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"invoices": invoices, "count": len(invoices)})
	})

	//apiRouter.POST("/form-fields", handlers.CreateField(mongoDB))
	//apiRouter.PUT("/form-fields/:id", handlers.UpdateField(mongoDB))
	//apiRouter.DELETE("/form-fields/:id", handlers.DeleteField(mongoDB))
	// 🔹 Khởi chạy server
	router.Run(":5000")
}
