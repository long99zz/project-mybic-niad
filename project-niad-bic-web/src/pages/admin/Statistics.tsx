import React, { useState } from "react";

interface StatItem {
  title: string;
  value: number;
  change: number;
  icon: string;
}

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

const mockCategoryProductStats: CategoryProductStat[] = [
  {
    category_id: 1,
    category_name: "Máy Tính Để Bàn",
    quantity: 1,
    price_lowest: 6500000,
    price_highest: 6500000,
    price_average: 6500000,
  },
  {
    category_id: 2,
    category_name: "Laptop văn phòng",
    quantity: 3,
    price_lowest: 9290000,
    price_highest: 15490000,
    price_average: 12556667,
  },
  {
    category_id: 3,
    category_name: "Laptop Gaming",
    quantity: 7,
    price_lowest: 111,
    price_highest: 25990000,
    price_average: 15262873,
  },
];

const mockOrderProductStats: OrderProductStat[] = [
  {
    category_name: "Laptop Gaming",
    product_name:
      'Laptop MSI Modern 14 C7M-221VN R7 7730U/8GB/512GB/14" FHD IPS/Win 11',
    order_count: 5,
    sold_count: 6,
  },
  {
    category_name: "Laptop Gaming",
    product_name:
      'Laptop Lenovo LOQ 15APH8 R5 7640HS/8GB/512GB/15.6" FHD/Win11',
    order_count: 1,
    sold_count: 1,
  },
  {
    category_name: "Laptop Gaming",
    product_name:
      'Laptop Asus Vivobook 15 OLED A1505VA-L1113W i5 13500H/16GB/512GB/15.6" FHD/Win11',
    order_count: 6,
    sold_count: 7,
  },
  {
    category_name: "Laptop Gaming",
    product_name:
      'Laptop Asus TUF Gaming FX507ZC4-HN095W i5 12500H/16GB/512GB/15.6"/Nvidia RTX 3050 4GB/Win11',
    order_count: 1,
    sold_count: 1,
  },
  {
    category_name: "Laptop Gaming",
    product_name:
      "Laptop Acer Nitro V Gaming ANV15-51-55CA i5 13420H/16GB/512GB/15.6",
    order_count: 0,
    sold_count: 0,
  },
  {
    category_name: "Laptop Gaming",
    product_name:
      'Laptop Acer Gaming Aspire 5 A515-58GM-53PZ i5 13420H/8GB/512GB/15.6"FHD/RTX2050 4GB/Win11',
    order_count: 3,
    sold_count: 3,
  },
  {
    category_name: "Laptop Gaming",
    product_name: "1111",
    order_count: 0,
    sold_count: 0,
  },
  {
    category_name: "Laptop văn phòng",
    product_name:
      'Laptop Lenovo IdeaPad 3 14IAH8 i5 12450H/16GB/512GB/14"FHD/Win11',
    order_count: 2,
    sold_count: 2,
  },
  {
    category_name: "Laptop văn phòng",
    product_name: 'Laptop HP 245 G10 R5-7520U/8GB/256GB/14"FHD/Win11 (9H8X8PT)',
    order_count: 1,
    sold_count: 1,
  },
  {
    category_name: "Laptop văn phòng",
    product_name:
      'Laptop Dell Vostro 3520 i5 1235U/16GB/512GB/15.6"FHD/Win11/Office HS21',
    order_count: 1,
    sold_count: 1,
  },
  {
    category_name: "Máy Tính Để Bàn",
    product_name: "NNPC Văn Phòng H510 Core i3, i5 10th / Window 10",
    order_count: 8,
    sold_count: 8,
  },
];

const Statistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  return (
    <div className="space-y-6">
      {/* Thống kê sản phẩm theo danh mục */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Thống kê sản phẩm theo danh mục
        </h2>
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
              {mockCategoryProductStats.map((item, index) => (
                <tr
                  key={item.category_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-left">{item.category_name}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">
                    {item.price_lowest.toLocaleString()}₫
                  </td>
                  <td className="p-2 text-right">
                    {item.price_highest.toLocaleString()}₫
                  </td>
                  <td className="p-2 text-right">
                    {item.price_average.toLocaleString()}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thống kê đơn hàng */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Thống kê đơn hàng</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition text-sm">
            Xem biểu đồ
          </button>
        </div>

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
              {mockOrderProductStats.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-left">{item.category_name}</td>
                  <td className="p-2 text-left">{item.product_name}</td>
                  <td className="p-2 text-center">{item.order_count}</td>
                  <td className="p-2 text-center">{item.sold_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
