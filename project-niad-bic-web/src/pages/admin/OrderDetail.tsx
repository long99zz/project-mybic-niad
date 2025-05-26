import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  order_id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  order_date: string;
  status: number;
  total: number;
  items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Gọi API lấy thông tin đơn hàng
    // Ví dụ:
    // fetch(`/api/admin/orders/${id}`)
    //     .then(res => res.json())
    //     .then(data => setOrder(data));

    // Tạm thời mock dữ liệu
    setOrder({
      order_id: Number(id),
      full_name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0123456789",
      address: "123 Đường ABC, Quận XYZ, TP.HCM",
      order_date: "2024-03-20 10:30:00",
      status: 1,
      total: 1500000,
      items: [
        {
          product_id: 1,
          name: "iPhone 13",
          price: 20000000,
          quantity: 1,
          total: 20000000,
        },
        {
          product_id: 2,
          name: "MacBook Pro",
          price: 30000000,
          quantity: 1,
          total: 30000000,
        },
      ],
    });
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderStatus = (status: number) => {
    switch (status) {
      case 1:
        return <span className="btn btn-small btn-danger">Chờ xác nhận</span>;
      case 2:
        return <span className="btn btn-small btn-warning">Đã xác nhận</span>;
      case 3:
        return <span className="btn btn-small btn-success">Đang giao</span>;
      case 4:
        return (
          <span className="btn btn-small btn-success">Giao thành công</span>
        );
      default:
        return <span className="btn btn-small btn-danger">Chờ xác nhận</span>;
    }
  };

  const handleStatusChange = async (newStatus: number) => {
    if (!order) return;

    try {
      // TODO: Gọi API cập nhật trạng thái đơn hàng
      // Ví dụ:
      // await fetch(`/api/admin/orders/${id}/status`, {
      //     method: 'PUT',
      //     headers: {
      //         'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ status: newStatus })
      // });

      // Tạm thời mock cập nhật trạng thái
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      alert("Cập nhật trạng thái đơn hàng thành công");
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Chi tiết đơn hàng #{order.order_id}</h6>
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
              <div className="card-body">
                <p>
                  <strong>Họ tên:</strong> {order.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {order.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {order.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {order.address}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Thông tin đơn hàng</h6>
              </div>
              <div className="card-body">
                <p>
                  <strong>Ngày đặt:</strong> {formatDate(order.order_date)}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {getOrderStatus(order.status)}
                </p>
                <p>
                  <strong>Tổng tiền:</strong> {order.total.toLocaleString()}₫
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Cập nhật trạng thái</h6>
              </div>
              <div className="card-body">
                <div className="btn-group">
                  <button
                    className={`btn ${
                      order.status === 1 ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => handleStatusChange(1)}
                  >
                    Chờ xác nhận
                  </button>
                  <button
                    className={`btn ${
                      order.status === 2 ? "btn-warning" : "btn-outline-warning"
                    }`}
                    onClick={() => handleStatusChange(2)}
                  >
                    Đã xác nhận
                  </button>
                  <button
                    className={`btn ${
                      order.status === 3 ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => handleStatusChange(3)}
                  >
                    Đang giao
                  </button>
                  <button
                    className={`btn ${
                      order.status === 4 ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => handleStatusChange(4)}
                  >
                    Giao thành công
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">Chi tiết sản phẩm</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table text-start align-middle table-bordered table-hover mb-0">
                <thead>
                  <tr className="text-dark">
                    <th scope="col">#</th>
                    <th scope="col">Sản phẩm</th>
                    <th scope="col">Giá</th>
                    <th scope="col">Số lượng</th>
                    <th scope="col">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.product_id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()}₫</td>
                      <td>{item.quantity}</td>
                      <td>{item.total.toLocaleString()}₫</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-end">
                      <strong>Tổng cộng:</strong>
                    </td>
                    <td>
                      <strong>{order.total.toLocaleString()}₫</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
