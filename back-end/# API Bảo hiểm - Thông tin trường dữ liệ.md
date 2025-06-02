# API Bảo hiểm - Thông tin trường dữ liệu & Endpoint

---

## 1. Tạo Invoice (Hóa đơn)

**Endpoint:**  
`POST /api/insurance_car_owner/create_invoice`  
`POST /api/insurance_motorbike_owner/create_invoice`  
`POST /api/insurance_cancer/create_invoice`

**Body JSON:**

```json
{
  "insurance_quantity": 1,
  "contract_type": "Mới"
}
```

**Trả về:**

```json
{
  "message": "Invoice đã lưu!",
  "invoice_id": 10
}
```

**Trường dữ liệu:**

- `invoice_id` (uint, trả về khi tạo)
- `insurance_quantity` (uint)
- `contract_type` ("Mới" hoặc "Tái tục")
- `customer_id` (uint, cập nhật sau)
- `form_id` (uint, cập nhật sau)
- `insurance_start`, `insurance_end`, `insurance_amount`, `status` (cập nhật sau khi xác nhận mua hàng)

---

## 2. Tạo Form bảo hiểm (Car/Motorbike/Cancer)

### CarInsuranceForm

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

**Trả về:**

```json
{
  "message": "CarInsuranceForm đã lưu!",
  "form_id": 1
}
```

### MotorbikeInsuranceForm

**Endpoint:**  
`POST /api/insurance_motorbike_owner/create_motorbike_insurance_form`

**Body JSON:**

```json
{
  "engine_capacity": 110,
  "accident_coverage": 10000000,
  "insurance_duration": 12,
  "owner_name": "Nguyễn Văn B",
  "registration_address": "456 Đường ABC, Hà Nội",
  "license_plate_status": true,
  "license_plate": "29B1-12345",
  "chassis_number": "CHASSIS123456",
  "engine_number": "ENGINE654321",
  "insurance_start": "2025-06-01",
  "insurance_fee": 600000
}
```

**Trả về:**

```json
{
  "message": "MotorbikeInsuranceForm đã lưu!",
  "form_id": 2
}
```

### InsuranceParticipantInfo (Bảo hiểm ung thư)

**Endpoint:**  
`POST /api/insurance_cancer/create_insurance_participant_info`

**Body JSON:**

```json
{
  "cmnd_img": "/uploads/cmnd/987654321.jpg",
  "full_name": "Trần Thị B",
  "birth_date": "1985-08-15",
  "gender": "Nữ",
  "identity_number": "987654321",
  "main_benefit": "Bảo hiểm ung thư",
  "stroke_additional_benefit": false,
  "has_cancer": false,
  "had_stroke": false,
  "stage_four_disease": false,
  "insurance_duration": 12,
  "premium_fee": 2500000
}
```

**Trả về:**

```json
{
  "message": "Lưu thành công!",
  "participant_id": 5,
  "form_id": 6
}
```

---

## 3. Tạo CustomerRegistration (Thông tin khách hàng)

**Endpoint:**  
`POST /api/insurance_car_owner/create_customer_registration`  
`POST /api/insurance_motorbike_owner/create_customer_registration`  
`POST /api/insurance_cancer/create_customer_registration`

**Body JSON:**

```json
{
  "customer_type": "Cá nhân",
  "identity_number": "123456789",
  "full_name": "Nguyễn Văn D",
  "address": "789 Đường DEF, TP.HCM",
  "email": "nguyenvand@example.com",
  "phone_number": "0901234567",
  "invoice_request": false,
  "notes": "Khách đăng ký bảo hiểm xe máy"
}
```

**Trả về:**

```json
{
  "message": "Customer đã lưu!",
  "customer_id": 7
}
```

**Trường dữ liệu:**

- `customer_id` (uint, trả về khi tạo)
- `customer_type` ("Cá nhân" hoặc "Tổ chức")
- `identity_number`, `full_name`, `address`, `email`, `phone_number`, `invoice_request`, `notes`

---

## 4. Xác nhận mua hàng (ConfirmPurchase)

**Endpoint:**  
`POST /api/insurance_car_owner/confirm_purchase`  
`POST /api/insurance_motorbike_owner/confirm_purchase`  
`POST /api/insurance_cancer/confirm_purchase`

**Body JSON:**

```json
{
  "invoice_id": 10,
  "customer_id": 7,
  "form_id": 2
}
```

