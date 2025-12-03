import { useEffect, useState } from 'react';
import {
  getDashboardStats,
  getRevenueByMonth,
  getOrdersByProduct,
  DashboardStats,
  RevenueByMonth,
  OrdersByProduct,
} from '@/services/admin';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Clock } from 'lucide-react';

export default function DashboardNew() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
  const [ordersByProduct, setOrdersByProduct] = useState<OrdersByProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
      setRevenueByMonth(revenueData);
      setOrdersByProduct(ordersData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">Không thể tải dữ liệu dashboard</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản trị</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Tổng đơn hàng</h3>
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total_orders}</div>
          <div className="mt-2 flex gap-3">
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              {stats.pending_orders} chờ
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats.completed_orders} hoàn thành
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Tổng doanh thu</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.total_revenue)}
          </div>
          <p className="mt-2 text-xs text-gray-500">Từ đơn đã thanh toán</p>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Người dùng</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
          <p className="mt-2 text-xs text-gray-500">Tài khoản đã đăng ký</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Đơn chờ xử lý</h3>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending_orders}</div>
          <p className="mt-2 text-xs text-gray-500">Cần xử lý ngay</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Đơn hoàn thành</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.completed_orders}</div>
          <p className="mt-2 text-xs text-gray-500">
            {stats.total_orders > 0
              ? `${((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}% tổng đơn`
              : '0%'}
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Sản phẩm</h3>
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total_products}</div>
          <p className="mt-2 text-xs text-gray-500">Sản phẩm đang bán</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="mb-6 text-xl font-bold text-gray-800">
          📈 Doanh thu theo tháng (6 tháng gần nhất)
        </h2>
        {revenueByMonth.length > 0 ? (
          <div className="space-y-4">
            {revenueByMonth.slice(-6).map((item) => {
              const maxRevenue = Math.max(...revenueByMonth.map((r) => r.revenue));
              const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={item.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.month}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">Chưa có dữ liệu doanh thu</p>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="mb-6 text-xl font-bold text-gray-800">🏆 Top 10 sản phẩm bán chạy</h2>
        {ordersByProduct.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Số đơn
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersByProduct.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                      {item.order_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        {((item.order_count / stats.total_orders) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">Chưa có dữ liệu sản phẩm</p>
        )}
      </div>
    </div>
  );
}
