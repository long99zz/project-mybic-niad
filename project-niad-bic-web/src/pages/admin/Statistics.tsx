import { useState, useEffect } from "react";



interface CategoryProductStat {
  category_id: number;
  category_name: string;
  quantity: number;
  price_lowest: number;
  price_highest: number;
  price_average: number;
}

interface OrderProductStat {
  category_name: string;
  product_name: string;
  order_count: number;
  sold_count: number;
}

interface ProductStatistic {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  total_sold: number;
  total_revenue: number;
  date_group: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Statistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [categoryStats, setCategoryStats] = useState<CategoryProductStat[]>([]);
  const [orderStats, setOrderStats] = useState<OrderProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy token từ sessionStorage
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Cần đăng nhập để xem thống kê");
          setLoading(false);
          return;
        }

        // Gọi API lấy thống kê sản phẩm theo ngày/tháng/năm
        const apiUrl = `http://localhost:5000/api/admin/product-statistics?group=${selectedPeriod}`;
        
        const productStatsResponse = await fetch(apiUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!productStatsResponse.ok) {
          const errorText = await productStatsResponse.text();
          throw new Error(`Failed to fetch product statistics (${productStatsResponse.status}): ${errorText}`);
        }

        const productStats: ProductStatistic[] = await productStatsResponse.json() || [];

        if (!productStats || productStats.length === 0) {
          setError("No data available");
          setCategoryStats([]);
          setOrderStats([]);
          setLoading(false);
          return;
        }

        // Xử lý dữ liệu để tạo thống kê theo danh mục
        const categoryMap = new Map<number, {
          category_id: number;
          category_name: string;
          quantity: number;
          price_lowest: number;
          price_highest: number;
          total_revenue: number;
        }>();

        const productMap = new Map<string, OrderProductStat>();

        // Group dữ liệu theo danh mục và sản phẩm
        productStats.forEach((stat) => {
          // Group by category để tính thống kê danh mục
          if (!categoryMap.has(stat.category_id)) {
            categoryMap.set(stat.category_id, {
              category_id: stat.category_id,
              category_name: stat.category_name,
              quantity: 0,
              price_lowest: Number.MAX_VALUE,
              price_highest: 0,
              total_revenue: 0,
            });
          }
          
          const category = categoryMap.get(stat.category_id)!;
          category.quantity += stat.total_sold;
          category.total_revenue += stat.total_revenue;
          
          if (stat.total_revenue > 0) {
            const avgPrice = stat.total_revenue / stat.total_sold;
            if (avgPrice < category.price_lowest) category.price_lowest = avgPrice;
            if (avgPrice > category.price_highest) category.price_highest = avgPrice;
          }

          // Group by product để tính thống kê sản phẩm
          const productKey = `${stat.product_id}`;
          if (!productMap.has(productKey)) {
            productMap.set(productKey, {
              category_name: stat.category_name,
              product_name: stat.product_name,
              order_count: stat.total_sold,
              sold_count: stat.total_sold,
            });
          }
        });

        // Convert category map to array và tính giá trung bình
        const categoryStatsArray: CategoryProductStat[] = Array.from(categoryMap.values()).map((cat) => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          quantity: cat.quantity,
          price_lowest: cat.price_lowest === Number.MAX_VALUE ? 0 : cat.price_lowest,
          price_highest: cat.price_highest,
          price_average: cat.quantity > 0 ? cat.total_revenue / cat.quantity : 0,
        }));

        setCategoryStats(categoryStatsArray);
        setOrderStats(Array.from(productMap.values()));
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        
        // Fallback: Show message but keep UI functional
        setCategoryStats([]);
        setOrderStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Bộ chọn khoảng thời gian */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod("day")}
            className={`px-4 py-2 rounded transition ${
              selectedPeriod === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Theo ngày
          </button>
          <button
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 rounded transition ${
              selectedPeriod === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setSelectedPeriod("year")}
            className={`px-4 py-2 rounded transition ${
              selectedPeriod === "year"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Theo năm
          </button>
        </div>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Lỗi: {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Thống kê sản phẩm theo danh mục */}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Thống kê sản phẩm theo danh mục
          </h2>
          {categoryStats.length === 0 ? (
            <p className="text-gray-500">Không có dữ liệu thống kê</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-2 text-center">#</th>
                    <th className="p-2 text-center">Tên danh mục</th>
                    <th className="p-2 text-center">Số lượng</th>
                    <th className="p-2 text-center">Giá thấp nhất</th>
                    <th className="p-2 text-center">Giá cao nhất</th>
                    <th className="p-2 text-center">Giá trung bình</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((item, index) => (
                    <tr
                      key={item.category_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{item.category_name}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">
                        {item.price_lowest.toLocaleString()}₫
                      </td>
                      <td className="p-2 text-center">
                        {item.price_highest.toLocaleString()}₫
                      </td>
                      <td className="p-2 text-center">
                        {item.price_average.toLocaleString()}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Thống kê đơn hàng */}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Thống kê đơn hàng</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition text-sm">
              Xem biểu đồ
            </button>
          </div>

          {orderStats.length === 0 ? (
            <p className="text-gray-500">Không có dữ liệu thống kê</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-2 text-center">#</th>
                    <th className="p-2 text-center">Tên danh mục</th>
                    <th className="p-2 text-center">Tên sản phẩm</th>
                    <th className="p-2 text-center">Số đơn hàng</th>
                    <th className="p-2 text-center">Đã bán</th>
                  </tr>
                </thead>
                <tbody>
                  {orderStats.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{item.category_name}</td>
                      <td className="p-2 text-center">{item.product_name}</td>
                      <td className="p-2 text-center">{item.order_count}</td>
                      <td className="p-2 text-center">{item.sold_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;
