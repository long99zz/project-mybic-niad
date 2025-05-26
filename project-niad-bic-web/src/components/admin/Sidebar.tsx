import { NavLink } from "react-router-dom";
import {
  BarChart2,
  ShoppingCart,
  Package,
  BookText,
  Users,
  MessageCircle,
  PieChart,
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

const Sidebar = () => (
  <aside className="w-64 bg-white shadow h-screen flex flex-col">
    <div className="p-6 font-bold text-xl text-blue-600">ADMIN</div>
    <nav className="flex-1">
      {menu.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/admin"}
          className={({ isActive }) =>
            `flex items-center w-full px-6 py-3 text-left hover:bg-blue-50 transition ${
              isActive
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700"
            }`
          }
        >
          <span className="mr-3">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
