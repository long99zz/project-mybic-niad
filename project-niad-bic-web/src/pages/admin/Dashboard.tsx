import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ProductStatistic {
  product_id: number;
  product_name: string;
  total_sold: number;
  total_revenue: number;
  date_group: string;
}
interface Invoice {
  invoice_id: number;
  product_name: string;
  status: string; // "Đã thanh toán", "Chưa thanh toán", "Đã hủy" hoặc code tương ứng
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [stats, setStats] = useState<ProductStatistic[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const salesChartRef = useRef<Chart | null>(null);

  // Fetch dữ liệu từ backend
  useEffect(() => {
    let group = "day";
    if (selectedPeriod === "month") group = "month";
    if (selectedPeriod === "year") group = "year";
    axios
      .get(`${API_URL}/api/admin/product-statistics?group=${group}`)
      .then((res) => {
        setStats(res.data);
        console.log("DATA FROM API:", res.data);
      })
      .catch((err) => {
        setStats([]);
        console.error("API error:", err);
      });
  }, [selectedPeriod]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/all-invoices`)
      .then((res) => {
        setInvoices(res.data);
        console.log("ALL INVOICES:", res.data);
      })
      .catch((err) => {
        setInvoices([]);
        console.error("API error (all-invoices):", err);
      });
  }, []);

  // Biểu đồ doanh thu
  useEffect(() => {
    const labels = Array.from(new Set(stats.map((item) => item.date_group))).sort();
    const productNames = Array.from(new Set(stats.map((item) => item.product_name)));
    const datasets = productNames.map((name, idx) => ({
      label: name,
      data: labels.map(
        (date) =>
          stats.find((item) => item.product_name === name && item.date_group === date)?.total_revenue || 0
      ),
      borderColor: `hsl(${(idx * 360) / productNames.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(idx * 360) / productNames.length}, 70%, 50%, 0.1)`,
      tension: 0.4,
      fill: true,
    }));

    const salesCtx = document.getElementById("salesChart") as HTMLCanvasElement;
    if (salesCtx) {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      salesChartRef.current = new Chart(salesCtx, {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: "bottom" },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${(Number(value) / 1000000).toFixed(1)}M`,
              },
            },
          },
        },
      });
    }
    return () => {
      if (salesChartRef.current) salesChartRef.current.destroy();
    };
  }, [stats, selectedPeriod]);

  // Thống kê nhanh
  const totalRevenue = stats.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const totalOrders = stats.reduce((sum, s) => sum + (s.total_sold || 0), 0);
  const paidOrders = invoices.filter(i => getStatusText(i.status) === "Đã thanh toán").length;
  const cancelledOrders = invoices.filter(i => getStatusText(i.status) === "Đã hủy").length;

  const quickStats = [
    { icon: "💰", title: "Tổng doanh thu", value: totalRevenue, change: 0 },
    { icon: "📝", title: "Tổng đơn hàng", value: totalOrders, change: 0 },
    { icon: "✅", title: "Đơn đã thanh toán", value: paidOrders, change: 0 },
    { icon: "❌", title: "Đơn đã hủy", value: cancelledOrders, change: 0 },
  ];

  // Hàm chuyển trạng thái đơn hàng từ số sang text (giả sử backend trả về status dạng số, nếu là text thì bỏ)
  function getStatusText(status: string | number) {
    if (status === "Đã thanh toán" || status === "paid" || status === 1) return "Đã thanh toán";
    if (status === "Đã hủy" || status === "cancelled" || status === 2) return "Đã hủy";
    return "Chưa thanh toán";
  }

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-sm font-medium ${
                  stat.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change >= 0 ? "+" : ""}
                {stat.change}%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">
              {stat.title.includes("doanh thu")
                ? `${stat.value.toLocaleString()}₫`
                : stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Doanh thu theo thời gian</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
          <div className="h-80">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        {/* Trạng thái đơn hàng */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2 text-center">Trạng thái đơn hàng</h3>
          <div className="overflow-x-auto" style={{ maxHeight: 220, overflowY: "auto" }}>
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold border-b">Tên sản phẩm</th>
                  <th className="px-4 py-2 text-left font-semibold border-b">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-4 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
                {invoices.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 align-middle">{item.product_name}</td>
                    <td className="px-4 py-2 align-middle">
                      <span
                        className={
                          getStatusText(item.status) === "Đã thanh toán"
                            ? "text-green-600 font-semibold"
                            : getStatusText(item.status) === "Đã hủy"
                            ? "text-red-600 font-semibold"
                            : "text-gray-600 font-semibold"
                        }
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;