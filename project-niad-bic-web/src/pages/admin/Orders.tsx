import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Tạm thời bỏ Link

interface Order {
  id: number;
  name: string;
  date: string;
  total: number;
  status: string;
}

const mockOrders = [
  {
    id: 1,
    name: "đỗ đức mạnh",
    date: "28-07-2024 21:30",
    total: 10990000,
    status: "Chờ xác nhận",
  },
  {
    id: 2,
    name: "đỗ đức mạnh",
    date: "28-07-2024 21:25",
    total: 16490000,
    status: "Chờ xác nhận",
  },
  {
    id: 3,
    name: "đỗ đức mạnh",
    date: "23-07-2024 16:02",
    total: 6500000,
    status: "Chờ xác nhận",
  },
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Thay thế bằng lệnh gọi API thực tế
      console.log("Fetching orders...");
      // const response = await fetch('/api/admin/orders');
      // if (!response.ok) { throw new Error('Failed to fetch orders'); }
      // const data = await response.json();
      // setOrders(data);

      // Mô phỏng độ trễ API và dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrders(mockOrders);
      console.log("Orders fetched:", mockOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải dữ liệu đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Các hàm CRUD placeholder
  const handleView = (orderId: number) => {
    // TODO: Triển khai chức năng xem chi tiết đơn hàng (có thể dùng routing)
    console.log("Viewing order with ID:", orderId);
    alert(`Xem chi tiết đơn hàng ${orderId}`);
  };

  const handleEdit = (orderId: number) => {
    // TODO: Triển khai chức năng chỉnh sửa đơn hàng (có thể dùng routing hoặc modal)
    console.log("Editing order with ID:", orderId);
    alert(`Chỉnh sửa đơn hàng ${orderId}`);
  };

  const handleDelete = async (orderId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      // TODO: Thay thế bằng lệnh gọi API xóa thực tế
      console.log("Attempting to delete order with ID:", orderId);
      try {
        // const response = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
        // if (!response.ok) { throw new Error('Failed to delete order'); }

        // Mô phỏng độ trễ API và cập nhật trạng thái
        await new Promise((resolve) => setTimeout(resolve, 300));
        setOrders(orders.filter((order) => order.id !== orderId));
        console.log("Order deleted with ID:", orderId);
        alert("Xóa đơn hàng thành công!");
      } catch (err) {
        console.error("Error deleting order:", err);
        setError("Không thể xóa đơn hàng.");
        alert("Xóa đơn hàng thất bại!");
      }
    }
  };

  const handleCreate = () => {
    // TODO: Triển khai chức năng tạo đơn hàng mới (có thể dùng routing hoặc modal)
    console.log("Initiating order creation...");
    alert("Chức năng tạo đơn hàng mới");
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu đơn hàng...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách đơn hàng</h2>
      <div className="mb-4 flex justify-between items-center">
        {/* Nút Xuất Excel - dùng button tạm thời */}
        <button className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition">
          Xuất Excel
        </button>
        {/* Nút Thêm đơn hàng mới */}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          onClick={handleCreate}
        >
          Thêm đơn hàng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-center">Tên khách hàng</th>
              <th className="p-2 text-center">Ngày đặt</th>
              <th className="p-2 text-center">Tổng tiền</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2 text-center">{o.name}</td>
                <td className="p-2 text-center">{o.date}</td>
                <td className="p-2 font-semibold text-center">
                  {o.total.toLocaleString()}₫
                </td>
                <td className="p-2 text-center">
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                    {o.status}
                  </span>
                </td>
                <td className="p-2 space-x-2 text-center">
                  {/* <Link to={\`/admin/orders/${o.id}\`} className=\"px-2 py-1 bg-green-500 text-white rounded text-xs\">Xem</Link> */}
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                    onClick={() => handleView(o.id)}
                  >
                    Xem
                  </button>
                  {/* <Link to={\`/admin/orders/${o.id}/edit\`} className=\"px-2 py-1 bg-gray-400 text-white rounded text-xs\">Sửa</Link> */}
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition"
                    onClick={() => handleEdit(o.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    onClick={() => handleDelete(o.id)}
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
