# API Bảo hiểm - Thông tin trường dữ liệu & Endpoint

---

## 1. Tạo Invoice (Hóa đơn)

**Endpoint:**  
`POST /api/insurance_car_owner/create_invoice`

**Body JSON:**

```json
{
  "contract_type": "Mới", // "Mới" hoặc "Tái tục"
  "total_amount": 2500000,
  "payment_method": "Chuyển khoản",
  "note": "Thanh toán đủ"
}
```

**Response:**

```json
{
  "message": "Invoice đã lưu!",
  "invoice_id": 10
}
```

---

## 2. Tạo CarInsuranceForm (Thông tin xe)

**Endpoint:**  
`POST /api/insurance_car_owner/create_car_insurance_form`

**Body JSON:**

```json
{
  "user_type": "Cá nhân",
  "identity_number": "0123456789",
  "usage_purpose": "Kinh doanh vận tải",
  "vehicle_type": "Xe con",
  "seat_count": 4,
  "load_capacity": 1.5,
  "owner_name": "Nguyễn Văn B",
  "registration_address": "123 Đường ABC, Hà Nội",
  "license_plate_status": "Mới",
  "license_plate": "30A-12345",
  "chassis_number": "X123456",
  "engine_number": "EN98765",
  "insurance_start": "2025-05-21",
  "insurance_duration": 12,
  "insurance_fee": 500000,
  "insurance_amount": 2000000,
  "participant_count": 2
}
```

**Response:**

```json
{
  "message": "CarInsuranceForm đã lưu!",
  "form_id": 1
}
```

---

## 3. Tạo CustomerRegistration (Thông tin khách hàng)

**Endpoint:**  
`POST /api/insurance_car_owner/create_customer_registration`

**Body JSON:**

```json
{
  "customer_type": "Cá nhân", // "Cá nhân" hoặc "Doanh nghiệp"
  "identity_number": "0123456789",
  "full_name": "Nguyễn Văn B",
  "address": "123 Đường ABC, Hà Nội",
  "email": "nguyenvanb@example.com",
  "phone_number": "0912345678",
  "invoice_request": true,
  "notes": "Khách hàng mới"
}
```

**Response:**

```json
{
  "message": "Customer đã lưu!",
  "customer_id": 6
}
```

---

## 4. Xác nhận mua hàng (Update invoice với customer_id và form_id)

**Endpoint:**  
`POST /api/insurance_car_owner/confirm_purchase`

**Body JSON:**

```json
{
  "invoice_id": 10,
  "customer_id": 6,
  "form_id": 1
}
```

**Response:**

```json
{
  "message": "Xác nhận mua hàng thành công!",
  "invoice_id": 10
}
```

---

## **Tóm tắt các trường dữ liệu chính**

### Invoice

- `invoice_id` (uint, trả về khi tạo)
- `contract_type` ("Mới" hoặc "Tái tục")
- `total_amount` (float)
- `payment_method` (string)
- `note` (string)
- `customer_id` (uint, cập nhật sau)
- `form_id` (uint, cập nhật sau)

### CarInsuranceForm

- `form_id` (uint, trả về khi tạo)
- `user_type`, `identity_number`, `usage_purpose`, `vehicle_type`, `seat_count`, `load_capacity`, `owner_name`, `registration_address`, `license_plate_status`, `license_plate`, `chassis_number`, `engine_number`, `insurance_start`, `insurance_duration`, `insurance_fee`, `insurance_amount`, `participant_count`

### CustomerRegistration

- `customer_id` (uint, trả về khi tạo)
- `customer_type`, `identity_number`, `full_name`, `address`, `email`, `phone_number`, `invoice_request`, `notes`

---

**Lưu ý:**

- Các API đều yêu cầu token đăng nhập (user_id).
- Các trường trả về (`invoice_id`, `form_id`, `customer_id`) cần lưu lại để truyền vào API xác nhận mua hàng.
