package handlers

import (
    "net/http"
    "gorm.io/gorm"
    "github.com/gin-gonic/gin"
	"backend/models"
	"fmt"
    "time"
)

type AdminInvoiceView struct {
    InvoiceID            uint    `json:"invoice_id"`
    InvoiceType          string  `json:"invoice_type"` // "Chung", "Du lịch", "Nhà"
    ProductName          string  `json:"product_name"`
    CustomerName         string  `json:"customer_name"`
    // Chung
    InsuranceStart       *string `json:"insurance_start,omitempty"`
    InsuranceEnd         *string `json:"insurance_end,omitempty"`
    InsuranceAmount      *float64 `json:"insurance_amount,omitempty"`
    InsuranceQuantity    *uint   `json:"insurance_quantity,omitempty"`
    ContractType         *string `json:"contract_type,omitempty"`
    Status               *string `json:"status,omitempty"`
    // Du lịch
    DepartureLocation    *string `json:"departure_location,omitempty"`
    Destination          *string `json:"destination,omitempty"`
    DepartureDate        *string `json:"departure_date,omitempty"`
    ReturnDate           *string `json:"return_date,omitempty"`
    GroupSize            *int    `json:"group_size,omitempty"`
    InsuranceProgram     *string `json:"insurance_program,omitempty"`
    InsurancePackage     *string `json:"insurance_package,omitempty"`
    // Nhà
    HomeUsageStatus      *string `json:"home_usage_status,omitempty"`
    HomeInsuranceAmount  *float64 `json:"home_insurance_amount,omitempty"`
    AssetInsuranceAmount *float64 `json:"asset_insurance_amount,omitempty"`
    InsuredPersonName    *string `json:"insured_person_name,omitempty"`
    InsuredHomeAddress   *string `json:"insured_home_address,omitempty"`
    InsuranceDuration    *int    `json:"insurance_duration,omitempty"`
    UpdatedAt            string  `json:"updated_at"`
}

func AdminSelectAllInvoices(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var result []AdminInvoiceView
        var temp  []AdminInvoiceView

        // Hóa đơn chung (tai nạn, sức khỏe, ...)
        temp = []AdminInvoiceView{}
        db.Raw(`
            SELECT 
                i.invoice_id,
                'Chung' AS invoice_type,
                p.name AS product_name,
                c.full_name AS customer_name,
                DATE_FORMAT(i.insurance_start, '%Y-%m-%d') AS insurance_start,
                DATE_FORMAT(i.insurance_end, '%Y-%m-%d') AS insurance_end,
                i.insurance_amount,
                i.insurance_quantity,
                i.contract_type,
                i.status,
                NULL AS departure_location,
                NULL AS destination,
                NULL AS departure_date,
                NULL AS return_date,
                NULL AS group_size,
                NULL AS insurance_program,
                NULL AS insurance_package,
                NULL AS home_usage_status,
                NULL AS home_insurance_amount,
                NULL AS asset_insurance_amount,
                NULL AS insured_person_name,
                NULL AS insured_home_address,
                NULL AS insurance_duration,
                DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM invoices i
            LEFT JOIN products p ON i.product_id = p.product_id
            LEFT JOIN customer_registration c ON i.customer_id = c.customer_id
        `).Scan(&temp)
        result = append(result, temp...)

        // Hóa đơn du lịch
        temp = []AdminInvoiceView{}
        db.Raw(`
            SELECT 
                t.invoice_id,
                'Du lịch' AS invoice_type,
                p.name AS product_name,
                c.full_name AS customer_name,
                NULL AS insurance_start,
                NULL AS insurance_end,
                NULL AS insurance_amount,
                NULL AS insurance_quantity,
                NULL AS contract_type,
                t.status,
                t.departure_location,
                t.destination,
                DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS departure_date,
                DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
                t.group_size,
                t.insurance_program,
                t.insurance_package,
                NULL AS home_usage_status,
                NULL AS home_insurance_amount,
                NULL AS asset_insurance_amount,
                NULL AS insured_person_name,
                NULL AS insured_home_address,
                NULL AS insurance_duration,
                DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM travel_insurance_invoices t
            LEFT JOIN products p ON t.product_id = p.product_id
            LEFT JOIN customer_registration c ON t.customer_id = c.customer_id
        `).Scan(&temp)
        result = append(result, temp...)

        // Hóa đơn nhà
        temp = []AdminInvoiceView{}
        db.Raw(`
            SELECT 
                h.invoice_id,
                'Nhà' AS invoice_type,
                p.name AS product_name,
                c.full_name AS customer_name,
                NULL AS insurance_start,
                NULL AS insurance_end,
                NULL AS insurance_amount,
                NULL AS insurance_quantity,
                NULL AS contract_type,
                NULL AS status,
                NULL AS departure_location,
                NULL AS destination,
                NULL AS departure_date,
                NULL AS return_date,
                NULL AS group_size,
                NULL AS insurance_program,
                NULL AS insurance_package,
                h.home_usage_status,
                h.home_insurance_amount,
                h.asset_insurance_amount,
                h.insured_person_name,
                h.insured_home_address,
                h.insurance_duration,
                DATE_FORMAT(h.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
            FROM home_insurance_invoices h
            LEFT JOIN products p ON h.product_id = p.product_id
            LEFT JOIN customer_registration c ON h.customer_id = c.customer_id
        `).Scan(&temp)
        result = append(result, temp...)

        c.JSON(http.StatusOK, result)
    }
}
type AdminInvoiceDetail struct {
    InvoiceID      uint                   `json:"invoice_id"`
    InvoiceType    string                 `json:"invoice_type"`
    ProductName    string                 `json:"product_name"`
    Customer       *models.CustomerRegistration `json:"customer"`
    Participants   interface{}            `json:"participants"` // slice các participant
    // ...các trường khác nếu muốn
}