**Trả về:**

```json
{
  "message": "Xác nhận mua hàng thành công!",
  "invoice_id": 10
}
```

**Sau khi xác nhận:**

- Các trường `customer_id`, `form_id`, `insurance_start`, `insurance_end`, `insurance_amount` sẽ được cập nhật vào bảng `invoices`.

---

## **Tóm tắt các trường dữ liệu chính**

### Invoice

- `invoice_id` (uint)
- `insurance_quantity` (uint)
- `contract_type` ("Mới" hoặc "Tái tục")
- `customer_id` (uint, cập nhật sau)
- `form_id` (uint, cập nhật sau)
- `insurance_start` (date, cập nhật sau)
- `insurance_end` (date, cập nhật sau)
- `insurance_amount` (float, cập nhật sau)
- `status` ("Chưa thanh toán", "Đã thanh toán", "Đã hủy")

### CarInsuranceForm

- `form_id` (uint)
- `user_type`, `identity_number`, `usage_purpose`, `vehicle_type`, `seat_count`, `load_capacity`, `owner_name`, `registration_address`, `license_plate_status`, `license_plate`, `chassis_number`, `engine_number`, `insurance_start`, `insurance_duration`, `insurance_fee`, `insurance_amount`, `participant_count`

### MotorbikeInsuranceForm

- `form_id` (uint)
- `engine_capacity`, `accident_coverage`, `insurance_duration`, `owner_name`, `registration_address`, `license_plate_status`, `license_plate`, `chassis_number`, `engine_number`, `insurance_start`, `insurance_fee`

### InsuranceParticipantInfo

- `participant_id` (uint)
- `form_id` (uint)
- `cmnd_img`, `full_name`, `birth_date`, `gender`, `identity_number`, `main_benefit`, `stroke_additional_benefit`, `has_cancer`, `had_stroke`, `stage_four_disease`, `insurance_duration`, `premium_fee`

### CustomerRegistration

- `customer_id` (uint)
- `customer_type`, `identity_number`, `full_name`, `address`, `email`, `phone_number`, `invoice_request`, `notes`

---

## 4. Bảo hiểm du lịch - Quy tắc trường dữ liệu

### Các loại bảo hiểm du lịch:

- **Du lịch quốc tế:**
  - **Có:** `insurance_program`
  - **Không có:** `insurance_package`
- **Du lịch trong nước:**
  - **Không có:** cả `insurance_program` và `insurance_package`
- **Bảo hiểm tai nạn khách du lịch:**
  - **Có:** cả `insurance_program` và `insurance_package`

### Trường dữ liệu chung cho TravelInsuranceInvoice

| Trường             | Bắt buộc | Ghi chú                                      |
| ------------------ | -------- | -------------------------------------------- |
| invoice_id         | ✔        | Tự sinh khi tạo                              |
| form_id            | ✖        | Có thể null                                  |
| status             | ✔        | "Chưa thanh toán", "Đã thanh toán", "Đã hủy" |
| departure_location | ✔        |                                              |
| destination        | ✔        |                                              |
| departure_date     | ✔        | Định dạng "YYYY-MM-DD"                       |
| return_date        | ✔        | Định dạng "YYYY-MM-DD"                       |
| total_duration     | ✔        | Số ngày                                      |
| group_size         | ✔        | Số người trong đoàn                          |
| total_amount       | ✔        | Tổng phí                                     |
| customer_id        | ✖        | Cập nhật sau khi đăng ký khách hàng          |
| product_id         | ✔        |                                              |
| created_at         | ✔        |                                              |
| updated_at         | ✔        |
| insurance_package  | Tuỳ loại | Xem lưu ý bên trên                           |
| insurance_program  | Tuỳ loại | Xem lưu ý bên trên                           |

**Lưu ý cho frontend:**

- **Du lịch quốc tế:** chỉ nhập `insurance_program`, không nhập `insurance_package`.
- **Du lịch trong nước:** không nhập cả hai trường này.
- **Tai nạn khách du lịch:** nhập cả hai trường.

> **Chỉ hiển thị và gửi các trường phù hợp với từng loại sản phẩm bảo hiểm du lịch. Nếu trường không áp dụng, không cần gửi lên backend.**

## 1. 🟦 BẢO HIỂM TAI NẠN (Accident Insurance)

