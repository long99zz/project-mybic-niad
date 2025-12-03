import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, AdminUser } from "@/services/admin";

const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${email}"?`)) {
      try {
        await deleteUser(id);
        alert("Xóa người dùng thành công");
        loadUsers(); // Reload danh sách
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Không thể xóa người dùng");
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: number) => {
    // TODO: Implement API update user status nếu backend có
    alert("Chức năng này đang được phát triển");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.phone.includes(searchKeyword)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý người dùng</h2>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tìm kiếm người dùng..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-center">Ảnh</th>
              <th className="p-2 text-center">Họ tên</th>
              <th className="p-2 text-center">Email</th>
              <th className="p-2 text-center">Số điện thoại</th>
              <th className="p-2 text-center">Vai trò</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 text-center">Ngày tạo</th>
              <th className="p-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2 text-center">{user.id}</td>
                <td className="p-2 text-center">
                  <img
                    src={
                      "https://ui-avatars.com/api/?name=" +
                      (user.last_name + " " + user.first_name).replace(/\s+/g, "+")
                    }
                    alt={user.last_name + " " + user.first_name}
                    className="w-10 h-10 rounded-full object-cover inline-block"
                  />
                </td>
                <td className="p-2 text-center">
                  {user.last_name} {user.first_name}
                </td>
                <td className="p-2 text-center">{user.email}</td>
                <td className="p-2 text-center">{user.phone || "Chưa có"}</td>
                <td className="p-2 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                    Hoạt động
                  </span>
                </td>
                <td className="p-2 text-center">{formatDate(user.created_at)}</td>
                <td className="p-2 space-x-2 text-center">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => handleDelete(user.id, user.email)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Không tìm thấy người dùng nào
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
