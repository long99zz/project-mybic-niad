// src/pages/OrderSuccessPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getInvoiceDetail } from "../services/invoice";
import { getUserInfo } from "../services/user";
import { createPayment } from "../services/payment";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getBannerImageByProductName } from "../data/productDetails";

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Lấy master_invoice_id từ URL (Stripe redirect sử dụng master_invoice_id)
  const masterInvoiceId = searchParams.get("master_invoice_id");
  const amountParam = searchParams.get("amount"); // Lấy amount từ URL
  
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!masterInvoiceId) {
        setError("Không tìm thấy mã đơn hàng");
        setLoading(false);
        return;
      }

      try {
        // Ưu tiên lấy từ sessionStorage (dữ liệu mới nhất từ form)
        const tempOrderInfo = sessionStorage.getItem('temp_order_info');
        if (tempOrderInfo) {
          const orderFromSession = JSON.parse(tempOrderInfo);
          setOrderDetail(orderFromSession);
          
          // Vẫn lấy user info từ API
          const user = await getUserInfo();
          setUserInfo(user);
          
          // KHÔNG xóa temp data ngay - chỉ xóa khi người dùng rời đi
          // sessionStorage.removeItem('temp_order_info');
        } else {
          // Fallback: Lấy từ API nếu không có trong sessionStorage
          const [order, user] = await Promise.all([
            getInvoiceDetail(masterInvoiceId!), // Pass master_invoice_id as string (ObjectID hex)
            getUserInfo()
          ]);
          setOrderDetail(order);
          setUserInfo(user);
        }
      } catch (err) {
        console.error('[OrderSuccessPage] Error fetching order:', err);
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [masterInvoiceId, amountParam]);

  // Lưu vào giỏ hàng khi đóng trang (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (masterInvoiceId && orderDetail && orderDetail.insurance_amount) {
        // Không cần làm gì vì invoice đã được lưu vào database khi tạo
        // Cart API sẽ tự động lấy từ database
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [masterInvoiceId, orderDetail]);

  const handleAddToCart = () => {
    // Xóa sessionStorage trước khi rời trang
    sessionStorage.removeItem('temp_order_info');
    // Chuyển đến trang giỏ hàng
    navigate("/gio-hang");
  };

  const handlePayment = async () => {
    if (!orderDetail || !masterInvoiceId) {
      alert("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      // Hiển thị loading
      setLoading(true);

      // Ưu tiên lấy amount từ URL params, fallback về database
      const finalAmount = amountParam ? Number(amountParam) : (orderDetail.insurance_amount || orderDetail.total_amount || 0);

      // Tạo Stripe Checkout Session
      // CRITICAL: Must send master_invoice_id
      const invoiceIdToSend = orderDetail.master_invoice_id || masterInvoiceId;
      
      const paymentData = {
        invoice_id: invoiceIdToSend,
        amount: finalAmount,
        order_info: `Thanh toán đơn hàng #${invoiceIdToSend} - ${orderDetail.product_name}`,
      };
      
      const response = await createPayment(paymentData);

      // Redirect đến Stripe Checkout
      window.location.href = response.payment_url;
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Điệu không thể tạo thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-[#f6fafb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
      <Footer />
    </>
  );

  if (error || !orderDetail) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-[#f6fafb] pt-[100px]">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="bg-[#f6fafb] min-h-screen py-8 pt-[100px]">
        <div className="max-w-4xl mx-auto">
          {/* Success Banner */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-600 mb-1">Cảm ơn bạn đã đăng ký bảo hiểm với BIC</p>
            <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-semibold text-red-600">#{orderDetail.invoice_id}</span></p>
          </div>

          {/* Order Detail Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Thông tin đơn hàng</h2>
            
            <div className="flex flex-col md:flex-row md:items-center border rounded-lg p-4 gap-4 bg-[#f8fefc]">
              {/* Product Image */}
              <div className="flex-shrink-0 w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={getBannerImageByProductName(orderDetail.product_name)} alt={orderDetail.product_name || 'product'} className="object-cover w-full h-full" />
              </div>

              {/* Product Details */}
              <div className="flex-1">
                {/* Tên sản phẩm căn giữa */}
                <div className="text-center mb-3">
                  <span className="font-semibold text-lg text-[#1a3c40] block mb-1">
                    {orderDetail.product_name || "Sản phẩm bảo hiểm"}
                  </span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    {orderDetail.status || "Chưa thanh toán"}
                  </span>
                </div>
                
                {/* Các thông tin chi tiết căn trái */}
                <div className="space-y-1 text-left">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Người mua bảo hiểm:</span>{" "}
                    <span>
                      {orderDetail.customer?.full_name || 
                       ((userInfo?.last_name || userInfo?.LastName || "") + " " + 
                        (userInfo?.first_name || userInfo?.FirstName || "")).trim() || 
                       "-"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Ngày tạo:</span>{" "}
                    <span>{orderDetail.created_at ? new Date(orderDetail.created_at).toLocaleDateString('vi-VN') : "-"}</span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Ngày bắt đầu:</span>{" "}
                    <span>{orderDetail.insurance_start ? new Date(orderDetail.insurance_start).toLocaleDateString('vi-VN') : "-"}</span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Ngày kết thúc:</span>{" "}
                    <span>{orderDetail.insurance_end ? new Date(orderDetail.insurance_end).toLocaleDateString('vi-VN') : "-"}</span>
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Phí bảo hiểm:</span>{" "}
                    <span className="font-bold text-red-600">
                      {(() => {
                        // Ưu tiên lấy từ URL param, fallback về database
                        const displayAmount = amountParam 
                          ? Number(amountParam) 
                          : (orderDetail.insurance_amount || orderDetail.total_amount || 0);
                        return displayAmount != null 
                          ? displayAmount.toLocaleString('vi-VN') + " VND"
                          : "-";
                      })()}
                    </span>
                  </div>

                  {/* Danh sách người tham gia (nếu có) */}
                  {orderDetail.participants && orderDetail.participants.length > 0 && (
                    <div className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Người tham gia:</span>
                      <div className="mt-1 space-y-1 ml-4">
                        {orderDetail.participants.map((p: any, idx: number) => (
                          <div key={p.participant_id || idx} className="text-xs text-gray-600">
                            • {p.full_name} - {p.birth_date}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              {/* Nút thay đổi tùy theo trạng thái thanh toán */}
              {orderDetail.status === "Đã thanh toán" ? (
                <button
                  onClick={() => navigate("/gio-hang")}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Xem giỏ hàng
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm vào giỏ hàng
                </button>
              )}
              
              {/* Chỉ hiển thị nút Thanh toán nếu đơn hàng chưa được thanh toán */}
              {orderDetail.status !== "Đã thanh toán" && (
                <button
                  onClick={handlePayment}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Thanh toán ngay
                </button>
              )}
              
              {/* Hiển thị badge "Đã thanh toán" nếu đơn hàng đã thanh toán */}
              {orderDetail.status === "Đã thanh toán" && (
                <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Đã thanh toán
                </div>
              )}
              
              {/* Nút Quản lý đơn hàng - luôn hiển thị */}
              <button
                onClick={() => {
                  sessionStorage.removeItem('temp_order_info');
                  navigate("/tai-khoan?tab=orders");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors shadow-md"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quản lý đơn hàng
              </button>
            </div>

            {/* Additional Info - Căn trái */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600 text-left">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-700 mb-2">Lưu ý:</p>
                  <ul className="space-y-1.5 text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Đơn hàng sẽ được lưu trong giỏ hàng cho đến khi bạn thanh toán</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Bạn có thể xem lại đơn hàng trong mục "Quản lý đơn hàng" tại trang cá nhân</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Bảo hiểm chỉ có hiệu lực sau khi thanh toán thành công</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm">
              <button
                onClick={() => {
                  sessionStorage.removeItem('temp_order_info');
                  navigate("/tai-khoan?tab=orders");
                }}
                className="text-blue-600 font-semibold hover:text-blue-800 underline"
              >
                Xem tất cả đơn hàng
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  sessionStorage.removeItem('temp_order_info');
                  navigate("/");
                }}
                className="text-blue-600 font-semibold hover:text-blue-800 underline"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccessPage;
