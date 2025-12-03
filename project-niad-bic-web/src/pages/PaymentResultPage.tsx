// src/pages/PaymentResultPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyPayment } from "../services/payment";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyPaymentResult = async () => {
      try {
        // Lấy query params từ URL
        const queryString = location.search.substring(1); // Bỏ dấu '?'
        
        // Gọi API verify
        const data = await verifyPayment(queryString);
        
        setResult(data);
      } catch (err: any) {
        setResult({
          success: false,
          message: err.response?.data?.message || "Không thể xác thực thanh toán"
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentResult();
  }, [location.search]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-[#f6fafb]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác thực thanh toán...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-[#f6fafb] min-h-screen py-8 pt-[100px]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {result?.success ? (
              // Thanh toán thành công
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                  Thanh toán thành công!
                </h1>                
                <p className="text-gray-600 mb-6">
                  {result.message || "Đơn hàng của bạn đã được thanh toán thành công"}
                </p>

                {/* Thông tin giao dịch */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-4">Thông tin giao dịch</h3>
                  
                  {result.invoice_id && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">#{result.invoice_id}</span>
                    </div>
                  )}
                  
                  {result.product_name && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Sản phẩm:</span>
                      <span className="font-medium">{result.product_name}</span>
                    </div>
                  )}
                  
                  {result.amount && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-medium text-red-600">
                        {result.amount.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  )}
                </div>

                {/* Các nút hành động */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      // Redirect tới OrderSuccessPage với master_invoice_id
                      const masterInvoiceId = new URLSearchParams(location.search).get('master_invoice_id');
                      if (masterInvoiceId) {
                        navigate(`/order-success?master_invoice_id=${masterInvoiceId}`);
                      }
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    Xem chi tiết đơn hàng
                  </button>
                  
                  <button
                    onClick={() => navigate("/tai-khoan?tab=orders")}
                    className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Xem tất cả đơn hàng
                  </button>
                  
                  <button
                    onClick={() => navigate("/")}
                    className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            ) : (
              // Thanh toán thất bại
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                  Thanh toán không thành công
                </h1>
                
                <p className="text-gray-600 mb-6">
                  {result?.message || "Đã xảy ra lỗi trong quá trình thanh toán"}
                </p>

                {/* Các nút hành động */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate("/gio-hang")}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    Thử lại
                  </button>
                  
                  <button
                    onClick={() => navigate("/")}
                    className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hỗ trợ */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Cần hỗ trợ? Liên hệ:{" "}
              <a href="tel:1900558818" className="text-red-600 font-semibold hover:underline">
                1900 55 88 18
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentResultPage;