func AdminGetInvoiceDetail(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        invoiceType := c.Query("type")
        invoiceID := c.Query("id")
        fmt.Println("invoiceType:", invoiceType, "invoiceID:", invoiceID)

        var detail AdminInvoiceDetail

        switch invoiceType {
        case "chung":
            // Lấy hóa đơn
            var invoice models.Invoice
            if err := db.First(&invoice, invoiceID).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn"})
                return
            }
            // Lấy customer
            var customer models.CustomerRegistration
            db.First(&customer, invoice.CustomerID)
            // Lấy participants
            var participants []models.Participant
            db.Where("invoice_id = ?", invoiceID).Find(&participants)

            // Lấy tên sản phẩm
            var product models.Product
            db.First(&product, invoice.ProductID)

            detail = AdminInvoiceDetail{
                InvoiceID:    invoice.InvoiceID,
                InvoiceType:  "Chung",
                ProductName:  product.Name,
                Customer:     &customer,
                Participants: participants,
            }

        case "travel":
            var invoice models.TravelInsuranceInvoice
            if err := db.First(&invoice, invoiceID).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn"})
                return
            }
            var customer models.CustomerRegistration
            db.First(&customer, invoice.CustomerID)
            var participants []models.TravelParticipant
            db.Where("invoice_id = ?", invoiceID).Find(&participants)
            var product models.Product
            if invoice.ProductID != nil {
                db.First(&product, invoice.ProductID)
            }
            detail = AdminInvoiceDetail{
                InvoiceID:    invoice.InvoiceID,
                InvoiceType:  "Du lịch",
                ProductName:  product.Name,
                Customer:     &customer,
                Participants: participants,
            }

        case "home":
            var invoice models.HomeInsuranceInvoice
            if err := db.First(&invoice, invoiceID).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn"})
                return
            }
            var customer models.CustomerRegistration
            db.First(&customer, invoice.CustomerID)
            var product models.Product
            db.First(&product, invoice.ProductID)
            detail = AdminInvoiceDetail{
                InvoiceID:    invoice.InvoiceID,
                InvoiceType:  "Nhà",
                ProductName:  product.Name,
                Customer:     &customer,
                Participants: nil, // hóa đơn nhà không có participants
            }
        default:
            c.JSON(http.StatusBadRequest, gin.H{"error": "Loại hóa đơn không hợp lệ"})
            return
        }

        c.JSON(http.StatusOK, detail)
    }
}
type ProductStatistic struct {
    ProductID   uint    `json:"product_id"`
    ProductName string  `json:"product_name"`
    TotalSold   int     `json:"total_sold"`
    TotalRevenue float64 `json:"total_revenue"`
    DateGroup   string  `json:"date_group"` // ngày/tháng/năm
}

