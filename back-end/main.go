package main

import (
	"backend/handlers"
	"backend/middlewares"
	"backend/models"
	"log"

	"github.com/gin-contrib/cors"
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

	// Thêm middleware CORS cho phép frontend truy cập
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // hoặc "*" nếu muốn cho tất cả
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

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
		carapi := router.Group("/api/insurance_car_owner") // thông tin bảo hiểm trách nhiệm dân sự xe ô tô
    {
        carapi.POST("/create_invoice", handlers.CreateInvoice(db)) // Lưu hóa đơn
        carapi.POST("/create_car_insurance_form", handlers.CreateCarInsuranceForm(db)) // Lưu bảo hiểm xe
        carapi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Lưu khách hàng
        carapi.POST("/confirm_purchase", handlers.ConfirmPurchase(db)) // Xác nhận mua hàng
		carapi.POST("/create_vehicle_insurance_form", handlers.CreateVehicleInsuranceForm(db)) // Lưu bảo hiểm vật chất xe ô tô
    }
		motorbikeApi := router.Group("/api/insurance_motorbike_owner", middlewares.AuthMiddleware())
	{
		motorbikeApi.POST("/create_invoice", handlers.CreateInvoice(db)) // Lưu hóa đơn
		motorbikeApi.POST("/create_motorbike_insurance_form", handlers.CreateMotorbikeInsuranceForm(db)) // Lưu bảo hiểm xe máy
		motorbikeApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Lưu khách hàng
		motorbikeApi.POST("/confirm_purchase", handlers.ConfirmPurchase(db)) // Xác nhận mua hàng
	}
	    cancerApi := router.Group("/api/insurance_cancer", middlewares.AuthMiddleware())
    {
        cancerApi.POST("/create_invoice", handlers.CreateInvoice(db)) // Lưu hóa đơn
        cancerApi.POST("/create_insurance_participant_info", handlers.CreateInsuranceParticipantInfo(db)) // Lưu thông tin người tham gia bảo hiểm ung thư
        cancerApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Lưu khách hàng
        cancerApi.POST("/confirm_purchase", handlers.ConfirmPurchase(db)) // Xác nhận mua hàng
    }
		personalApi := router.Group("/api/insurance_personal", middlewares.AuthMiddleware())
	{
		personalApi.POST("/create_invoice", handlers.CreateInvoice(db)) // Lưu hóa đơn
		personalApi.POST("/create_personal_insurance_form", handlers.CreatePersonalInsuranceForm(db)) // Lưu bảo hiểm sức khỏe cá nhân
		personalApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Lưu khách hàng
		personalApi.POST("/confirm_purchase", handlers.ConfirmPurchase(db)) // Xác nhận mua hàng
	}
		travelApi := router.Group("/api/insurance_travel", middlewares.AuthMiddleware())
	{
		travelApi.POST("/create_travel_invoice", handlers.CreateTravelInsuranceInvoice(db)) // Nhập hóa đơn du lịch
		travelApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Đăng ký khách hàng
		travelApi.POST("/update_invoice_customer", handlers.UpdateTravelInvoiceCustomer(db)) //  Gán customer_id vào hóa đơn
	}
		accidentApi := router.Group("/api/insurance_accident", middlewares.AuthMiddleware())
	{
		accidentApi.POST("/create_accident", handlers.CreateAccidentInsuranceInvoice(db))
		accidentApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db))
		accidentApi.POST("/update_invoice_customer", handlers.UpdateInvoiceCustomer(db))
	}
		homeApi := router.Group("/api/insurance_home", middlewares.AuthMiddleware())
	{
		homeApi.POST("/create_home_invoice", handlers.CreateHomeInsuranceInvoice(db)) // Nhập thông tin chung hóa đơn nhà
		homeApi.POST("/create_customer_registration", handlers.CreateCustomerRegistration(db)) // Đăng ký khách hàng
		homeApi.POST("/update_invoice_customer", handlers.UpdateHomeInvoiceCustomer(db)) // Gán customer_id vào hóa đơn nhà
	}
	// filepath: d:\project\back-end\main.go
	adminApi := router.Group("/api/admin", middlewares.AuthMiddleware())
	adminApi.GET("/all-invoices", handlers.AdminSelectAllInvoices(db))
	adminApi.GET("/invoice-detail", handlers.AdminGetInvoiceDetail(db))
	adminApi.GET("/product-statistics", handlers.AdminProductStatistics(db))
	adminApi.GET("/search-customers-by-date", handlers.AdminSearchCustomersByDate(db))
	//apiRouter.POST("/form-fields", handlers.CreateField(db))
	//apiRouter.PUT("/form-fields/:id", handlers.UpdateField(db))
	//apiRouter.DELETE("/form-fields/:id", handlers.DeleteField(db))
	// 🔹 Khởi chạy server
	router.Run(":5000")
}