package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID            uint   `gorm:"primaryKey;column:id"`
	AccountType   string `gorm:"size:50;column:account_type"`       // 🔹 Loại tài khoản (Admin, Khách hàng)
	FirstName     string `gorm:"size:255;column:first_name"`      // 🔹 Họ
	LastName      string `gorm:"size:255;column:last_name"`      // 🔹 Tên
	Phone         string `gorm:"size:15;column:phone"`       // 🔹 Số điện thoại
	Email         string `gorm:"size:255;unique;column:email"`  // 🔹 Email (duy nhất)
	Password      string `gorm:"size:255;column:password"`      // 🔹 Mật khẩu (đã mã hóa)
	CitizenID     string `gorm:"size:50;column:citizen_id"`       // 🔹 CMND/CCCD
	Gender        string `gorm:"size:10;column:gender"`       // 🔹 Giới tính (Nam/Nữ)
	DateOfBirth   string `gorm:"type:DATE;column:date_of_birth"`     // 🔹 Ngày sinh
	Province      string `gorm:"size:255;column:province"`      // 🔹 Tỉnh
	City          string `gorm:"size:255;column:city"`      // 🔹 Thành phố
	District      string `gorm:"size:255;column:district"`      // 🔹 Quận/Huyện
	SubDistrict   string `gorm:"size:255;column:sub_district"`      // 🔹 Phường/Xã
	HouseNumber   string `gorm:"size:50;column:house_number"`       // 🔹 Số nhà
	Role          string `gorm:"type:ENUM('Admin', 'Customer');default:'Customer';column:role"` // 🔹 Phân quyền, mặc định là Customer
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`
}