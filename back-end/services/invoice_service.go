package services

import (
	"backend/models"

	"gorm.io/gorm"
)

type InvoiceWithProduct struct {
	models.Invoice
	ProductName string `json:"product_name"`
}

type InvoiceService struct {
	DB *gorm.DB
}

func NewInvoiceService(db *gorm.DB) *InvoiceService {
	return &InvoiceService{DB: db}
}

func (s *InvoiceService) GetInvoicesByUserID(userID uint) ([]InvoiceWithProduct, error) {
	var results []InvoiceWithProduct
	err := s.DB.Table("invoices").
		Select("invoices.*, products.name as product_name").
		Joins("left join products on invoices.product_id = products.product_id").
		Where("invoices.user_id = ?", userID).
		Scan(&results).Error
	return results, err
}
