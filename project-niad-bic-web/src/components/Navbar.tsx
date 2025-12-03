"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Dữ liệu menu đa cấp với URL chính xác
const productMenuData = [
  {
    id: "car",
    title: "Bảo hiểm ô tô",
    href: "/danh-muc/bao-hiem-o-to-9.html",
    subMenu: [
      {
        id: "car-liability",
        title: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
        href: "/san-pham/bao-hiem-trach-nhiem-dan-su-chu-xe-o-to",
      },
      // Đã loại bỏ bảo hiểm vật chất ô tô
    ],
  },
  {
    id: "motorcycle",
    title: "Bảo hiểm xe máy",
    href: "/danh-muc/bao-hiem-xe-may-10.html",
    subMenu: [
      {
        id: "motorcycle-liability",
        title: "Bảo hiểm trách nhiệm dân sự chủ xe máy",
        href: "/san-pham/bao-hiem-tnds-xe-may",
      },
    ],
  },
  {
    id: "health",
    title: "Bảo hiểm sức khỏe",
    href: "/danh-muc/bao-hiem-suc-khoe-11.html",
    subMenu: [
      {
        id: "health-cancer",
        title: "Bảo hiểm bệnh ung thư",
        href: "/san-pham/bao-hiem-benh-ung-thu-phuc-tam-an",
      },
      {
        id: "health-accident",
        title: "Bảo hiểm tai nạn và sức khỏe cá nhân",
        href: "/san-pham/bao-hiem-suc-khoe-tam-an",
      },
    ],
  },
  {
    id: "travel",
    title: "Bảo hiểm du lịch",
    href: "/danh-muc/bao-hiem-du-lich-13.html",
    subMenu: [
      {
        id: "travel-international",
        title: "Bảo hiểm du lịch quốc tế (ITI)",
        href: "/san-pham/bao-hiem-du-lich-quoc-te",
      },
      {
        id: "travel-domestic",
        title: "Bảo hiểm du lịch trong nước (TRV)",
        href: "/san-pham/bao-hiem-du-lich-trong-nuoc",
      },
      {
        id: "travel-accident",
        title: "Bảo hiểm tai nạn khách du lịch (TVC)",
        href: "/san-pham/bao-hiem-tai-nan-khach-du-lich",
      },
    ],
  },
  {
    id: "accident",
    title: "Bảo hiểm tai nạn",
    href: "/danh-muc/bao-hiem-tai-nan-12.html",
    subMenu: [
      {
        id: "accident-24h",
        title: "Bảo hiểm tai nạn con người 24/24",
        href: "/san-pham/bao-hiem-tai-nan-24-24",
      },
      {
        id: "accident-nguoi-su-dung-dien",
        title: "Bảo hiểm tai nạn người sử dụng điện",
        href: "/san-pham/bao-hiem-tai-nan-nguoi-su-dung-dien",
      },
      {
        id: "accident-mo-rong",
        title: "Bảo hiểm tai nạn mở rộng",
        href: "/san-pham/bao-hiem-tai-nan-mo-rong",
      },
    ],
  },
  {
    id: "property",
    title: "Bảo hiểm nhà tư nhân",
    href: "/danh-muc/bao-hiem-nha-tu-nhan-14.html",
    subMenu: [
      {
        id: "property-comprehensive",
        title: "Bảo hiểm toàn diện nhà tư nhân",
        href: "/san-pham/bao-hiem-toan-dien-nha-tu-nhan",
      },
    ],
  },
  {
    id: "cyber",
    title: "Bảo hiểm an ninh mạng",
    href: "/danh-muc/bao-hiem-an-ninh-mang-15.html",
    subMenu: [
      {
        id: "cyber-security",
        title: "Bảo hiểm an ninh mạng",
        href: "/san-pham/bao-hiem-an-ninh-mang",
      },
    ],
  },
];

interface NavItemProps {
  children: React.ReactNode;
  href: string;
  isHome?: boolean;
  isProduct?: boolean;
  hasSubmenu?: boolean;
  isActive?: boolean;
}

