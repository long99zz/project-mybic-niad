import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import {
  getDashboardStats,
  getRevenueByMonth,
  getOrdersByProduct,
  DashboardStats as DashboardStatsType,
  RevenueByMonth,
  OrdersByProduct,
} from "@/services/admin";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByMonth[]>([]);
  const [ordersData, setOrdersData] = useState<OrdersByProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const salesChartRef = useRef<Chart | null>(null);
  const ordersChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, revenueData, ordersData] = await Promise.all([
        getDashboardStats(),
        getRevenueByMonth(),
        getOrdersByProduct(),
      ]);
      setStats(statsData);
      setRevenueData(revenueData || []);
      setOrdersData(ordersData || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  useEffect(() => {
    // Khởi tạo biểu đồ doanh thu
    const salesCtx = document.getElementById("salesChart") as HTMLCanvasElement;
    
    if (salesCtx && revenueData.length > 0) {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }

      const last6Months = revenueData.slice(-6);
      
      salesChartRef.current = new Chart(salesCtx, {
        type: "line",
        data: {
          labels: last6Months.map((item) => item.month),
          datasets: [
            {
              label: "Doanh thu",
              data: last6Months.map((item) => item.revenue),
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
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

    // Khởi tạo biểu đồ đơn hàng theo sản phẩm
    const ordersCtx = document.getElementById(
      "ordersChart"
    ) as HTMLCanvasElement;
    if (ordersCtx && ordersData.length > 0) {
      if (ordersChartRef.current) {
        ordersChartRef.current.destroy();
      }

      const top5Products = ordersData.slice(0, 5);
      
      ordersChartRef.current = new Chart(ordersCtx, {
        type: "doughnut",
        data: {
          labels: top5Products.map((item) => item.product_name),
          datasets: [
            {
              data: top5Products.map((item) => item.order_count),
              backgroundColor: [
                "rgb(234, 179, 8)",
                "rgb(59, 130, 246)",
                "rgb(16, 185, 129)",
                "rgb(34, 197, 94)",
                "rgb(239, 68, 68)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    } else {
      console.error("ordersChart canvas element not found!");
    }

    return () => {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      if (ordersChartRef.current) {
        ordersChartRef.current.destroy();
      }
    };
  }, [revenueData, ordersData]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const mockStats = [
    {
      title: "Tổng doanh thu",
      value: stats.total_revenue,
      change: 12.5,
      icon: "💰",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.total_orders,
      change: 8.2,
      icon: "📦",
    },
    {
      title: "Tổng sản phẩm",
      value: stats.total_products,
      change: 5.4,
      icon: "📱",
    },
    {
      title: "Tổng người dùng",
      value: stats.total_users,
      change: 15.3,
      icon: "👥",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
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
                ? formatCurrency(stat.value)
                : stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Grid Bổ sung */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-1">Đơn chưa thanh toán</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-1">Đơn đã thanh toán</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completed_orders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-1">Tỷ lệ hoàn thành</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.total_orders > 0 
              ? `${((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}%`
              : '0%'}
          </p>
        </div>
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

        {/* Biểu đồ trạng thái đơn hàng */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h3>
          <div className="h-80">
            <canvas id="ordersChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
