import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface StatItem {
  title: string;
  value: number;
  change: number;
  icon: string;
}

const mockStats = [
  {
    title: "Tổng doanh thu",
    value: 150000000,
    change: 12.5,
    icon: "💰",
  },
  {
    title: "Tổng đơn hàng",
    value: 150,
    change: 8.2,
    icon: "📦",
  },
  {
    title: "Tổng sản phẩm",
    value: 1200,
    change: 5.4,
    icon: "📱",
  },
  {
    title: "Tổng người dùng",
    value: 850,
    change: 15.3,
    icon: "👥",
  },
];

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const salesChartRef = useRef<Chart | null>(null);
  const ordersChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Khởi tạo biểu đồ doanh thu
    const salesCtx = document.getElementById("salesChart") as HTMLCanvasElement;
    if (salesCtx) {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      salesChartRef.current = new Chart(salesCtx, {
        type: "line",
        data: {
          labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
          datasets: [
            {
              label: "Doanh thu",
              data: [
                12000000, 19000000, 15000000, 25000000, 22000000, 30000000,
                28000000,
              ],
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

    // Khởi tạo biểu đồ đơn hàng
    const ordersCtx = document.getElementById(
      "ordersChart"
    ) as HTMLCanvasElement;
    if (ordersCtx) {
      if (ordersChartRef.current) {
        ordersChartRef.current.destroy();
      }
      ordersChartRef.current = new Chart(ordersCtx, {
        type: "doughnut",
        data: {
          labels: [
            "Chờ xác nhận",
            "Đã xác nhận",
            "Đang giao",
            "Hoàn thành",
            "Đã hủy",
          ],
          datasets: [
            {
              data: [12, 19, 3, 5, 2],
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
    }

    return () => {
      if (salesChartRef.current) {
        salesChartRef.current.destroy();
      }
      if (ordersChartRef.current) {
        ordersChartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
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
