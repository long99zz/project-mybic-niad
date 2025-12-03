package handlers

// DEPRECATED: This file contains old GORM-based admin functions.
// Please use handler_admin_mongodb.go instead for MongoDB integration.
//
// Deprecated functions (GORM versions - replaced by MongoDB implementations):
// - DashboardStats (struct)
// - AdminGetDashboardStats()
// - AdminGetRevenueByMonth()
// - AdminGetOrdersByProduct()
// - AdminGetOrderDetail()
// - AdminUpdateOrderStatus()
// - AdminDeleteOrder()
// - AdminGetAllUsers()
// - AdminGetUserDetail()
// - AdminUpdateUser()
// - AdminDeleteUser()
// - AdminGetAllProducts()
// - AdminGetProductDetail()
// - AdminCreateProduct()
// - AdminUpdateProduct()
// - AdminDeleteProduct()
// - AdminGetMonthlyStatistics()
// - AdminGetProductStatistics()
// - logAdminAction()
//
// All admin endpoints now use MongoDB driver implementations from handler_admin_mongodb.go
// This file is kept for reference only. DO NOT USE these functions.
