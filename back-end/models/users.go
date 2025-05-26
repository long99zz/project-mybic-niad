package models

import (
    "gorm.io/gorm"
)

type User struct {
    gorm.Model
    ID                   uint   `gorm:"primaryKey"`
    AccountType          string `gorm:"size:50"`       // 🔹 Loại tài khoản (Admin, Khách hàng)
    FirstName            string `gorm:"size:255"`      // 🔹 Họ
    LastName             string `gorm:"size:255"`      // 🔹 Tên
    Phone                string `gorm:"size:15"`       // 🔹 Số điện thoại
    Email                string `gorm:"size:255;unique"`  // 🔹 Email (duy nhất)
    Password             string `gorm:"size:255"`      // 🔹 Mật khẩu (đã mã hóa)
    CitizenID            string `gorm:"size:50"`       // 🔹 CMND/CCCD
    Gender               string `gorm:"size:10"`       // 🔹 Giới tính (Nam/Nữ)
    DateOfBirth          string `gorm:"type:DATE"`     // 🔹 Ngày sinh
    Province             string `gorm:"size:255"`      // 🔹 Tỉnh
    City                 string `gorm:"size:255"`      // 🔹 Thành phố
    District             string `gorm:"size:255"`      // 🔹 Quận/Huyện
    SubDistrict          string `gorm:"size:255"`      // 🔹 Phường/Xã
    HouseNumber          string `gorm:"size:50"`       // 🔹 Số nhà
    Role                 string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer'"` // 🔹 Phân quyền
}