function NavItem({
  children,
  href,
  isProduct = false,
  hasSubmenu = false,
  isActive = false,
}: NavItemProps) {
  return (
    <a
      href={href}
      className={`lg:px-1.5 xl:px-2 py-1.5 ${
        isProduct ? "lg:mx-2 xl:mx-3" : "lg:mx-1.5 xl:mx-2"
      } text-sm font-medium relative group ${
        isProduct
          ? "text-red-600 border border-red-600 rounded-md"
          : "text-gray-800"
      }`}
    >
      <div className="flex items-center">
        {children}
        {hasSubmenu && <ChevronDown className="ml-1 w-3 h-3" />}
      </div>

      {/* Hiển thị chỉ báo cho trang đang active */}
      {isActive && (
        <div className="absolute bottom-[-26px] left-0 w-full flex flex-col items-center">
          <ChevronDown className="w-4 h-4 text-red-600" />
          <div className="w-full h-1 bg-red-600"></div>
        </div>
      )}

      {/* Hiển thị chỉ báo khi hover cho các trang không active */}
      {!isActive && (
        <div className="absolute bottom-[-26px] left-0 w-full flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className="w-4 h-4 text-red-600" />
          <div className="w-full h-1 bg-red-600"></div>
        </div>
      )}
    </a>
  );
}

