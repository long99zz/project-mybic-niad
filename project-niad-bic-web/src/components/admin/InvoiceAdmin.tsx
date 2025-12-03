import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInvoices,
  deleteInvoice,
  updateInvoiceStatus,
  Invoice,
} from "@/services/invoice";
import axios from "axios";

const InvoiceAdmin: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Lỗi tải invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewDetail = (invoice: Invoice) => {
    // Sử dụng master_invoice_id để xem chi tiết
    if (invoice.master_invoice_id) {
      // Handle both string and ObjectID format
      const idStr = typeof invoice.master_invoice_id === 'object' 
        ? (invoice.master_invoice_id as any).$oid 
        : invoice.master_invoice_id;
      
      if (idStr) {
        navigate(`/admin/orders/${idStr}`);
      } else {
        alert("Không thể lấy master invoice ID");
      }
    } else {
      alert("Không có master invoice ID");
    }
  };

  const handleDelete = async (invoiceId: any, type: string) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    
    try {
      const token = sessionStorage.getItem("token");
      let url = "";
      
      // Convert invoiceId to string if it's an ObjectID
      const idStr = typeof invoiceId === 'object' && invoiceId.$oid 
        ? invoiceId.$oid 
        : String(invoiceId);
      
      if (type === "Chung") {
        url = `/api/admin/invoice/${idStr}`;
      } else if (type === "Du lịch") {
        url = `/api/admin/travel-invoice/${idStr}`;
      } else if (type === "Nhà") {
        url = `/api/admin/home-invoice/${idStr}`;
      } else if (type === "Tai nạn") {
        url = `/api/admin/accident-invoice/${idStr}`;
      }
      
      await axios.delete(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      alert("Xóa đơn hàng thành công!");
      fetchInvoices();
    } catch (error: any) {
      console.error("Lỗi xóa đơn hàng:", error);
      alert(error.response?.data?.error || "Không thể xóa đơn hàng");
    }
  };

  const handleStatusChange = async (invoiceId: any, currentStatus: string, type: string) => {
    let nextStatus = "Chưa thanh toán";
    if (currentStatus === "Chưa thanh toán") nextStatus = "Đã thanh toán";
    else if (currentStatus === "Đã thanh toán") nextStatus = "Chưa thanh toán";

    try {
      const token = sessionStorage.getItem("token");
      let url = "";
      
      // Convert invoiceId to string if it's an ObjectID
      const idStr = typeof invoiceId === 'object' && invoiceId.$oid 
        ? invoiceId.$oid 
        : String(invoiceId);
      
      if (type === "Chung") {
        url = `/api/admin/invoice/${idStr}/status`;
      } else if (type === "Du lịch") {
        url = `/api/admin/travel-invoice/${idStr}/status`;
      } else if (type === "Nhà") {
        url = `/api/admin/home-invoice/${idStr}/status`;
      } else if (type === "Tai nạn") {
        url = `/api/admin/accident-invoice/${idStr}/status`;
      }
      
      await axios.put(url, { status: nextStatus }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      alert("Cập nhật trạng thái thành công!");
      fetchInvoices();
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert(error.response?.data?.error || "Không thể cập nhật trạng thái");
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-bold">Quản lý Đơn hàng</h2>
      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Sản phẩm</th>
            <th className="p-2 border">Người mua</th>
            <th className="p-2 border">Ngày tạo</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            return (
              <tr key={invoice.invoice_type + '-' + invoice.invoice_id}>
                <td className="p-2 border">{invoice.invoice_id}</td>
                <td className="p-2 border">{invoice.product_name}</td>
                <td className="p-2 border">{invoice.customer_name}</td>
                <td className="p-2 border">{invoice.updated_at ? new Date(invoice.updated_at).toLocaleDateString('vi-VN') : ''}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      invoice.status === "Pending"
                        ? "bg-yellow-200"
                        : invoice.status === "Approved"
                        ? "bg-green-200"
                        : "bg-red-200"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="flex gap-2 p-2 border">
                  <button
                    onClick={() => handleViewDetail(invoice)}
                    className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                    title="Xem chi tiết đơn hàng"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(invoice.invoice_id, invoice.status || "Chưa thanh toán", invoice.invoice_type)
                    }
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                    title="Chuyển đổi trạng thái thanh toán"
                  >
                    Đổi trạng thái
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.invoice_id, invoice.invoice_type)}
                    className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                    title="Xóa đơn hàng này"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceAdmin;