### 🟢 **Lưu ý:**

Có 3 loại sản phẩm, form giống nhau, chỉ khác tên sản phẩm:

- **Bảo hiểm tai nạn con người 24/24**
- **Bảo hiểm tai nạn người sử dụng điện**
- **Bảo hiểm tai nạn mở rộng**
- **Bảo hiểm an ninh mạng**

### 1.1. API tạo hóa đơn bảo hiểm tai nạn

- **Endpoint:** `POST /api/insurance_accident/create_accident`

#### **Body JSON gửi lên:**

| Trường            | Bắt buộc | Kiểu dữ liệu | Ghi chú                                                      |
| ----------------- | -------- | ------------ | ------------------------------------------------------------ |
| insurance_package | ✔        | string       | Tên gói bảo hiểm (ví dụ: "Bảo hiểm tai nạn con người 24/24") |
| insurance_start   | ✔        | date (ISO)   | Ngày bắt đầu bảo hiểm (YYYY-MM-DD)                           |
| insurance_end     | ✔        | date (ISO)   | Ngày kết thúc bảo hiểm (YYYY-MM-DD)                          |
| insurance_amount  | ✔        | number       | Số tiền bảo hiểm                                             |
| contract_type     | ✔        | string       | "Mới" hoặc "Tái tục"                                         |
| status            | ✔        | string       | "Chưa thanh toán", "Đã thanh toán", ...                      |
| participants      | ✔        | array        | Danh sách người tham gia                                     |

#### **participants** (mảng người tham gia):

| Trường          | Bắt buộc | Kiểu dữ liệu | Ghi chú                 |
| --------------- | -------- | ------------ | ----------------------- |
| cmnd_img        | ✖        | string       | Đường dẫn ảnh CMND/CCCD |
| full_name       | ✔        | string       | Họ tên                  |
| gender          | ✔        | string       | "Nam", "Nữ", "Khác"     |
| birth_date      | ✔        | date (ISO)   | Ngày sinh (YYYY-MM-DD)  |
| identity_number | ✔        | string       | Số CMND/CCCD            |

#### **Kết quả trả về:**

```json
{
  "message": "Invoice bảo hiểm tai nạn đã lưu!",
  "invoice_id": 123,
  "insurance_quantity": 2
}
```

---

## 2. 🟩 BẢO HIỂM NHÀ (Home Insurance)

### 2.1. API tạo hóa đơn bảo hiểm nhà

- **Endpoint:** `POST /api/insurance_home/create_home_invoice`

#### **Body JSON gửi lên:**

| Trường                 | Bắt buộc | Kiểu dữ liệu | Ghi chú                                          |
| ---------------------- | -------- | ------------ | ------------------------------------------------ |
| form_id                | ✖        | uint/null    | Liên kết insurance_form, có thể null khi tạo mới |
| customer_id            | ✖        | uint/null    | Liên kết khách hàng, cập nhật sau                |
| coverage_scope         | ✔        | string       | Phạm vi bảo hiểm (toàn bộ nhà, tài sản, ...)     |
| home_type              | ✔        | string       | Loại nhà (nhà ở, biệt thự, chung cư, ...)        |
| home_usage_status      | ✔        | string       | "Mới" hoặc "Đã sử dụng"                          |
| home_insurance_amount  | ✔        | number       | Số tiền bảo hiểm cho nhà                         |
| asset_insurance_amount | ✔        | number       | Số tiền bảo hiểm cho tài sản                     |
| insured_person_name    | ✔        | string       | Tên người được bảo hiểm                          |
| insured_home_address   | ✔        | string       | Địa chỉ nhà                                      |
| insurance_duration     | ✔        | int          | Thời hạn bảo hiểm (tháng/năm)                    |
| product_id             | ✔        | uint         | ID sản phẩm bảo hiểm                             |

#### **Kết quả trả về:**

```json
{
  "message": "Đã lưu thông tin hóa đơn bảo hiểm nhà!",
  "invoice_id": 10
}
```

### 2.2. API cập nhật customer cho hóa đơn nhà

- **Endpoint:** `POST /api/insurance_home/update_invoice_customer`

#### **Body JSON:**

| Trường      | Bắt buộc | Kiểu dữ liệu | Ghi chú              |
| ----------- | -------- | ------------ | -------------------- |
| invoice_id  | ✔        | uint         | ID hóa đơn nhà       |
| customer_id | ✔        | uint         | ID khách hàng đã tạo |

