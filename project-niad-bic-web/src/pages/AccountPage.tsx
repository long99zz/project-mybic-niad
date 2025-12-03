import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  getUserInfo,
  updateUserInfo,
  changePassword,
  getUserOrders,
} from "../services/user";
import { getProducts } from "../services/product";
import { getInvoiceDetail } from "../services/invoice";
import { createPayment } from "../services/payment";

export default function AccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function để parse và format ngày tháng đồng nhất
  const parseAndFormatDate = (dateStr: any): string => {
    if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
      return "—";
    }
    // Cắt lấy phần ngày (yyyy-mm-dd) nếu có thời gian
    const dateOnly = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
    const date = new Date(dateOnly);
    if (isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString('vi-VN');
  };
  
  // Lấy tab từ query param nếu có
  const getTabFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tab && ["profile","info","password","orders"].includes(tab) ? tab : "profile";
  };
  const [activeTab, setActiveTab] = useState(getTabFromQuery());

  // Khi location.search thay đổi, cập nhật tab
  useEffect(() => {
    setActiveTab(getTabFromQuery());
  }, [location.search]);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [infoForm, setInfoForm] = useState({
    last_name: "",
    first_name: "",
    email: "",
    phone: "",
    house_number: "",
    sub_district: "",
    district: "",
    city: "",
    province: "",
    date_of_birth: "",
    gender: "",
    avatar: "",
  });
  const [infoMsg, setInfoMsg] = useState("");
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{open: boolean, data?: any}>({open: false});
  const [orderSearch, setOrderSearch] = useState("");
  const tabs = [
    { key: "profile", label: "Trang cá nhân" },
    { key: "info", label: "Cập nhật thông tin" },
    { key: "password", label: "Đổi mật khẩu" },
    { key: "orders", label: "Quản lý đơn hàng" },
  ];

  useEffect(() => {
    getUserInfo().then((data) => {
      setUser(data);
      setInfoForm({
        last_name: data.last_name || data.LastName || "",
        first_name: data.first_name || data.FirstName || "",
        email: data.email || data.Email || "",
        phone: data.phone || data.Phone || "",
        house_number: data.house_number || data.HouseNumber || "",
        sub_district: data.sub_district || data.SubDistrict || "",
        district: data.district || data.District || "",
        city: data.city || data.City || "",
        province: data.province || data.Province || "",
        date_of_birth: (data.date_of_birth || data.DateOfBirth || "").slice(0, 10),
        gender: data.gender || data.Gender || "",
        avatar: data.avatar || data.Avatar || "",
      });
    });
    getProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      setLoading(true);
      getUserOrders()
        .then((data) => {
          // Nếu data null, undefined, hoặc không phải mảng thì setOrders([])
          if (!Array.isArray(data)) {
            setOrders([]);
          } else {
            // Sắp xếp theo created_at giảm dần (mới nhất trước)
            const sorted = [...data].sort((a, b) => {
              const dateA = new Date(a.created_at || a.CreatedAt || 0).getTime();
              const dateB = new Date(b.created_at || b.CreatedAt || 0).getTime();
              return dateB - dateA;
            });
            setOrders(sorted);
          }
        })
        .catch((error) => {
          console.error("[AccountPage] Error fetching orders:", error);
          setOrders([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handlePayment = async (order: any) => {
    try {
      setLoading(true);

      // CRITICAL: Must send master_invoice_id, not child invoice_id
      const invoiceIdToSend = order.master_invoice_id || order.invoice_id || order.id;
      
      const paymentData = {
        invoice_id: invoiceIdToSend,
        amount: order.insurance_amount || 0,
        order_info: `Thanh toán đơn hàng #${invoiceIdToSend} - ${order.product_name}`,
      };
      
      const response = await createPayment(paymentData);

      // Redirect đến Stripe Checkout
      window.location.href = response.payment_url;
      
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (invoiceId: number | string, masterInvoiceId?: string | number) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "/dang-nhap";
        return;
      }

      // Use master_invoice_id if provided, otherwise use invoiceId as fallback
      const deleteId = masterInvoiceId || invoiceId;
      
      const response = await fetch(`/api/cart/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Xóa đơn hàng thất bại. Chỉ có thể xóa đơn hàng chưa thanh toán.");
        return;
      }

      const result = await response.json();

      // Xóa thành công - cập nhật UI
      setOrders((prevOrders) => prevOrders.filter((item) => (item.invoice_id || item.id) !== invoiceId));
      alert(result.message || "Đã xóa đơn hàng!");
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg("");
    try {
      await updateUserInfo({
        last_name: infoForm.last_name,
        first_name: infoForm.first_name,
        email: infoForm.email,
        phone: infoForm.phone,
        house_number: infoForm.house_number,
        sub_district: infoForm.sub_district,
        district: infoForm.district,
        city: infoForm.city,
        province: infoForm.province,
        date_of_birth: infoForm.date_of_birth,
        gender: infoForm.gender,
        avatar: infoForm.avatar,
      });
      setInfoMsg("Cập nhật thành công!");
      const data = await getUserInfo();
      setUser(data);
    } catch {
      setInfoMsg("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg("Mật khẩu mới không khớp.");
      return;
    }
    try {
      await changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwMsg("Đổi mật khẩu thành công!");
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch {
      setPwMsg("Đổi mật khẩu thất bại.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl pt-[81px] mx-auto mt-12 mb-12 flex flex-col md:flex-row gap-8 min-h-[700px]">
        {/* Sidebar */}
        <aside className="md:w-1/4 w-full bg-white rounded-xl shadow border p-0 md:p-0">
          <ul className="flex md:flex-col flex-row">
            {tabs.map((tab) => (
              <li key={tab.key} className="w-full">
                <button
                  className={`w-full text-left px-6 py-4 transition font-medium border-b md:border-b-0 md:border-l-4 md:rounded-l-xl
                    ${activeTab === tab.key
                      ? "bg-red-50 md:bg-red-100 text-red-600 border-red-600"
                      : "text-gray-700 border-transparent hover:bg-gray-50"
                    }`}
                  onClick={() => {
                    navigate(`/tai-khoan?tab=${tab.key}`);
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white rounded-xl shadow p-8 min-h-[600px]">
          {activeTab === "profile" && (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-6 text-center">Trang cá nhân</h2>
              <div className="w-full max-w-md bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center">
                <img
                  src={user?.avatar || user?.Avatar || "/placeholder.svg"}
                  alt="avatar"
                  className="w-24 h-24 rounded-full border mb-4 object-cover"
                />
                <div className="text-xl font-semibold mb-4 text-center w-full">
                  {`${user?.last_name || user?.LastName || ""} ${user?.first_name || user?.FirstName || ""}`.trim() || "Chưa cập nhật"}
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Email:</span>
                    <span className="flex-1 text-left">{user?.email || user?.Email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Số điện thoại:</span>
                    <span className="flex-1 text-left">{user?.phone || user?.Phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Địa chỉ:</span>
                    <span className="flex-1 text-left">{
                      [user?.house_number || user?.HouseNumber, user?.sub_district || user?.SubDistrict, user?.district || user?.District, user?.city || user?.City, user?.province || user?.Province]
                        .filter(Boolean)
                        .join(", ") || "Chưa cập nhật"
                    }</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Ngày sinh:</span>
                    <span className="flex-1 text-left">{
                      (() => {
                        const raw = user?.date_of_birth || user?.DateOfBirth;
                        if (!raw) return "Chưa cập nhật";
                        const d = new Date(raw);
                        if (isNaN(d.getTime())) return "Chưa cập nhật";
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const year = d.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()
                    }</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Giới tính:</span>
                    <span className="flex-1 text-left">{user?.gender || user?.Gender || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Vai trò:</span>
                    <span className="flex-1 text-left">{user?.role || user?.Role || "user"}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold min-w-[120px] text-left">Trạng thái:</span>
                    <span className="flex-1 text-left">{user?.status || user?.Status || "Hoạt động"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "info" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">Cập nhật thông tin</h2>
              <form className="space-y-5 max-w-lg mx-auto" onSubmit={handleInfoSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Họ</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.last_name}
                      onChange={e => setInfoForm(f => ({ ...f, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Tên</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.first_name}
                      onChange={e => setInfoForm(f => ({ ...f, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Email</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      type="email"
                      value={infoForm.email}
                      onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Số điện thoại</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.phone}
                      onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Số nhà</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.house_number}
                      onChange={e => setInfoForm(f => ({ ...f, house_number: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Phường/Xã</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.sub_district}
                      onChange={e => setInfoForm(f => ({ ...f, sub_district: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Quận/Huyện</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.district}
                      onChange={e => setInfoForm(f => ({ ...f, district: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Thành phố</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.city}
                      onChange={e => setInfoForm(f => ({ ...f, city: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Tỉnh/Thành phố</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.province}
                      onChange={e => setInfoForm(f => ({ ...f, province: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Ngày sinh</label>
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      type="date"
                      value={infoForm.date_of_birth}
                      onChange={e => setInfoForm(f => ({ ...f, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-semibold w-32 min-w-max text-left">Giới tính</label>
                    <select
                      className="border rounded px-3 py-2 flex-1"
                      value={infoForm.gender}
                      onChange={e => setInfoForm(f => ({ ...f, gender: e.target.value }))}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
                {/* Avatar upload nếu backend hỗ trợ */}
                {/* <div className="flex flex-col gap-2">
                  <label className="font-semibold">Ảnh đại diện</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div> */}
                <div className="flex justify-center">
                  <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-semibold">
                    Lưu thay đổi
                  </button>
                </div>
                {infoMsg && <div className="mt-2 text-green-600 text-center">{infoMsg}</div>}
              </form>
            </div>
          )}
          {activeTab === "password" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">Đổi mật khẩu</h2>
              <form className="space-y-5 max-w-lg mx-auto" onSubmit={handlePwSubmit}>
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold min-w-[180px] text-left block">Mật khẩu hiện tại</label>
                  <input
                    className="border rounded px-3 py-2 flex-1 block"
                    type="password"
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold min-w-[180px] text-left block">Mật khẩu mới</label>
                  <input
                    className="border rounded px-3 py-2 flex-1 block"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold min-w-[180px] text-left block">Nhập lại mật khẩu mới</label>
                  <input
                    className="border rounded px-3 py-2 flex-1 block"
                    type="password"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  />
                </div>
                <div className="flex justify-center">
                  <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-semibold">
                    Đổi mật khẩu
                  </button>
                </div>
                {pwMsg && <div className="mt-2 text-red-600 text-center">{pwMsg}</div>}
              </form>
            </div>
          )}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center">Quản lý đơn hàng</h2>
              <div className="mb-4 flex justify-end">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full max-w-xs"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>
              {loading ? (
                <p>Đang tải...</p>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border text-center min-w-80">Tên sản phẩm</th>
                        <th className="px-3 py-2 border">Ngày tạo</th>
                        <th className="px-3 py-2 border">Ngày bắt đầu</th>
                        <th className="px-3 py-2 border">Ngày hết hạn</th>
                        <th className="px-3 py-2 border">Trạng thái</th>
                        <th className="px-3 py-2 border">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const search = orderSearch.trim().toLowerCase();
                        const filtered = orders.filter((order: any) => {
                          if (!search) return true;
                          const fields = [
                            order.product_name || order.product_id || "",
                            order.created_at || order.CreatedAt || "",
                            order.insurance_start || order.InsuranceStart || "",
                            order.insurance_end || order.InsuranceEnd || "",
                            order.status || ""
                          ];
                          return fields.join(" ").toLowerCase().includes(search);
                        });
                        if (filtered.length === 0) {
                          return [
                            <tr key="no-orders">
                              <td colSpan={6} className="text-center py-4">Không có đơn hàng nào.</td>
                            </tr>
                          ];
                        }
                        return filtered.map((order: any, idx: number) => (
                          <tr key={(order.invoice_id || order.id || "") + "-" + idx} className="border-b">
                            <td className="px-3 py-2 border text-center">{order.product_name || order.product_id || "Không xác định"}</td>
                            <td className="px-3 py-2 border text-center">{parseAndFormatDate(order.created_at || order.CreatedAt)}</td>
                            <td className="px-3 py-2 border text-center">{parseAndFormatDate(order.insurance_start || order.InsuranceStart || order.departure_date || order.DepartureDate)}</td>
                            <td className="px-3 py-2 border text-center">{parseAndFormatDate(order.insurance_end || order.InsuranceEnd || order.return_date || order.ReturnDate)}</td>
                            <td className="px-3 py-2 border text-center">
                              {order.status === "Chưa thanh toán" ? (
                                <button
                                  onClick={() => handlePayment(order)}
                                  className="w-32 px-3 py-1 bg-red-500 text-white rounded font-medium hover:bg-red-600 cursor-pointer"
                                >
                                  Chưa thanh toán
                                </button>
                              ) : (
                                <span className="w-32 px-3 py-1 bg-green-500 text-white rounded font-medium inline-block text-center">
                                  Đã thanh toán
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 border text-center">
                              {order.invoice_id || order.id ? (
                                <div className="flex flex-row gap-2 items-center justify-between w-full">
                                  {/* Nút Chi tiết - bên trái */}
                                  <button
                                    className="w-20 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                    onClick={async () => {
                                      const masterInvoiceId = order.master_invoice_id || order.invoice_id || order.id;
                                      if (!masterInvoiceId) return;
                                      setDetailModal({open: true, data: undefined});
                                      try {
                                        const data = await getInvoiceDetail(masterInvoiceId);
                                        setDetailModal({open: true, data});
                                      } catch {
                                        setDetailModal({open: true, data: {error: "Không lấy được chi tiết đơn hàng!"}});
                                      }
                                    }}
                                  >
                                    Chi tiết
                                  </button>
                                  
                                  {/* Nút Xóa - bên phải nếu chưa thanh toán */}
                                  {order.status === "Chưa thanh toán" ? (
                                    <button
                                      onClick={() => handleDeleteOrder(order.invoice_id || order.id, order.master_invoice_id)}
                                      className="w-16 text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                                    >
                                      Xóa
                                    </button>
                                  ) : (
                                    <span className="w-16"></span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">Không có</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                  {/* Modal chi tiết đơn hàng nằm ngoài table */}
                </div>
              )}
              {detailModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={() => setDetailModal({open: false})}>&times;</button>
                    <h3 className="text-xl font-bold mb-4 text-center">Chi tiết đơn hàng</h3>
                    {detailModal.data ? (
                      detailModal.data.error ? (
                        <div className="text-red-600 text-left">{detailModal.data.error}</div>
                      ) : (
                        <div className="space-y-2 text-left">
                          <div><b>Mã đơn hàng:</b> {detailModal.data.invoice_id}</div>
                          <div><b>Tên sản phẩm:</b> {detailModal.data.product_name}</div>
                          <div><b>Trạng thái:</b> {detailModal.data.status}</div>
                          <div><b>Ngày tạo:</b> {parseAndFormatDate(detailModal.data.created_at)}</div>
                          <div><b>Ngày bắt đầu:</b> {parseAndFormatDate(detailModal.data.insurance_start || detailModal.data.departure_date)}</div>
                          <div><b>Ngày hết hạn:</b> {parseAndFormatDate(detailModal.data.insurance_end || detailModal.data.return_date)}</div>
                          {/* Ẩn dòng khách hàng */}
                          <div>
                            <b>Danh sách người tham gia:</b>
                            {detailModal.data.participants && detailModal.data.participants.length > 0 ? (
                              <div className="space-y-2 mt-2">
                                {detailModal.data.participants.map((p: any, idx: number) => (
                                  <div key={p.participant_id || p._id || idx} className="border rounded p-2 bg-gray-50">
                                    <div><b>Họ tên:</b> {p.full_name || p.FullName || p.fullName}</div>
                                    <div><b>Ngày sinh:</b> {parseAndFormatDate(p.birth_date || p.BirthDate || p.birthDate)}</div>
                                    <div><b>Giới tính:</b> {p.gender || p.Gender}</div>
                                    <div><b>Số CCCD:</b> {p.identity_number || p.IdentityNumber || p.identityNumber}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="ml-6 italic text-gray-500">Không có người tham gia</div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-left">Đang tải...</div>
                    )}
                  </div>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
    <Footer />
  </>
  );
}
