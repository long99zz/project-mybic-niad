-- Thêm cột vehicle_type vào bảng motorbike_insurance_forms
ALTER TABLE motorbike_insurance_forms
ADD COLUMN vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Xe máy';

-- Cập nhật các bản ghi hiện có (nếu có)
UPDATE motorbike_insurance_forms
SET vehicle_type = 'Xe máy'
WHERE vehicle_type IS NULL; 