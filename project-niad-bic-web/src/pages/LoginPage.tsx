"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông báo từ state khi chuyển hướng từ trang đăng ký
  useEffect(() => {
    const state = location.state as { message?: string };
    if (state?.message) {
      setSuccessMessage(state.message);
      // Xóa state để tránh hiển thị lại thông báo khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      // Lấy lại user từ sessionStorage
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (user.role === "Admin") navigate("/admin");
      else navigate("/");
    } else {
      setError("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-16">
        <div className="flex-1 flex flex-col">
          <div className="container mx-auto py-8 flex-1 flex flex-col">
            <div className="max-w-md mx-auto w-full">
              <h1 className="text-4xl font-bold text-center text-red-600 mb-8 relative">
                Đăng nhập
                <span className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800"></span>
              </h1>

              {successMessage && (
                <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-gray-700 w-24"
                  >
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="password"
                    className="block text-base font-medium text-gray-700 w-24"
                  >
                    Mật khẩu <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-base"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-base">
                <Link
                  to="/quen-mat-khau"
                  className="text-gray-600 hover:text-red-600"
                >
                  Quên mật khẩu?
                </Link>
                <span className="mx-2">|</span>
                <span className="text-gray-600">
                  Bạn chưa có tài khoản?
                  <Link
                    to="/dang-ky"
                    className="ml-1 text-gray-600 hover:text-red-600"
                  >
                    Đăng ký ngay
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <CustomerSupport />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default LoginPage;
