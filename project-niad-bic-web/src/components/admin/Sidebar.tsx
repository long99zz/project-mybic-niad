import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart2,
  ShoppingCart,
  Package,
  BookText,
  Users,
  MessageCircle,
  PieChart,
  LogOut,
} from "lucide-react";

const menu = [
  { to: "/admin", label: "Dashboard", icon: <BarChart2 /> },
  { to: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCart /> },
  { to: "/admin/products", label: "Sản phẩm", icon: <Package /> },
  { to: "/admin/posts", label: "Bài viết", icon: <BookText /> },
  { to: "/admin/users", label: "Tài khoản", icon: <Users /> },
  { to: "/admin/comments", label: "Bình luận", icon: <MessageCircle /> },
  { to: "/admin/statistics", label: "Thống kê", icon: <PieChart /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Gọi hàm logout từ AuthContext
    logout();
    
    // Chuyển về trang chủ
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 w-56 h-screen bg-white shadow z-50 flex flex-col">
      <div className="p-4 font-bold text-lg text-blue-600 text-center border-b">ADMIN</div>
      <nav className="flex-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center w-full px-4 py-2.5 text-left hover:bg-blue-50 transition text-sm ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700"
              }`
            }
          >
            <span className="mr-2.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      {/* Nút đăng xuất */}
      <div className="border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 hover:text-red-700 transition text-sm font-medium"
        >
          <LogOut className="mr-2.5" size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
