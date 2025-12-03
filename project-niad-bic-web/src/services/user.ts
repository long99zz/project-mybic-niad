import axios from "axios";
const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = API_URL.replace(/\/api\/?$/, "");

export const getUserInfo = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserInfo = async (data: any) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.put(`${API_URL}/user`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
  const token = sessionStorage.getItem("token");
  const response = await axios.post(`${API_URL}/user/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await axios.post(`${API_BASE}/register`, data);
  return response.data;
};

export const getUserOrders = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${API_URL}/my-invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCartData = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${API_URL}/my-invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Filter for unpaid invoices only (status = "Chưa thanh toán")
  const allInvoices = Array.isArray(response.data) ? response.data : [];
  const unpaidInvoices = allInvoices.filter(
    (invoice: any) => invoice.status === "Chưa thanh toán" || invoice.status === "Pending"
  );
  
  return unpaidInvoices;
};
