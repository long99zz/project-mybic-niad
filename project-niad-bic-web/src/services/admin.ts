import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Helper để lấy token
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============= DASHBOARD & STATISTICS =============

export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  total_users: number;
  total_products: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface OrdersByProduct {
  product_name: string;
  order_count: number;
}

export interface MonthlyStats {
  month: string;
  total_orders: number;
  completed_orders: number;
  revenue: number;
}

export interface ProductStats {
  product_id: number;
  product_name: string;
  total_orders: number;
  revenue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/dashboard/stats`, getAuthHeaders());
  return response.data;
};

export const getRevenueByMonth = async (): Promise<RevenueByMonth[]> => {
  const response = await axios.get(`${API_URL}/dashboard/revenue-by-month`, getAuthHeaders());
  return response.data;
};

export const getOrdersByProduct = async (): Promise<OrdersByProduct[]> => {
  const response = await axios.get(`${API_URL}/dashboard/orders-by-product`, getAuthHeaders());
  return response.data;
};

export const getMonthlyStatistics = async (months: number = 12): Promise<MonthlyStats[]> => {
  const response = await axios.get(`${API_URL}/statistics/monthly?months=${months}`, getAuthHeaders());
  return response.data;
};

export const getProductStatistics = async (): Promise<ProductStats[]> => {
  const response = await axios.get(`${API_URL}/statistics/products`, getAuthHeaders());
  return response.data;
};

// ============= ORDER MANAGEMENT =============

export interface AdminOrder {
  invoice_id: number;
  invoice_type: string;
  product_name: string;
  customer_name: string;
  email: string;
  phone: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  details: Record<string, any>;
}

export const getAllOrders = async () => {
  const response = await axios.get(`${API_URL}/all-invoices`, getAuthHeaders());
  return response.data;
};

export const getOrderDetail = async (id: number, type: string): Promise<AdminOrder> => {
  const response = await axios.get(`${API_URL}/orders/${id}?type=${type}`, getAuthHeaders());
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string, type: string) => {
  const response = await axios.put(
    `${API_URL}/orders/${id}/status?type=${type}`,
    { status },
    getAuthHeaders()
  );
  return response.data;
};

export const deleteOrder = async (id: number, type: string) => {
  const response = await axios.delete(`${API_URL}/orders/${id}?type=${type}`, getAuthHeaders());
  return response.data;
};

// ============= USER MANAGEMENT =============

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
  order_count: number;
  total_spent: number;
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
  return response.data;
};

export const getUserDetail = async (id: number): Promise<AdminUser> => {
  const response = await axios.get(`${API_URL}/users/${id}`, getAuthHeaders());
  return response.data;
};

export const updateUser = async (id: number, data: Partial<AdminUser>) => {
  const response = await axios.put(`${API_URL}/users/${id}`, data, getAuthHeaders());
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
  return response.data;
};

// ============= PRODUCT MANAGEMENT =============

export interface AdminProduct {
  product_id: number;
  name: string;
  description?: string;
  category_id?: number;
  price?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const getAllProducts = async (): Promise<AdminProduct[]> => {
  const response = await axios.get(`${API_URL}/products`, getAuthHeaders());
  return response.data;
};

export const getProductDetail = async (id: number): Promise<AdminProduct> => {
  const response = await axios.get(`${API_URL}/products/${id}`, getAuthHeaders());
  return response.data;
};

export const createProduct = async (data: Partial<AdminProduct>) => {
  const response = await axios.post(`${API_URL}/products`, data, getAuthHeaders());
  return response.data;
};

export const updateProduct = async (id: number, data: Partial<AdminProduct>) => {
  const response = await axios.put(`${API_URL}/products/${id}`, data, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await axios.delete(`${API_URL}/products/${id}`, getAuthHeaders());
  return response.data;
};