// Thống kê theo ngày/tháng/năm (groupType: "day", "month", "year")
func AdminProductStatistics(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        groupType := c.DefaultQuery("group", "day") // "day", "month", "year"
        var dateFormat string
        switch groupType {
        case "month":
            dateFormat = "%Y-%m"
        case "year":
            dateFormat = "%Y"
        default:
            dateFormat = "%Y-%m-%d"
        }

        var stats []ProductStatistic

        // Thống kê từ bảng invoices (có trường insurance_quantity, insurance_amount)
        db.Raw(`
            SELECT 
                p.product_id,
                p.name AS product_name,
                SUM(i.insurance_quantity) AS total_sold,
                SUM(i.insurance_amount) AS total_revenue,
                DATE_FORMAT(i.created_at, ?) AS date_group
            FROM invoices i
            LEFT JOIN products p ON i.product_id = p.product_id
            WHERE i.status = 'Đã thanh toán'
            GROUP BY p.product_id, date_group
        `, dateFormat).Scan(&stats)

        // Thống kê từ bảng travel_insurance_invoices (group_size, total_amount)
        var travelStats []ProductStatistic
        db.Raw(`
            SELECT 
                p.product_id,
                p.name AS product_name,
                SUM(t.group_size) AS total_sold,
                SUM(t.total_amount) AS total_revenue,
                DATE_FORMAT(t.created_at, ?) AS date_group
            FROM travel_insurance_invoices t
            LEFT JOIN products p ON t.product_id = p.product_id
            WHERE t.status = 'Đã thanh toán'
            GROUP BY p.product_id, date_group
        `, dateFormat).Scan(&travelStats)
        stats = append(stats, travelStats...)

        // Thống kê từ bảng home_insurance_invoices (chỉ tính 1 hóa đơn = 1 lượt mua)
        var homeStats []ProductStatistic
        db.Raw(`
            SELECT 
                p.product_id,
                p.name AS product_name,
                COUNT(h.invoice_id) AS total_sold,
                SUM(h.home_insurance_amount + h.asset_insurance_amount) AS total_revenue,
                DATE_FORMAT(h.created_at, ?) AS date_group
            FROM home_insurance_invoices h
            LEFT JOIN products p ON h.product_id = p.product_id
            GROUP BY p.product_id, date_group
        `, dateFormat).Scan(&homeStats)
        stats = append(stats, homeStats...)

        c.JSON(http.StatusOK, stats)
    }
}
type CustomerPurchaseInfo struct {
    CustomerID   uint   `json:"customer_id"`
    FullName     string `json:"full_name"`
    Email        string `json:"email"`
    PhoneNumber  string `json:"phone_number"`
    ProductName  string `json:"product_name"`
    InvoiceType  string `json:"invoice_type"`
    PurchaseDate string `json:"purchase_date"`
}