#### **Kết quả trả về:**

```json
{
  "message": "Đã cập nhật customer_id cho hóa đơn nhà!",
  "invoice_id": 10,
  "customer_id": 5
}
```

---

## 3. 🟨 participants (người tham gia bảo hiểm)

| Trường          | Kiểu dữ liệu | Ghi chú             |
| --------------- | ------------ | ------------------- |
| participant_id  | uint         | Tự sinh             |
| invoice_id      | uint         | Liên kết hóa đơn    |
| cmnd_img        | string       | Ảnh CMND/CCCD       |
| full_name       | string       | Họ tên              |
| gender          | string       | "Nam", "Nữ", "Khác" |
| birth_date      | date         | Ngày sinh           |
| identity_number | string       | Số CMND/CCCD        |
| created_at      | datetime     | Tự sinh             |
| updated_at      | datetime     | Tự sinh             |

---

## 4. 🟦 home_insurance_invoices (hóa đơn bảo hiểm nhà)

| Trường                 | Kiểu dữ liệu | Ghi chú                              |
| ---------------------- | ------------ | ------------------------------------ |
| invoice_id             | uint         | Tự sinh                              |
| user_id                | uint         | Người tạo hóa đơn                    |
| form_id                | uint/null    | Liên kết insurance_form, có thể null |
| customer_id            | uint/null    | Liên kết khách hàng, có thể null     |
| coverage_scope         | string       | Phạm vi bảo hiểm                     |
| home_type              | string       | Loại nhà                             |
| home_usage_status      | string       | "Mới" hoặc "Đã sử dụng"              |
| home_insurance_amount  | float        | Số tiền bảo hiểm cho nhà             |
| asset_insurance_amount | float        | Số tiền bảo hiểm cho tài sản         |
| insured_person_name    | string       | Tên người được bảo hiểm              |
| insured_home_address   | string       | Địa chỉ nhà                          |
| insurance_duration     | int          | Thời hạn bảo hiểm                    |
| product_id             | uint         | Sản phẩm bảo hiểm                    |
| created_at             | datetime     | Tự sinh                              |
| updated_at             | datetime     | Tự sinh                              |

---

## 📝 **Ghi chú cho frontend**

- **Các form bảo hiểm tai nạn chỉ khác nhau ở trường `insurance_package` (tên sản phẩm), còn lại giống nhau.**
- **Chỉ gửi các trường bắt buộc, các trường có thể null thì không cần gửi khi tạo mới.**
- **Luôn lấy `invoice_id` trả về từ backend để thực hiện các bước tiếp theo (gán customer, xác nhận, ...).**
- **Trường `participants` là mảng, mỗi phần tử là một người tham gia bảo hiểm.**
- **Các trường ngày nên gửi đúng định dạng ISO (`YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ssZ`).**

---

**Nếu cần thêm bảng hoặc API nào khác, chỉ cần yêu cầu, mình sẽ bổ sung tương tự!**

# API Quản trị & Thống kê Bảo hiểm - Hướng dẫn sử dụng & Triển khai biểu đồ

---

## 1. API Quản trị hóa đơn & khách hàng

### 1.1. Lấy danh sách tất cả hóa đơn (tổng hợp 3 loại)

**Endpoint:**  
`GET /api/admin/all-invoices`

**Trả về:**  
Danh sách hóa đơn của tất cả các loại (chung, du lịch, nhà), mỗi bản ghi có trường `invoice_type` để phân biệt.

```json
[
  {
    "invoice_id": 1,
    "invoice_type": "Chung",
    "product_name": "Bảo hiểm tai nạn con người 24/24",
    "customer_name": "Nguyễn Văn A",
    "insurance_start": "2025-05-22",
    "insurance_end": "2026-05-22",
    "insurance_amount": 1000000,
    "insurance_quantity": 2,
    "contract_type": "Mới",
    "status": "Đã thanh toán",
    "updated_at": "2025-05-22 19:17:21"
  },
  {
    "invoice_id": 2,
    "invoice_type": "Du lịch",
    "product_name": "Bảo hiểm du lịch quốc tế",
    "customer_name": "Trần Thị B",
    "departure_location": "Hà Nội",
    "destination": "Singapore",
    "departure_date": "2025-06-01",
    "return_date": "2025-06-10",
    "group_size": 5,
    "insurance_program": "Chương trình A",
    "insurance_package": "Gói VIP",
    "status": "Đã thanh toán",
    "updated_at": "2025-06-01 10:00:00"
  },
  ...
]
```

