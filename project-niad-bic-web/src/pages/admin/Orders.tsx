import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Invoice {
  invoice_id: number;
  customer_name: string;
  customer_id?: number;
  updated_at: string;
  status?: string;
  product_name: string;
  insurance_amount?: number;
  home_insurance_amount?: number;
  asset_insurance_amount?: number;
  total_amount?: number;
  invoice_type: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/admin/all-invoices`, { withCredentials: true });
      setOrders(res.data);
    } catch (err) {
      setError("Không thể tải dữ liệu đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (invoiceId: number, type: string) => {
    navigate(`/admin/orders/${invoiceId}?type=${type}`);
  };

  const handleEdit = (invoiceId: number) => {
    alert(`Chức năng chỉnh sửa hóa đơn #${invoiceId} (bạn cần tự triển khai modal hoặc trang riêng)`);
  };

  const handleDelete = async (invoiceId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
      try {
        await axios.delete(`${API_URL}/api/admin/delete-invoice/${invoiceId}?type=chung`, { withCredentials: true });
        setOrders(orders.filter((o) => o.invoice_id !== invoiceId));
        alert("Xóa hóa đơn thành công!");
      } catch (err) {
        alert("Xóa hóa đơn thất bại!");
      }
    }
  };

  const getTotal = (order: Invoice) => {
    if (order.total_amount) return order.total_amount;
    if (order.insurance_amount) return order.insurance_amount;
    if (order.home_insurance_amount || order.asset_insurance_amount)
      return (order.home_insurance_amount || 0) + (order.asset_insurance_amount || 0);
    return 0;
  };

  // Khi render danh sách hóa đơn, map lại type:
  const mapType = (type: string) => {
    if (type === "Chung") return "chung";
    if (type === "Du lịch") return "travel";
    if (type === "Nhà") return "home";
    return "chung";
  };

  if (loading) return <div className="text-center py-8">Đang tải dữ liệu đơn hàng...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách hóa đơn</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">ID KH</th>
              <th className="p-2 text-center">Tên khách hàng</th>
              <th className="p-2 text-center">Ngày đặt</th>
              <th className="p-2 text-center">Tổng tiền</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 text-center">Sản phẩm</th>
              <th className="p-2 text-center">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.invoice_id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{o.customer_id || "-"}</td>
                <td className="p-2 text-center">{o.customer_name}</td>
                <td className="p-2 text-center">{o.updated_at}</td>
                <td className="p-2 font-semibold text-center">
                  {getTotal(o).toLocaleString()}₫
                </td>
                <td className="p-2 text-center">
                  <span
                    className={
                      o.status === "Đã thanh toán"
                        ? "inline-block px-2 py-1 bg-green-100 text-green-600 rounded text-xs"
                        : o.status === "Đã hủy"
                        ? "inline-block px-2 py-1 bg-red-100 text-red-600 rounded text-xs"
                        : "inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    }
                  >
                    {o.status || "Chưa xác định"}
                  </span>
                </td>
                <td className="p-2 text-center">{o.product_name}</td>
                <td className="p-2 space-x-2 text-center">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                    onClick={() => handleView(o.invoice_id, mapType(o.invoice_type))}
                  >
                    Xem
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition"
                    onClick={() => handleEdit(o.invoice_id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    onClick={() => handleDelete(o.invoice_id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;