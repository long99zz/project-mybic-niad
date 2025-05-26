package main

import (
	"backend/handlers"
	"backend/middlewares"
	"backend/models"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// 🔹 Kết nối MySQL
	dsn := "root:long0910@tcp(localhost:3308)/bic_web?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Không thể kết nối MySQL:", err)
	}

	sqlDB, _ := db.DB()
	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Không thể kết nối MySQL - Ping thất bại:", err)
	} else {
		log.Println("✅ Đã kết nối thành công với MySQL!")
	}

	// 🔹 Tự động migrate để đảm bảo bảng tồn tại
	db.AutoMigrate(&models.User{}, &models.Product{}, &models.Category{})

	router := gin.Default()

	// 🔹 Định nghĩa API đăng ký & đăng nhập
	router.POST("/register", handlers.RegisterUser(db))
	router.POST("/login", handlers.LoginUser(db))

	// 🔹 Nhóm API yêu cầu xác thực bằng JWT
	apiRouter := router.Group("/api")
	apiRouter.Use(middlewares.AuthMiddleware()) 

	apiRouter.GET("/user", handlers.GetUserInfo(db))  // Lấy thông tin user
	apiRouter.GET("/products", handlers.GetProducts(db))
	apiRouter.POST("/products", handlers.AddProduct(db))
	apiRouter.PUT("/products/:id", handlers.UpdateProduct(db))
	apiRouter.DELETE("/products/:id", handlers.DeleteProduct(db))
	apiRouter.GET("/categories", handlers.GetCategories(db))
	apiRouter.POST("/categories", handlers.AddCategory(db))
	apiRouter.PUT("/categories/:id", handlers.UpdateCategory(db))
	apiRouter.DELETE("/categories/:id", handlers.DeleteCategory(db))
	api := router.Group("/api/insurance_car_owner", middlewares.AuthMiddleware()) // thông tin bảo hiểm trách nhiệm dân sự xe ô tô
    {
        api.POST("/create_invoice", handlers.CreateInvoice(db)) // Lưu hóa đơn
        api.POST("/create_car_insurance_form", handlers.CreateCarInsuranceForm(db)) // Lưu bảo hiểm xe
        api.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Lưu khách hàng
        api.POST("/confirm_purchase", handlers.ConfirmPurchase(db)) // Xác nhận mua hàng
    }

	//apiRouter.POST("/form-fields", handlers.CreateField(db))
	//apiRouter.PUT("/form-fields/:id", handlers.UpdateField(db))
	//apiRouter.DELETE("/form-fields/:id", handlers.DeleteField(db))
	// 🔹 Khởi chạy server
	router.Run(":5000")
}