func AdminSearchCustomersByDate(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        date := c.Query("date") // "YYYY-MM-DD"
        productID := c.Query("product_id") // có thể rỗng
        invoiceType := c.Query("invoice_type") // "chung", "travel", "home" hoặc rỗng

        var result []CustomerPurchaseInfo

        // Hóa đơn thường
        if invoiceType == "" || invoiceType == "chung" {
            query := `
                SELECT 
                    c.customer_id, c.full_name, c.email, c.phone_number,
                    p.name AS product_name,
                    'Chung' AS invoice_type,
                    DATE_FORMAT(i.created_at, '%Y-%m-%d') AS purchase_date
                FROM invoices i
                LEFT JOIN customer_registration c ON i.customer_id = c.customer_id
                LEFT JOIN products p ON i.product_id = p.product_id
                WHERE DATE(i.created_at) = ? AND i.status = 'Đã thanh toán'
            `
            params := []interface{}{date}
            if productID != "" {
                query += " AND i.product_id = ?"
                params = append(params, productID)
            }
            db.Raw(query, params...).Scan(&result)
        }

        // Hóa đơn du lịch
        if invoiceType == "" || invoiceType == "travel" {
            query := `
                SELECT 
                    c.customer_id, c.full_name, c.email, c.phone_number,
                    p.name AS product_name,
                    'Du lịch' AS invoice_type,
                    DATE_FORMAT(t.created_at, '%Y-%m-%d') AS purchase_date
                FROM travel_insurance_invoices t
                LEFT JOIN customer_registration c ON t.customer_id = c.customer_id
                LEFT JOIN products p ON t.product_id = p.product_id
                WHERE DATE(t.created_at) = ? AND t.status = 'Đã thanh toán'
            `
            params := []interface{}{date}
            if productID != "" {
                query += " AND t.product_id = ?"
                params = append(params, productID)
            }
            var travelResult []CustomerPurchaseInfo
            db.Raw(query, params...).Scan(&travelResult)
            result = append(result, travelResult...)
        }

        // Hóa đơn nhà
        if invoiceType == "" || invoiceType == "home" {
            query := `
                SELECT 
                    c.customer_id, c.full_name, c.email, c.phone_number,
                    p.name AS product_name,
                    'Nhà' AS invoice_type,
                    DATE_FORMAT(h.created_at, '%Y-%m-%d') AS purchase_date
                FROM home_insurance_invoices h
                LEFT JOIN customer_registration c ON h.customer_id = c.customer_id
                LEFT JOIN products p ON h.product_id = p.product_id
                WHERE DATE(h.created_at) = ?
            `
            params := []interface{}{date}
            if productID != "" {
                query += " AND h.product_id = ?"
                params = append(params, productID)
            }
            var homeResult []CustomerPurchaseInfo
            db.Raw(query, params...).Scan(&homeResult)
            result = append(result, homeResult...)
        }

        c.JSON(http.StatusOK, result)
    }
}
func AdminUpdateInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        invoiceType := c.Query("type") // "chung", "travel", "home"
        invoiceID := c.Param("id")

        switch invoiceType {
        case "chung":
            var input models.Invoice
            if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
                return
            }
            if err := db.Model(&models.Invoice{}).Where("invoice_id = ?", invoiceID).Updates(input).Error; err != nil {
                c.JSON(500, gin.H{"error": "Cập nhật hóa đơn thất bại!"})
                return
            }
        case "travel":
            var input models.TravelInsuranceInvoice
            if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
                return
            }
            if err := db.Model(&models.TravelInsuranceInvoice{}).Where("invoice_id = ?", invoiceID).Updates(input).Error; err != nil {
                c.JSON(500, gin.H{"error": "Cập nhật hóa đơn du lịch thất bại!"})
                return
            }
        case "home":
            var input models.HomeInsuranceInvoice
            if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
                return
            }
            if err := db.Model(&models.HomeInsuranceInvoice{}).Where("invoice_id = ?", invoiceID).Updates(input).Error; err != nil {
                c.JSON(500, gin.H{"error": "Cập nhật hóa đơn nhà thất bại!"})
                return
            }
        default:
            c.JSON(400, gin.H{"error": "Loại hóa đơn không hợp lệ"})
            return
        }
        c.JSON(200, gin.H{"message": "Cập nhật hóa đơn thành công!"})
    }
}
func AdminUpdateCustomer(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        customerID := c.Param("id")
        var input models.CustomerRegistration
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        if err := db.Model(&models.CustomerRegistration{}).Where("customer_id = ?", customerID).Updates(input).Error; err != nil {
            c.JSON(500, gin.H{"error": "Cập nhật khách hàng thất bại!"})
            return
        }
        c.JSON(200, gin.H{"message": "Cập nhật khách hàng thành công!"})
    }
}
func AdminUpdateParticipant(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var input models.Participant
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        if err := db.Model(&models.Participant{}).Where("participant_id = ?", id).Updates(input).Error; err != nil {
            c.JSON(500, gin.H{"error": "Cập nhật participant thất bại!"})
            return
        }
        c.JSON(200, gin.H{"message": "Cập nhật participant thành công!"})
    }
}
func AdminUpdateTravelParticipant(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var input models.TravelParticipant
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        if err := db.Model(&models.TravelParticipant{}).Where("travel_participant_id = ?", id).Updates(input).Error; err != nil {
            c.JSON(500, gin.H{"error": "Cập nhật travel participant thất bại!"})
            return
        }
        c.JSON(200, gin.H{"message": "Cập nhật travel participant thành công!"})
    }
}
func AdminDeleteParticipant(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        now := time.Now()
        if err := db.Model(&models.Participant{}).
            Where("participant_id = ?", id).
            Update("deleted_at", &now).Error; err != nil {
            c.JSON(500, gin.H{"error": "Xóa participant thất bại!"})
            return
        }
        c.JSON(200, gin.H{"message": "Đã xóa participant (soft delete)!"})
    }
}
func AdminDeletedParticipants(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var result []models.Participant
        db.Where("deleted_at IS NOT NULL").Find(&result)
        c.JSON(200, result)
    }
}
func AdminDeleteInvoice(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        invoiceType := c.Query("type") // "chung", "travel", "home"
        invoiceID := c.Param("id")
        now := time.Now()

        switch invoiceType {
        case "chung":
            if err := db.Model(&models.Invoice{}).
                Where("invoice_id = ?", invoiceID).
                Update("deleted_at", &now).Error; err != nil {
                c.JSON(500, gin.H{"error": "Xóa hóa đơn thất bại!"})
                return
            }
        case "travel":
            if err := db.Model(&models.TravelInsuranceInvoice{}).
                Where("invoice_id = ?", invoiceID).
                Update("deleted_at", &now).Error; err != nil {
                c.JSON(500, gin.H{"error": "Xóa hóa đơn du lịch thất bại!"})
                return
            }
        case "home":
            if err := db.Model(&models.HomeInsuranceInvoice{}).
                Where("invoice_id = ?", invoiceID).
                Update("deleted_at", &now).Error; err != nil {
                c.JSON(500, gin.H{"error": "Xóa hóa đơn nhà thất bại!"})
                return
            }
        default:
            c.JSON(400, gin.H{"error": "Loại hóa đơn không hợp lệ"})
            return
        }
        c.JSON(200, gin.H{"message": "Đã xóa hóa đơn (soft delete)!"})
    }
}
func AdminDeletedInvoices(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        invoiceType := c.Query("type") // "chung", "travel", "home" hoặc rỗng (lấy tất cả)
        var result []AdminInvoiceView

        // Hóa đơn chung
        if invoiceType == "" || invoiceType == "chung" {
            var temp []AdminInvoiceView
            db.Raw(`
                SELECT 
                    i.invoice_id,
                    'Chung' AS invoice_type,
                    p.name AS product_name,
                    c.full_name AS customer_name,
                    DATE_FORMAT(i.insurance_start, '%Y-%m-%d') AS insurance_start,
                    DATE_FORMAT(i.insurance_end, '%Y-%m-%d') AS insurance_end,
                    i.insurance_amount,
                    i.insurance_quantity,
                    i.contract_type,
                    i.status,
                    NULL AS departure_location,
                    NULL AS destination,
                    NULL AS departure_date,
                    NULL AS return_date,
                    NULL AS group_size,
                    NULL AS insurance_program,
                    NULL AS insurance_package,
                    NULL AS home_usage_status,
                    NULL AS home_insurance_amount,
                    NULL AS asset_insurance_amount,
                    NULL AS insured_person_name,
                    NULL AS insured_home_address,
                    NULL AS insurance_duration,
                    DATE_FORMAT(i.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM invoices i
                LEFT JOIN products p ON i.product_id = p.product_id
                LEFT JOIN customer_registration c ON i.customer_id = c.customer_id
                WHERE i.deleted_at IS NOT NULL
            `).Scan(&temp)
            result = append(result, temp...)
        }

        // Hóa đơn du lịch
        if invoiceType == "" || invoiceType == "travel" {
            var temp []AdminInvoiceView
            db.Raw(`
                SELECT 
                    t.invoice_id,
                    'Du lịch' AS invoice_type,
                    p.name AS product_name,
                    c.full_name AS customer_name,
                    NULL AS insurance_start,
                    NULL AS insurance_end,
                    NULL AS insurance_amount,
                    NULL AS insurance_quantity,
                    NULL AS contract_type,
                    t.status,
                    t.departure_location,
                    t.destination,
                    DATE_FORMAT(t.departure_date, '%Y-%m-%d') AS departure_date,
                    DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
                    t.group_size,
                    t.insurance_program,
                    t.insurance_package,
                    NULL AS home_usage_status,
                    NULL AS home_insurance_amount,
                    NULL AS asset_insurance_amount,
                    NULL AS insured_person_name,
                    NULL AS insured_home_address,
                    NULL AS insurance_duration,
                    DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM travel_insurance_invoices t
                LEFT JOIN products p ON t.product_id = p.product_id
                LEFT JOIN customer_registration c ON t.customer_id = c.customer_id
                WHERE t.deleted_at IS NOT NULL
            `).Scan(&temp)
            result = append(result, temp...)
        }

        // Hóa đơn nhà
        if invoiceType == "" || invoiceType == "home" {
            var temp []AdminInvoiceView
            db.Raw(`
                SELECT 
                    h.invoice_id,
                    'Nhà' AS invoice_type,
                    p.name AS product_name,
                    c.full_name AS customer_name,
                    NULL AS insurance_start,
                    NULL AS insurance_end,
                    NULL AS insurance_amount,
                    NULL AS insurance_quantity,
                    NULL AS contract_type,
                    NULL AS status,
                    NULL AS departure_location,
                    NULL AS destination,
                    NULL AS departure_date,
                    NULL AS return_date,
                    NULL AS group_size,
                    NULL AS insurance_program,
                    NULL AS insurance_package,
                    h.home_usage_status,
                    h.home_insurance_amount,
                    h.asset_insurance_amount,
                    h.insured_person_name,
                    h.insured_home_address,
                    h.insurance_duration,
                    DATE_FORMAT(h.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM home_insurance_invoices h
                LEFT JOIN products p ON h.product_id = p.product_id
                LEFT JOIN customer_registration c ON h.customer_id = c.customer_id
                WHERE h.deleted_at IS NOT NULL
            `).Scan(&temp)
            result = append(result, temp...)
        }

        c.JSON(http.StatusOK, result)
    }
}
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "backend/models"
)

// Thêm bài viết
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