import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        setError("Không có ID đơn hàng");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const apiUrl = `/api/admin/orders/${id}`;
        
        const response = await axios.get(apiUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        setOrderData(response.data);
        setError("");
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const parseAndFormatDate = (dateStr: any) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "0";
    
    let numAmount = 0;
    
    // Handle different types
    if (typeof amount === "string") {
      // Handle scientific notation like "2.43e+06"
      numAmount = parseFloat(amount);
    } else if (typeof amount === "number") {
      numAmount = amount;
    } else {
      return "0";
    }
    
    if (isNaN(numAmount)) return "0";
    
    return Math.round(numAmount).toLocaleString("vi-VN");
  };

  // Lấy thông tin khách hàng từ API response (lấy từ user_id)
  const getCustomerInfo = () => {
    const customerName = orderData?.customer_name || "N/A";
    const customerEmail = orderData?.customer_email || "N/A";
    const customerPhone = orderData?.customer_phone || "N/A";
    const customerAddress = orderData?.customer_address || "N/A";

    return {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress
    };
  };

  // Lấy danh sách người tham gia
  const getParticipants = () => {
    // API trả về participants riêng
    if (orderData?.participants && Array.isArray(orderData.participants) && orderData.participants.length > 0) {
      return orderData.participants;
    }
    
    // Hoặc kiểm trong invoice
    const invoice = orderData?.child_invoice || {};
    if (invoice.participants && Array.isArray(invoice.participants) && invoice.participants.length > 0) {
      return invoice.participants;
    }
    
    if (invoice.travel_participants && Array.isArray(invoice.travel_participants)) {
      return invoice.travel_participants;
    }
    
    return [];
  };

  const getParticipantLabel = (participant: any) => {
    return participant.full_name || 
           participant.FullName || 
           participant.fullName || 
           "Người tham gia";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white text-center rounded p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="p-6">
        <div className="bg-white text-center rounded p-8">
          <div className="text-red-600 mb-4 text-lg">
            {error || "Không tìm thấy đơn hàng"}
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate("/admin/orders")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const customerInfo = getCustomerInfo();
  const participants = getParticipants();
  const invoice = orderData?.child_invoice || {};

  return (
    <div className="p-6">
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => navigate("/admin/orders")}
          >
            ← Quay lại
          </button>
        </div>

        {/* Thông tin đơn hàng & khách hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Thông tin cơ bản */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-left">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm text-left">
              <p><strong>Mã đơn hàng:</strong> <span className="font-mono">{orderData.master_invoice_id || "N/A"}</span></p>
              <p><strong>Loại bảo hiểm:</strong> {orderData.category_name || orderData.invoice_type || "N/A"}</p>
              <p><strong>Tên sản phẩm:</strong> {orderData.product_name || invoice.insurance_package || "N/A"}</p>
              <p><strong>Trạng thái:</strong> 
                <span className={`ml-2 px-3 py-1 rounded text-xs font-semibold inline-block ${
                  invoice.status === "Đã thanh toán" 
                    ? "bg-green-200 text-green-800" 
                    : "bg-red-200 text-red-800"
                }`}>
                  {invoice.status || "N/A"}
                </span>
              </p>
              <p><strong>Ngày tạo:</strong> {parseAndFormatDate(invoice.created_at || orderData.master_invoice?.created_at)}</p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-left">Thông tin khách hàng</h3>
            <div className="space-y-2 text-sm text-left">
              <p><strong>Họ tên:</strong> {customerInfo.name}</p>
              <p><strong>Email:</strong> {customerInfo.email}</p>
              <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
              <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
            </div>
          </div>
        </div>

        {/* Thông tin bảo hiểm */}
        <div className="border rounded p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-left">Thông tin bảo hiểm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
            <p><strong>Ngày bắt đầu:</strong> {parseAndFormatDate(invoice.insurance_start || invoice.departure_date || invoice.InsuranceStart)}</p>
            <p><strong>Ngày kết thúc:</strong> {parseAndFormatDate(invoice.insurance_end || invoice.return_date || invoice.InsuranceEnd)}</p>
            <p><strong>Phí bảo hiểm:</strong> <span className="font-semibold text-blue-600">{formatCurrency(invoice.insurance_amount || invoice.total_amount || invoice.InsuranceAmount)} VNĐ</span></p>
            {(invoice.insurance_package || invoice.InsurancePackage) && (
              <p><strong>Gói bảo hiểm:</strong> {invoice.insurance_package || invoice.InsurancePackage}</p>
            )}
          </div>
        </div>

        {/* Danh sách người tham gia */}
        {participants && participants.length > 0 && (
          <div className="border rounded p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-left">Danh sách người tham gia ({participants.length})</h3>
            <div className="space-y-3 text-left">
              {participants.map((p: any, idx: number) => (
                <div key={p._id || p.participant_id || idx} className="border rounded p-3 bg-gray-50 hover:bg-gray-100 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><strong>Họ tên:</strong> {getParticipantLabel(p)}</p>
                    <p><strong>Ngày sinh:</strong> {parseAndFormatDate(p.birth_date || p.BirthDate || p.birthDate)}</p>
                    <p><strong>Giới tính:</strong> {p.gender || p.Gender || "N/A"}</p>
                    <p><strong>Số CCCD/CMND:</strong> {p.identity_number || p.IdentityNumber || p.identityNumber || "N/A"}</p>
                    {(p.relationship || p.Relationship) && (
                      <p><strong>Mối quan hệ:</strong> {p.relationship || p.Relationship}</p>
                    )}
                    {(p.job || p.Job) && (
                      <p><strong>Công việc:</strong> {p.job || p.Job}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
