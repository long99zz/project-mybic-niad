import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface CreatePaymentRequest {
  invoice_id: number;
  amount: number;
  order_info: string;
}

export interface CreatePaymentResponse {
  payment_url: string;
  session_id: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  session_id?: string;
  invoice_id?: number;
  amount?: number;
  product_name?: string;
}

// Tạo Stripe Checkout Session
export const createPayment = async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(`${API_URL}/payment/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Verify kết quả thanh toán từ Stripe (gọi endpoint backend để update status)
export const verifyPayment = async (queryParams: string): Promise<PaymentResult> => {
  // Không cần token vì endpoint /return là public
  const response = await axios.get(`${API_URL}/payment/stripe/return?${queryParams}`);
  return response.data;
};
