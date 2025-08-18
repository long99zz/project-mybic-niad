// src/pages/CartPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Invoice {
  id: number;
  user_id: number;
  status: string;
  total_amount?: number;
  created_at?: string;
  invoice_type: "chung" | "travel" | "home";
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get("/api/cart", {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("API response:", res);
        setCart(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  console.log('CartPage state:', { loading, cart });
  if (loading) return <p className="mt-10 text-center">Đang tải giỏ hàng...</p>;

  if (cart.length === 0)
    return <p className="mt-10 text-center">Giỏ hàng của bạn đang trống.</p>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Giỏ hàng</h1>

      <div className="grid gap-4">
        {cart.map((item) => (
          <div
            key={`${item.invoice_type}-${item.id}`}
            className="p-4 transition border rounded-lg shadow-md hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">
                Hóa đơn #{item.id} -{" "}
                <span className="capitalize">{item.invoice_type}</span>
              </h2>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  item.status === "Chưa thanh toán"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {item.status}
              </span>
            </div>

            <p>Người dùng: {item.user_id}</p>
            {item.total_amount && (
              <p>
                Tổng tiền:{" "}
                <span className="font-bold text-red-600">
                  {item.total_amount.toLocaleString()} VND
                </span>
              </p>
            )}
            <p>Ngày tạo: {item.created_at || "Không rõ"}</p>

            <div className="flex gap-3 mt-3">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                Thanh toán
              </button>
              <button className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartPage;