---

### 1.2. Lấy chi tiết hóa đơn (1 API động)

**Endpoint:**  
`GET /api/admin/invoice-detail?type={type}&id={invoice_id}`

- `type`: `"chung"`, `"travel"`, `"home"`
- `id`: mã hóa đơn

**Trả về:**  
Thông tin chi tiết hóa đơn, khách hàng, danh sách người tham gia (nếu có).

```json
{
  "invoice_id": 1,
  "invoice_type": "Chung",
  "product_name": "Bảo hiểm tai nạn con người 24/24",
  "customer": {
    "customer_id": 5,
    "full_name": "Nguyễn Văn A",
    "email": "a@gmail.com",
    "phone_number": "0123456789"
  },
  "participants": [
    {
      "participant_id": 1,
      "full_name": "Nguyễn Văn A",
      "birth_date": "1990-01-01",
      "gender": "Nam",
      "identity_number": "123456789"
    },
    ...
  ]
}
```

---

### 1.3. Tìm kiếm khách hàng theo ngày, sản phẩm, loại hóa đơn

**Endpoint:**  
`GET /api/admin/search-customers-by-date?date=YYYY-MM-DD[&product_id=...][&invoice_type=chung|travel|home]`

- `date`: ngày mua hàng (bắt buộc)
- `product_id`: lọc theo sản phẩm (tùy chọn)
- `invoice_type`: lọc theo loại hóa đơn (tùy chọn)

**Trả về:**  
Danh sách khách hàng đã mua hàng theo điều kiện lọc.

```json
[
  {
    "customer_id": 5,
    "full_name": "Nguyễn Văn A",
    "email": "a@gmail.com",
    "phone_number": "0123456789",
    "product_name": "Bảo hiểm tai nạn con người 24/24",
    "invoice_type": "Chung",
    "purchase_date": "2025-05-22"
  },
  ...
]
```

---

### 1.4. Thống kê số lượng & doanh thu sản phẩm theo ngày/tháng/năm (cho biểu đồ)

**Endpoint:**  
`GET /api/admin/product-statistics?group=day|month|year`

- `group`: `"day"` (mặc định), `"month"`, `"year"`

**Trả về:**  
Danh sách thống kê số lượng bán và doanh thu từng sản phẩm theo từng mốc thời gian.

```json
[
  {
    "product_id": 1,
    "product_name": "Bảo hiểm tai nạn con người 24/24",
    "total_sold": 10,
    "total_revenue": 10000000,
    "date_group": "2025-05-22"
  },
  {
    "product_id": 2,
    "product_name": "Bảo hiểm vật chất ô tô",
    "total_sold": 5,
    "total_revenue": 5000000,
    "date_group": "2025-05-22"
  },
  ...
]
```

---

## 2. Hướng dẫn xử lý dữ liệu để tạo biểu đồ

### 2.1. Biểu đồ tròn (Pie Chart)

- **Dữ liệu:** Lấy `product_name` và `total_sold` từ API `/api/admin/product-statistics?group=day` (hoặc `month`, `year`).
- **Cách vẽ:**
  - Mỗi lát cắt là một sản phẩm.
  - Kích thước lát cắt = số lượng bán của sản phẩm đó / tổng số lượng bán của tất cả sản phẩm.

### 2.2. Biểu đồ cột (Bar Chart)

- **Dữ liệu:** Lấy `product_name` và `total_sold` hoặc `total_revenue`.
- **Cách vẽ:**
  - Trục X: Tên sản phẩm.
  - Trục Y: Số lượng bán hoặc doanh thu.
  - Mỗi cột là một sản phẩm.

### 2.3. Biểu đồ đường (Line Chart)

- **Dữ liệu:** Lấy `date_group`, `product_name`, `total_sold` từ API (gọi với `group=day`, `month`, `year`).
- **Cách vẽ:**
  - Trục X: Thời gian (ngày/tháng/năm).
  - Trục Y: Số lượng bán.
  - Mỗi đường là một sản phẩm, thể hiện sự thay đổi số lượng bán theo thời gian.

---

