import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Tạm thời bỏ Link

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  status: number;
  created_at: string;
  phone: string;
}

const mockUsers = [
  {
    user_id: 1,
    username: "manhmtk",
    email: "vietkey9832@gmail.com",
    full_name: "ManhMTK",
    role: "Khách hàng",
    status: 1,
    created_at: "2024-03-20",
    phone: "0988352858",
  },
  {
    user_id: 2,
    username: "Hoang ngoc thien",
    email: "hoangngocthien5105@gmail.com",
    full_name: "Hoang Ngoc Thien",
    role: "Khách hàng",
    status: 1,
    created_at: "2024-03-20",
    phone: "0888590205",
  },
];

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Gọi API lấy danh sách người dùng
    // Tạm thời mock dữ liệu
    setUsers(mockUsers);
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      // TODO: Gọi API xóa người dùng
      console.log("Deleting user with ID:", id); // Log thay vì fetch API
      // Tạm thời mock xóa người dùng
      setUsers((prev) => prev.filter((user) => user.user_id !== id));
      alert("Xóa người dùng thành công");
    }
  };

  const handleStatusChange = async (id: number, newStatus: number) => {
    // TODO: Gọi API cập nhật trạng thái người dùng
    console.log("Changing status for user ID:", id, " to:", newStatus); // Log thay vì fetch API
    // Tạm thời mock cập nhật trạng thái
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === id ? { ...user, status: newStatus } : user
      )
    );
    alert("Cập nhật trạng thái thành công");
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
      <div className="mb-4">
        {/* <Link to="/admin/users/add" className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Thêm người dùng</Link> */}
        {/* Nút Thêm người dùng - dùng button hoặc Link tùy cấu trúc route thêm */}
        <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">
          Thêm người dùng
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
              <tr key={user.user_id} className="border-b">
                <td className="p-2 text-center">{user.user_id}</td>
                <td className="p-2 text-center">
                  <img
                    src={
                      "https://ui-avatars.com/api/?name=" +
                      user.full_name.replace(/s+/g, "+")
                    }
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover inline-block"
                  />
                </td>
                <td className="p-2 text-center">{user.full_name}</td>
                <td className="p-2 text-center">{user.email}</td>
                <td className="p-2 text-center">{user.phone}</td>
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
                  <button
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === 1
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                    onClick={() =>
                      handleStatusChange(
                        user.user_id,
                        user.status === 1 ? 0 : 1
                      )
                    }
                  >
                    {user.status === 1 ? "Hoạt động" : "Khóa"}
                  </button>
                </td>
                <td className="p-2 text-center">{user.created_at}</td>
                <td className="p-2 space-x-2 text-center">
                  {/* <Link to={`/admin/users/edit/${user.user_id}`} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Sửa</Link> */}
                  <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => handleDelete(user.user_id)}
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

export default Users;
