package services

import (
	"backend/server/models"
	"errors"

	"gorm.io/gorm"
)

type InvoiceService struct {
	db *gorm.DB
}

func NewInvoiceService(db *gorm.DB) *InvoiceService {
	return &InvoiceService{db: db}
}

func (s *InvoiceService) CreateInvoice(invoice *models.Invoice) error {
	if invoice.Status == "" {
		invoice.Status = "Chưa thanh toán"
	}
	if err := invoice.Validate(); err != nil {
		return err
	}
	return s.db.Create(invoice).Error
}

func (s *InvoiceService) ConfirmPurchase(invoiceID, customerID, formID, userID uint) error {
	var insuranceForm models.InsuranceForm
	if err := s.db.First(&insuranceForm, formID).Error; err != nil {
		return errors.New("Không tìm thấy form bảo hiểm!")
	}
	insuranceEnd := insuranceForm.InsuranceStart.AddDate(0, int(insuranceForm.InsuranceDuration), 0)
	return s.db.Table("invoices").
		Where("invoice_id = ? AND user_id = ?", invoiceID, userID).
		Updates(map[string]interface{}{
			"customer_id":      customerID,
			"form_id":          formID,
			"insurance_start":  insuranceForm.InsuranceStart,
			"insurance_end":    insuranceEnd,
			"insurance_amount": insuranceForm.TotalPremium,
		}).Error
}

// Lấy danh sách hóa đơn theo user_id
func (s *InvoiceService) GetInvoicesByUserID(userID uint) ([]models.Invoice, error) {
	var invoices []models.Invoice
	err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&invoices).Error
	return invoices, err
}
