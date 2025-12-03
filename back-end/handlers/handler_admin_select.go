package handlers

// DEPRECATED: This file contains old GORM-based admin select/query functions.
// Please use handler_admin_mongodb.go instead for MongoDB integration.
//
// Deprecated functions (GORM versions - replaced by MongoDB implementations):
// - AdminInvoiceView (struct)
// - AdminSelectAllInvoices()
// - AdminGetInvoiceDetail()
// - AdminProductStatistics()
// - AdminSearchCustomersByDate()
// - AdminUpdateInvoiceStatus()
// - AdminRevertInvoiceStatus()
// - AdminDeleteInvoice()
// - AdminDeleteTravelInvoice()
// - AdminDeleteHomeInvoice()
// - AdminUpdateTravelInvoiceStatus()
// - AdminUpdateHomeInvoiceStatus()
//
// All admin select/query endpoints now use MongoDB driver implementations from handler_admin_mongodb.go
// This file is kept for reference only. DO NOT USE these functions.
