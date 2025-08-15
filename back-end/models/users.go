package models

import (
    "gorm.io/gorm"
)

type User struct {
    gorm.Model
    ID                   uint   `gorm:"primaryKey" json:"id"`
    AccountType          string `gorm:"size:50" json:"account_type"`       // 🔹 Loại tài khoản (Admin, Khách hàng)
    FirstName            string `gorm:"size:255" json:"first_name"`      // 🔹 Họ
    LastName             string `gorm:"size:255" json:"last_name"`      // 🔹 Tên
    Phone                string `gorm:"size:15" json:"phone"`       // 🔹 Số điện thoại
    Email                string `gorm:"size:255;unique" json:"email"`  // 🔹 Email (duy nhất)
    Password             string `gorm:"size:255" json:"password"`      // 🔹 Mật khẩu (đã mã hóa)
    CitizenID            string `gorm:"size:50" json:"citizen_id"`       // 🔹 CMND/CCCD
    Gender               string `gorm:"size:10" json:"gender"`       // 🔹 Giới tính (Nam/Nữ)
    DateOfBirth          string `gorm:"type:DATE" json:"date_of_birth"`     // 🔹 Ngày sinh
    Province             string `gorm:"size:255" json:"province"`      // 🔹 Tỉnh
    City                 *string `gorm:"size:255;default:NULL" json:"city,omitempty"`      // 🔹 Thành phố
    District             string `gorm:"size:255" json:"district"`      // 🔹 Quận/Huyện
    SubDistrict          string `gorm:"size:255" json:"sub_district"`      // 🔹 Phường/Xã
    HouseNumber          string `gorm:"size:50" json:"house_number"`       // 🔹 Số nhà
    Role                 string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer'" json:"role"` // 🔹 Phân quyền
}