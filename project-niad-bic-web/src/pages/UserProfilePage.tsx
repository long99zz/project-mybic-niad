import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Lock, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const UserProfilePage = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      path: "/tai-khoan",
      icon: <User className="w-5 h-5" />,
      label: "Trang cá nhân",
    },
    {
      path: "/tai-khoan/thong-tin-ca-nhan",
      icon: <User className="w-5 h-5" />,
      label: "Thông tin cá nhân",
    },
    {
      path: "/tai-khoan/doi-mat-khau",
      icon: <Lock className="w-5 h-5" />,
      label: "Thay đổi mật khẩu",
    },
    {
      path: "/tai-khoan/don-hang",
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Quản lý đơn hàng",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-[82px]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Thông tin người dùng */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {`${user?.last_name || ""} ${
                        user?.first_name || ""
                      }`.trim()}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    // Xử lý đăng xuất
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