## 3. Gợi ý triển khai frontend

- **Gọi API:**  
  Sử dụng fetch/Axios để lấy dữ liệu từ các endpoint trên.
- **Xử lý dữ liệu:**
  - Lọc, nhóm, tổng hợp theo nhu cầu (nếu cần).
  - Truyền dữ liệu vào thư viện vẽ biểu đồ như Chart.js, ECharts, Ant Design Charts, v.v.
- **Ví dụ gọi API:**
  ```js
  fetch("/api/admin/product-statistics?group=month")
    .then((res) => res.json())
    .then((data) => {
      // data là mảng các thống kê, truyền vào biểu đồ
    });
  ```

---

## 4. Lưu ý

- **Chỉ những hóa đơn có status = 'Đã thanh toán' mới được tính vào thống kê và tìm kiếm.**
- **Khi tạo hóa đơn mới, cần cập nhật status sang 'Đã thanh toán' để thống kê chính xác.**
- **Các API đều hỗ trợ lọc động theo ngày, sản phẩm, loại hóa đơn.**
- **Có thể mở rộng thêm các API thống kê khác nếu cần.**

---

# Tổng hợp thay đổi API & dữ liệu ngày 2025-05-29

---

## 1. **Thêm tính năng cập nhật (update) cho admin**

- **Cập nhật hóa đơn:**  
  `PUT /api/admin/update-invoice/:id?type=chung|travel|home`  
  Body: `{ ...các trường cần cập nhật... }`

- **Cập nhật khách hàng:**  
  `PUT /api/admin/update-customer/:id`  
  Body: `{ ...các trường cần cập nhật... }`

- **Cập nhật participant:**  
  `PUT /api/admin/update-participant/:id`  
  Body: `{ ...các trường cần cập nhật... }`

- **Cập nhật travel participant:**  
  `PUT /api/admin/update-travel-participant/:id`  
  Body: `{ ...các trường cần cập nhật... }`

---

## 2. **Thêm tính năng xóa mềm (soft delete) và xem lịch sử xóa**

- **Xóa hóa đơn:**  
  `DELETE /api/admin/delete-invoice/:id?type=chung|travel|home`  
  → Hóa đơn sẽ không bị xóa khỏi DB mà chỉ cập nhật trường `deleted_at`.

- **Xóa participant:**  
  `DELETE /api/admin/delete-participant/:id`  
  → Participant sẽ được soft delete (cập nhật trường `deleted_at`).

- **Xem lịch sử hóa đơn đã xóa:**  
  `GET /api/admin/deleted-invoices`  
  `GET /api/admin/deleted-invoices?type=chung|travel|home`  
  → Trả về danh sách hóa đơn đã bị xóa mềm.

- **Xem lịch sử participant đã xóa:**  
  `GET /api/admin/deleted-participants`  
  → Trả về danh sách participant đã bị xóa mềm.

---

## 3. **Thay đổi cấu trúc database**

- **Đã thêm trường `deleted_at` (kiểu DATETIME, cho phép NULL) vào các bảng:**
  - `invoices`
  - `travel_insurance_invoices`
  - `home_insurance_invoices`
  - `participants`
  - `travel_participants`

---

## 4. **Lưu ý khi lấy dữ liệu**

- **Các API lấy danh sách hóa đơn, participant... chỉ trả về bản ghi chưa bị xóa (`deleted_at IS NULL`).**
- **API lịch sử xóa sẽ trả về các bản ghi có `deleted_at IS NOT NULL`.**

---

## 5. **Các API khác vẫn giữ nguyên**

- Lấy danh sách hóa đơn: `GET /api/admin/all-invoices`
- Lấy chi tiết hóa đơn: `GET /api/admin/invoice-detail?type=...&id=...`
- Thống kê sản phẩm: `GET /api/admin/product-statistics?group=day|month|year`
- Tìm kiếm khách hàng: `GET /api/admin/search-customers-by-date?...`

---

## 6. **Hướng dẫn frontend**

- Khi muốn cập nhật, xóa, hoặc xem lịch sử xóa, sử dụng đúng endpoint như trên.
- Khi hiển thị danh sách, chỉ hiển thị bản ghi chưa bị xóa.
- Có thể xây dựng giao diện "Lịch sử xóa" để admin khôi phục hoặc kiểm tra các bản ghi đã bị xóa mềm.

---
