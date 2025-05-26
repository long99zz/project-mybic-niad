package models

import "time"

// HomeInsuranceInvoice: Hóa đơn bảo hiểm nhà
type HomeInsuranceInvoice struct {
    InvoiceID            uint      `gorm:"primaryKey" json:"invoice_id"`                // Khóa chính hóa đơn bảo hiểm nhà
    UserID               *uint     `gorm:"index" json:"user_id"`                        // Cho phép NULL nếu không đăng nhập
    FormID               *uint     `gorm:"index" json:"form_id"`                        // Khóa ngoại liên kết với bảng insurance_forms
    CustomerID           *uint     `gorm:"index" json:"customer_id"`                    // Khóa ngoại liên kết với bảng customers
    CoverageScope        string    `gorm:"size:255;not null" json:"coverage_scope"`     // Phạm vi bảo hiểm
    HomeType             string    `gorm:"size:255;not null" json:"home_type"`          // Loại nhà
    HomeUsageStatus      string    `gorm:"type:enum('Mới','Đã sử dụng');not null" json:"home_usage_status"` // Tình trạng sử dụng nhà
    HomeInsuranceAmount  float64   `gorm:"not null" json:"home_insurance_amount"`       // Số tiền bảo hiểm cho ngôi nhà
    AssetInsuranceAmount float64   `gorm:"not null" json:"asset_insurance_amount"`      // Số tiền bảo hiểm cho tài sản bên trong nhà
    InsuredPersonName    string    `gorm:"size:255;not null" json:"insured_person_name"`// Tên người được bảo hiểm
    InsuredHomeAddress   string    `gorm:"size:255;not null" json:"insured_home_address"`// Địa chỉ ngôi nhà được bảo hiểm
    InsuranceDuration    int       `gorm:"not null" json:"insurance_duration"`          // Thời hạn bảo hiểm (tháng/năm)
    ProductID            uint      `gorm:"not null" json:"product_id"`                  // Khóa ngoại liên kết với bảng products
    CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`            // Thời gian tạo hóa đơn
    UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`            // Thời gian cập nhật hóa đơn
}