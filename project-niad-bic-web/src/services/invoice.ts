import axios from "axios";

const API_URL = "/api/admin/all-invoices"; // đúng route backend

export interface Invoice {
  invoice_id: number;
  product_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  insurance_start: string;
  insurance_end: string;
  invoice_type: string;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const token = sessionStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const getInvoiceDetail = async (id: number): Promise<Invoice> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createInvoice = async (invoice: Partial<Invoice>) => {
  const res = await axios.post(API_URL, invoice);
  return res.data;
};

export const updateInvoice = async (id: number, invoice: Partial<Invoice>) => {
  const res = await axios.put(`${API_URL}/${id}`, invoice);
  return res.data;
};

export const deleteInvoice = async (id: number, type: string = "Chung") => {
  const token = sessionStorage.getItem("token");
  let url = "";
  if (type === "Chung") url = `/api/admin/invoice/${id}`;
  else if (type === "Du lịch") url = `/api/admin/travel-invoice/${id}`;
  else if (type === "Nhà") url = `/api/admin/home-invoice/${id}`;
  await axios.delete(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const updateInvoiceStatus = async (id: number, status: string, type: string = "Chung") => {
  const token = sessionStorage.getItem("token");
  let url = "";
  
  // Debugging - force new endpoint
  if (type === "Chung") {
    url = `/api/admin/invoice/${id}/status`;
  } else if (type === "Du lịch") {
    url = `/api/admin/travel-invoice/${id}/status`;
  } else if (type === "Nhà") {
    url = `/api/admin/home-invoice/${id}/status`;
  } else {
    url = `/api/admin/invoice/${id}/status`; // fallback
  }
  
  console.log('FORCE UPDATE - type:', type, 'id:', id, 'url:', url);
  
  const res = await axios.put(url, { status }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};
