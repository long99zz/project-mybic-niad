import axios from "axios";

const API_URL = "/api/admin/all-invoices"; // đúng route backend

export interface Invoice {
  invoice_id: number;
  master_invoice_id?: string; // ObjectID hex string for master invoice
  product_name: string;
  status?: string;
  created_at: string;
  updated_at: string;
  insurance_start?: string | null;
  insurance_end?: string | null;
  departure_date?: string | null;
  return_date?: string | null;
  invoice_type: string;
  customer_name?: string;
  insurance_amount?: number | null;
  home_usage_status?: string | null;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const token = sessionStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const getInvoiceDetail = async (master_invoice_id: string): Promise<any> => {
  const token = sessionStorage.getItem("token");
  // REQUIRED: Frontend MUST send master_invoice_id, not child invoice_id
  const res = await axios.get(`/api/invoice-detail/${master_invoice_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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
  
  const res = await axios.put(url, { status }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};
