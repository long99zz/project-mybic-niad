import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Customer {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}
interface Participant {
  [key: string]: any;
}
interface InvoiceDetail {
  invoice_id: number;
  invoice_type: string;
  product_name: string;
  customer: Customer;
  participants: Participant[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState("");

  // Lấy type từ query string (?type=chung)
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type") || "chung";

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_URL}/api/admin/invoice-detail?type=${type}&id=${id}`, { withCredentials: true })
      .then((res) => {
        setOrder(res.data);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu hóa đơn.");
      });
  }, [id, type]);

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Chi tiết hóa đơn #{order.invoice_id}</h6>
          <button
            className="btn btn-custom"
            onClick={() => navigate("/admin/orders")}
          >
            <i className="fa fa-arrow-left"></i> Quay lại
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Thông tin khách hàng</h6>
              </div>
              <div className="card-body text-start">
                <p>
                  <strong>ID khách hàng:</strong> {order.customer?.customer_id ?? "-"}
                </p>
                <p>
                  <strong>Loại khách:</strong> {order.customer?.customer_type || "-"}
                </p>
                <p>
                  <strong>Họ tên:</strong> {order.customer?.full_name || "-"}
                </p>
                <p>
                  <strong>Số CMND/CCCD:</strong> {order.customer?.identity_number || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer?.email || "-"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {order.customer?.phone_number || "-"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {order.customer?.address || "-"}
                </p>
                <p>
                  <strong>Yêu cầu xuất hóa đơn:</strong> {order.customer?.invoice_request ? "Có" : "Không"}
                </p>
                <p>
                  <strong>Ghi chú:</strong> {order.customer?.notes || "-"}
                </p>
                <p>
                  <strong>Ngày tạo:</strong> {order.customer?.created_at ? new Date(order.customer.created_at).toLocaleString() : "-"}
                </p>
                <p>
                  <strong>Ngày cập nhật:</strong> {order.customer?.updated_at ? new Date(order.customer.updated_at).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Thông tin hóa đơn</h6>
              </div>
              <div className="card-body text-start">
                <p>
                  <strong>Loại hóa đơn:</strong> {order.invoice_type}
                </p>
                <p>
                  <strong>Sản phẩm:</strong> {order.product_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">Danh sách người tham gia</h6>
          </div>
          <div className="card-body">
            {order.participants && order.participants.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead>
                    <tr>
                      {Object.keys(order.participants[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.participants.map((p, idx) => (
                      <tr key={idx}>
                        {Object.values(p).map((val, i) => (
                          <td key={i}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>Không có người tham gia</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;