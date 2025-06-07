import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Interface cho form bảo hiểm xe máy
export interface MotorbikeInsuranceFormData {
  engine_capacity: number;
  accident_coverage: number;
  insurance_duration: number;
  owner_name: string;
  registration_address: string;
  license_plate_status: boolean;
  license_plate: string;
  chassis_number: string;
  engine_number: string;
  insurance_start: string;
  insurance_fee: number;
}

// Interface cho thông tin khách hàng
export interface CustomerRegistrationData {
  customer_type: "Cá nhân" | "Tổ chức";
  identity_number: string;
  full_name: string;
  address: string;
  email: string;
  phone_number: string;
  invoice_request: boolean;
  notes?: string;
}

// Interface cho thông tin thanh toán
export interface PaymentData {
  form_id: number;
  customer_id: number;
  payment_method: string;
  amount: number;
}

// Tạo form bảo hiểm xe máy
export const createMotorbikeInsuranceForm = async (data: MotorbikeInsuranceFormData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_motorbike_owner/create_motorbike_insurance_form`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo thông tin khách hàng
export const createCustomerRegistration = async (data: CustomerRegistrationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_motorbike_owner/create_customer_registration`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xử lý thanh toán
export const processPayment = async (data: PaymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_motorbike_owner/create_invoice`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