function ProductMenu({ isActive = false }) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (productMenuRef.current) {
      const rect = productMenuRef.current.getBoundingClientRect();
      setDropdownPosition({ left: rect.left });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (productMenuRef.current) {
        const rect = productMenuRef.current.getBoundingClientRect();
        setDropdownPosition({ left: rect.left });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const checkSubmenuPosition = () => {
      if (activeSubmenu && productMenuRef.current) {
        const submenuContainer = document.querySelector(
          `[data-submenu="${activeSubmenu}"]`
        ) as HTMLElement;
        if (submenuContainer) {
          const rect = submenuContainer.getBoundingClientRect();
          const windowWidth = window.innerWidth;

          if (rect.right > windowWidth) {
            submenuContainer.style.left = "auto";
            submenuContainer.style.right = "100%";
          } else {
            submenuContainer.style.left = "100%";
            submenuContainer.style.right = "auto";
          }
        }
      }
    };

    checkSubmenuPosition();
    window.addEventListener("resize", checkSubmenuPosition);
    return () => {
      window.removeEventListener("resize", checkSubmenuPosition);
    };
  }, [activeSubmenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productMenuRef.current &&
        !productMenuRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) {
      setActiveSubmenu(null);
    }
  }, [isDropdownOpen]);

  return (
    <div
      ref={productMenuRef}
      className="group relative"
      onMouseEnter={() => {
        if (window.innerWidth >= 1024) {
          setIsDropdownOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 1024) {
          setIsDropdownOpen(false);
        }
      }}
    >
      <Link
        to="/danh-muc/bao-hiem-o-to-9.html"
        className="lg:px-1.5 xl:px-2 py-1.5 lg:mx-2 xl:mx-3 text-sm font-medium relative text-red-600 border border-red-600 rounded-md"
      >
        SẢN PHẨM
      </Link>

      {isActive ? (
        <div className="absolute bottom-[-30px] left-0 w-full flex flex-col items-center">
          <ChevronDown className="w-4 h-4 text-red-600" />
          <div className="w-full h-1 bg-red-600"></div>
        </div>
      ) : (
        <div className="absolute bottom-[-30px] left-0 w-full flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className="w-4 h-4 text-red-600" />
          <div className="w-full h-1 bg-red-600"></div>
        </div>
      )}

      <div
        className={`fixed top-[82px] w-64 bg-white shadow-lg rounded-md ${
          isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
        } transition-all duration-300 z-50`}
        style={{ left: `${dropdownPosition.left}px` }}
      >
        <ul className="py-2">
          {productMenuData.map((item) => (
            <li
              key={item.id}
              className="relative"
              onMouseEnter={() => {
                if (window.innerWidth >= 1024) {
                  setActiveSubmenu(item.id);
                }
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 1024) {
                  setActiveSubmenu(null);
                }
              }}
            >
              {/* Gộp title và ChevronRight sang 2 đầu 1 dòng */}
              <div
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer text-[15px] font-medium text-gray-800 hover:text-red-600"
                onClick={() => {
                  setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
                }}
              >
                <Link
                  to={item.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                  }}
                  className="flex-1 text-left"
                >
                  {item.title}
                </Link>
                {item.subMenu?.length > 0 && (
                  <ChevronRight className="w-4 h-4 ml-2 text-gray-500" />
                )}
              </div>

              {activeSubmenu === item.id && (
                <div
                  className="absolute left-full top-0 w-[256px] bg-white shadow-lg rounded-md z-[60]"
                  data-submenu={item.id}
                >
                  <ul className="py-2">
                    {item.subMenu?.length > 0 ? (
                      item.subMenu.map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 hover:bg-gray-50 text-[15px] font-medium text-gray-800 hover:text-red-600 text-left whitespace-normal break-words"
                            title={subItem.title}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link
                          to={item.href}
                          className="block px-4 py-2 hover:bg-gray-50 text-[15px] font-medium text-gray-800 hover:text-red-600 whitespace-normal break-words"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Menu mobile
function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Xác định trang hiện tại dựa trên đường dẫn
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/") setActiveItem("home");
    else if (
      path.includes("/san-pham") ||
      path.includes("/danh-muc") ||
      path.includes("/bao-hiem-")
    )
      setActiveItem("products");
    else if (path.includes("/gioi-thieu")) setActiveItem("about");
    else if (path.includes("/tin-tuc")) setActiveItem("news");
    else if (path.includes("/khuyen-mai")) setActiveItem("promotions");
    else if (path.includes("/lien-he")) setActiveItem("contact");
  }, []);

  return (
    <div className="lg:hidden">
      {/* Nút menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Menu mobile */}
      <div
        className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header menu */}
        <div className="flex justify-between items-center p-3 border-b">
          <div className="w-36">
            <a href="/">
              <img src="/bic-logo.png" alt="BIC Logo" className="h-auto" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative" aria-label="Giỏ hàng">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-700"
              aria-label="Đóng menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content menu - sử dụng flex-1 để tự động điều chỉnh chiều cao */}
        <div className="p-3 pb-0 overflow-y-auto flex-1">
          <div className="text-gray-600 mb-3">ĐĂNG NHẬP</div>

          <a
            href="/dang-ky"
            className="inline-block border border-gray-300 rounded px-4 py-2 text-center mb-3"
          >
            ĐĂNG KÝ
          </a>

          <nav className="flex flex-col">
            <a
              href="/"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("home")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              TRANG CHỦ
              {activeItem === "home" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "home" && activeItem !== "home" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>

            <a
              href="/san-pham"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("products")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              SẢN PHẨM
              {activeItem === "products" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "products" && activeItem !== "products" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>

            <a
              href="/gioi-thieu"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("about")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              GIỚI THIỆU
              {activeItem === "about" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "about" && activeItem !== "about" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>

            <a
              href="/tin-tuc"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("news")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              TIN TỨC
              {activeItem === "news" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "news" && activeItem !== "news" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>

            <a
              href="/khuyen-mai"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("promotions")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              KHUYẾN MÃI
              {activeItem === "promotions" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "promotions" && activeItem !== "promotions" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>

            <a
              href="/lien-he"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("contact")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              LIÊN HỆ
              {activeItem === "contact" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
              {hoveredItem === "contact" && activeItem !== "contact" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
              )}
            </a>
            <a
              href="/dang-nhap"
              className="py-3 border-b border-gray-200 relative text-gray-700"
              onMouseEnter={() => setHoveredItem("login")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              ĐĂNG NHẬP
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState("");
  // ...existing code...
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Hàm kiểm tra đường dẫn active
  // ...existing code...

  // Xác định đường dẫn hiện tại khi component được tải
  useEffect(() => {
    setCurrentPath(window.location.pathname);

    // Theo dõi thay đổi đường dẫn
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    // Ghi đè phương thức pushState để bắt sự kiện khi URL thay đổi
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  // Xử lý hover cho dropdown user
  const handleUserDropdownMouseEnter = () => {
    setIsUserDropdownOpen(true);
  };

  const handleUserDropdownMouseLeave = () => {
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm">
      <div className="container mx-auto px-4 h-[82px] flex items-center justify-start">
        {/* Logo - thu về phía phải một chút */}
        <div className="w-24 md:w-32 lg:w-24 ml-0 lg:ml-6">
          <a href="/">
            <img
              src="/bic-logo.png"
              alt="BIC Logo"
              width={150}
              height={38}
              className="h-auto"
            />
          </a>
        </div>

        {/* Navigation - hiển thị trên desktop */}
        <nav className="hidden lg:flex items-center justify-start lg:space-x-0.5 xl:space-x-1 ml-24">
          <NavItem href="/" isHome={true} isActive={currentPath === "/"}>
            TRANG CHỦ
          </NavItem>
          <div className="h-5 w-px bg-gray-300"></div>
          <ProductMenu
            isActive={
              currentPath.includes("/san-pham") ||
              currentPath.includes("/danh-muc") ||
              currentPath.includes("/bao-hiem-")
            }
          />
          <div className="h-5 w-px bg-gray-300"></div>
          <NavItem
            href="/gioi-thieu"
            isActive={currentPath.includes("/gioi-thieu")}
          >
            GIỚI THIỆU
          </NavItem>
          <div className="h-5 w-px bg-gray-300"></div>
          <NavItem href="/tin-tuc" isActive={currentPath.includes("/tin-tuc")}>
            TIN TỨC
          </NavItem>
          <div className="h-5 w-px bg-gray-300"></div>
          <NavItem
            href="/khuyen-mai"
            isActive={currentPath.includes("/khuyen-mai")}
          >
            KHUYẾN MÃI
          </NavItem>
          <div className="h-5 w-px bg-gray-300"></div>
          <NavItem href="/lien-he" isActive={currentPath.includes("/lien-he")}>
            LIÊN HỆ
          </NavItem>
        </nav>

        {/* Auth & Cart - thu về phía trái một chút */}
        <div className="hidden lg:flex items-center lg:gap-2 xl:gap-3 lg:pr-6 xl:pr-10 mr-0 lg:-mr-6 ml-auto">
          <div className="flex items-center space-x-4">
            {/* Cart Icon - Đặt trước */}
            <Link to="/cart" className="text-gray-800 hover:text-red-600">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* User Auth Status / Dropdown - Đặt sau */}
            {isAuthenticated ? (
              <div
                className="relative group flex items-center cursor-pointer"
                onMouseEnter={handleUserDropdownMouseEnter}
                onMouseLeave={handleUserDropdownMouseLeave}
              >
                <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100">
                  {/* User Icon */}
                  <User className="w-5 h-5 text-red-600" />
                  {/* User Name - Display full name */}
                  <span className="text-gray-800 font-medium text-sm">
                    {`${user?.last_name || ""} ${user?.first_name || ""}`
                      .trim()
                      .toUpperCase()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isUserDropdownOpen && (
                  <div
                    className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg z-50 py-1"
                    onMouseEnter={handleUserDropdownMouseEnter}
                    onMouseLeave={handleUserDropdownMouseLeave}
                    style={{ paddingTop: "10px", paddingBottom: "10px" }} // Add padding to increase hover area
                  >
                    {/* User Profile Link */}
                    <Link
                      to="/tai-khoan"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Trang cá nhân
                    </Link>
                    {/* Personal Info Link */}
                    <Link
                      to="/tai-khoan?tab=info"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Cập nhật thông tin
                    </Link>
                    {/* Change Password Link */}
                    <Link
                      to="/tai-khoan?tab=password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Đổi mật khẩu
                    </Link>
                    {/* Order History Link */}
                    <Link
                      to="/tai-khoan?tab=orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Quản lý đơn hàng
                    </Link>

                    {/* Logout Link */}
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dang-ky"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  ĐĂNG KÝ
                </Link>
                <Link
                  to="/dang-nhap"
                  className="inline-block px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-100"
                >
                  ĐĂNG NHẬP
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile - hiển thị trên tablet và mobile */}
        <div className="flex lg:hidden items-center gap-4 ml-auto">
          <a href="/gio-hang.html" className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </a>
          <MobileMenu />
        </div>
      </div>

      {/* Vạch đỏ ở dưới cùng của header */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 opacity-0"></div>
    </header>
  );
}
