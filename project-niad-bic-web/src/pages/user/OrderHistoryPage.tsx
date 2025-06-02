import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Download } from "lucide-react";

// Mock data - sẽ được thay thế bằng API call
const mockOrders = [
  {
    id: "ORD001",
    date: "2024-03-15",
    status: "completed",
    total: 1500000,
    product: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
    policyNumber: "BH-2024-001",
  },
  {
    id: "ORD002",
    date: "2024-03-10",
    status: "pending",
    total: 2500000,
    product: "Bảo hiểm vật chất ô tô",
    policyNumber: "BH-2024-002",
  },
  {
    id: "ORD003",
    date: "2024-03-05",
    status: "cancelled",
    total: 500000,
    product: "Bảo hiểm tai nạn 24/24",
    policyNumber: "BH-2024-003",
  },
];

const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  completed: "Hoàn thành",
  pending: "Đang xử lý",
  cancelled: "Đã hủy",
};

const OrderHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý đơn hàng
        </h2>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Đang xử lý</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày mua
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.policyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.total.toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-gray-600 hover:text-red-600"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-600"
                        title="Tải xuống"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
