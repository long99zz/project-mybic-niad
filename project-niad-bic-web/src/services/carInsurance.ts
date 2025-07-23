import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Interface cho dữ liệu hóa đơn
interface InvoiceData {
  contract_type: "Mới" | "Tái tục";
  total_amount: number;
  payment_method: string;
  note?: string;
}

// Interface cho dữ liệu thông tin xe
interface CarInsuranceFormData {
  user_type: "Cá nhân" | "Doanh nghiệp";
  identity_number: string;
  usage_purpose: string;
  vehicle_type: string;
  seat_count: number;
  load_capacity: number;
  owner_name: string;
  registration_address: string;
  license_plate_status: "Mới" | "Cũ" | "Chưa có";
  license_plate: string;
  chassis_number: string;
  engine_number: string;
  insurance_start: string;
  insurance_duration: number;
  insurance_fee: number;
  insurance_amount: number;
  participant_count: number;
}

// Interface cho dữ liệu khách hàng
interface CustomerRegistrationData {
  customer_type: "Cá nhân" | "Doanh nghiệp";
  identity_number: string;
  full_name: string;
  address: string;
  email: string;
  phone_number: string;
  invoice_request: boolean;
  notes?: string;
}

// Interface cho dữ liệu xác nhận mua hàng
interface ConfirmPurchaseData {
  invoice_id: number;
  customer_id: number;
  form_id: number;
}

// Tạo hóa đơn
export const createInvoice = async (data: InvoiceData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_car_owner/create_invoice`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo thông tin xe
export const createCarInsuranceForm = async (data: CarInsuranceFormData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_car_owner/create_car_insurance_form`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo thông tin khách hàng
export const createCustomerRegistration = async (
  data: CustomerRegistrationData
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_car_owner/create_customer_registration`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xác nhận mua hàng
export const confirmPurchase = async (data: ConfirmPurchaseData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/insurance_car_owner/confirm_purchase`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm xử lý toàn bộ quy trình mua bảo hiểm
export const processCarInsurancePurchase = async (
  invoiceData: InvoiceData,
  carInsuranceFormData: CarInsuranceFormData,
  customerRegistrationData: CustomerRegistrationData
) => {
  try {
    // 1. Tạo hóa đơn
    const invoiceResponse = await createInvoice(invoiceData);
    const invoiceId = invoiceResponse.invoice_id;

    // 2. Tạo thông tin xe
    const carFormResponse = await createCarInsuranceForm(carInsuranceFormData);
    const formId = carFormResponse.form_id;

    // 3. Tạo thông tin khách hàng
    const customerResponse = await createCustomerRegistration(
      customerRegistrationData
    );
    const customerId = customerResponse.customer_id;

    // 4. Xác nhận mua hàng
    const confirmData: ConfirmPurchaseData = {
      invoice_id: invoiceId,
      customer_id: customerId,
      form_id: formId,
    };
    const confirmResponse = await confirmPurchase(confirmData);

    return {
      success: true,
      data: {
        invoice_id: invoiceId,
        form_id: formId,
        customer_id: customerId,
        confirm_response: confirmResponse,
      },
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
