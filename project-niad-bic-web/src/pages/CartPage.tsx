// src/pages/CartPage.tsx
import React, { useEffect, useState } from "react";
import { Invoice } from "../services/invoice";
import { getUserInfo, getCartData } from "../services/user";
import { createPayment } from "../services/payment";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getBannerImageByProductName } from "../data/productDetails";

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const [orders, user] = await Promise.all([
          getCartData(),
          getUserInfo()
        ]);
        setUserInfo(user);
        // Lọc đơn chưa thanh toán
        let filtered = Array.isArray(orders)
          ? orders.filter((item) => (item.status === "Chưa thanh toán" || item.home_usage_status === "Chưa thanh toán"))
          : [];
        // Sắp xếp theo created_at giảm dần (mới nhất trước)
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || a.CreatedAt || 0).getTime();
          const dateB = new Date(b.created_at || b.CreatedAt || 0).getTime();
          return dateB - dateA;
        });
        setCart(filtered);
      } catch (error) {
        setCart([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handlePayment = async (item: Invoice) => {
    try {
      setLoading(true);

      // CRITICAL: Must send master_invoice_id, not child invoice_id
      const invoiceIdToSend = (item as any).master_invoice_id || item.invoice_id;
      
      const paymentData = {
        invoice_id: invoiceIdToSend,
        amount: item.insurance_amount || 0,
        order_info: `Thanh toán đơn hàng #${invoiceIdToSend} - ${item.product_name}`,
      };
      
      const response = await createPayment(paymentData);

      // Redirect đến Stripe Checkout
      window.location.href = response.payment_url;
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này khỏi giỏ?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "/dang-nhap";
        return;
      }

      // Use master_invoice_id if available, otherwise use invoice_id
      const invoiceId = item.master_invoice_id || item.invoice_id;
      
      const response = await fetch(`/api/cart/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        // Hiển thị message cụ thể từ backend
        alert(error.error || "Xóa đơn hàng thất bại. Chỉ có thể xóa đơn hàng chưa thanh toán.");
        return;
      }

      const result = await response.json();

      // Xóa thành công - cập nhật UI
      setCart((prevCart) => prevCart.filter((cartItem) => cartItem.invoice_id !== item.invoice_id));
      alert(result.message || "Đã xóa đơn hàng khỏi giỏ!");
    } catch (error: any) {
      alert("Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <p className="mt-[120px] text-center">Đang tải giỏ hàng...</p>
      <Footer />
    </>
  );
  
  if (cart.length === 0) return (
    <>
      <Navbar />
      <p className="mt-[120px] text-center">Giỏ hàng của bạn đang trống.</p>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="bg-[#f6fafb] min-h-screen py-8 pt-[100px]">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-left">Giỏ hàng của bạn</h1>
          <div className="flex flex-col gap-6">
          {cart.map((item) => (
            <div key={item.invoice_id} className="flex flex-col md:flex-row md:items-start border rounded-lg p-4 gap-4 bg-[#f8fefc]">
              <div className="flex-shrink-0 w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Ảnh sản phẩm nếu có - lấy từ productDetails */}
                <img src={getBannerImageByProductName(item.product_name)} alt={item.product_name || 'product'} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-[#1a3c40]">{item.product_name}</span>
                </div>
                <div className="text-sm text-gray-700 mb-1">Người mua bảo hiểm: <span className="font-medium">{item.customer_name || ((userInfo?.last_name || userInfo?.LastName || "") + " " + (userInfo?.first_name || userInfo?.FirstName || "")).trim() || "-"}</span></div>
                <div className="text-sm text-gray-700 mb-1">Ngày bắt đầu: <span className="font-medium">{(() => {
                  const startDate = item.insurance_start || item.departure_date;
                  return startDate ? new Date(startDate).toLocaleDateString('vi-VN') : "-";
                })()}</span></div>
                <div className="text-sm text-gray-700 mb-1">Ngày kết thúc: <span className="font-medium">{(() => {
                  const endDate = item.insurance_end || item.return_date;
                  return endDate ? new Date(endDate).toLocaleDateString('vi-VN') : "-";
                })()}</span></div>
                <div className="text-sm text-gray-700 mb-1">Tổng phí bảo hiểm: <span className="font-bold text-red-600">{item.insurance_amount != null ? item.insurance_amount.toLocaleString() + " đ" : "-"}</span></div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button 
                  onClick={() => handlePayment(item)}
                  className="flex items-center gap-1 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-semibold"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#16a34a" strokeWidth="2" d="M4 12h16m-7-7 7 7-7 7"/></svg>
                  Thanh toán
                </button>
                <button 
                  onClick={() => handleDelete(item)}
                  className="flex items-center gap-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#e53e3e" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </>
  );
};

export default CartPage;
