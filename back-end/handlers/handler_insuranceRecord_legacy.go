package handlers

// This file has been temporarily renamed to handler_insuranceRecord_legacy.go
// The original handler_insuranceRecord.go contained GORM-based handlers that need migration to MongoDB
// TODO: Migrate these handlers to MongoDB following the pattern in invoice_handler_mongodb.go

// The following functions need to be migrated:
// - CreateInvoice
// - CreateTravelInsuranceInvoice
// - CreateCarInsuranceForm
// - CreateMotorbikeInsuranceForm
// - CreatePersonalInsuranceForm
// - CreateInsuranceParticipantInfo
// - CreateCustomerRegistration
// - UpdateCustomerRegistration
// - ConfirmPurchase
