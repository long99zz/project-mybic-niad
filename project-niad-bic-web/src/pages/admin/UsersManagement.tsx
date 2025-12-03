import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, AdminUser } from '@/services/admin';
import { Trash2, Edit, Eye, Search } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${email}"?`)) return;

    try {
      await deleteUser(id);
      alert('Xóa người dùng thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Không thể xóa người dùng');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <button
          onClick={loadUsers}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Tìm theo email, tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Tổng người dùng</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Admin</div>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'admin').length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">User</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'user').length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">Kết quả lọc</div>
          <div className="text-2xl font-bold text-green-600">{filteredUsers.length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Người dùng
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Vai trò
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Thống kê
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  #{user.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.last_name} {user.first_name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {user.phone || 'Chưa có'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.order_count} đơn</div>
                  <div className="text-sm text-gray-500">{formatCurrency(user.total_spent)}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => alert('Chi tiết user: ' + user.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => alert('Chỉnh sửa user: ' + user.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500">Không tìm thấy người dùng nào</div>
        )}
      </div>
    </div>
  );
}
