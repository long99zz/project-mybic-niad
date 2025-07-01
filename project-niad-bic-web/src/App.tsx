import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";
import PromotionsPage from "./pages/PromotionsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderPage from "./pages/OrderPage";
import CartPage from "./pages/CartPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Posts from "./pages/admin/Posts";
import AddPost from "./pages/admin/AddPost";
import EditPost from "./pages/admin/EditPost";
import Users from "./pages/admin/Users";
import Comments from "./pages/admin/Comments";
import Statistics from "./pages/admin/Statistics";
import UserProfilePage from "./pages/UserProfilePage";
import CategoryPage from "./pages/CategoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import NotFoundPage from "./pages/NotFoundPage";
import PersonalInfoPage from "./pages/user/PersonalInfoPage";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import OrderHistoryPage from "./pages/user/OrderHistoryPage";
import OrderDetail from "./pages/admin/OrderDetail";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  console.log("ProtectedRoute state:", { isAuthenticated, isAdmin }); // Debug log

  if (!isAuthenticated) {
    console.log("Redirecting to login page"); // Debug log
    return <Navigate to="/dang-nhap" />;
  }

  if (!isAdmin) {
    console.log("Redirecting to home page"); // Debug log
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gioi-thieu" element={<AboutPage />} />
      <Route path="/lien-he" element={<ContactPage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage />} />
      <Route path="/tin-tuc" element={<NewsPage />} />
      <Route path="/tin-tuc/:id" element={<NewsDetail />} />
      <Route path="/khuyen-mai" element={<PromotionsPage />} />
      <Route path="/san-pham" element={<ProductsPage />} />
      <Route path="/san-pham/:category" element={<ProductsPage />} />
      <Route path="/danh-muc/:category" element={<ProductsPage />} />
      <Route path="/danh-muc/:category.html" element={<ProductsPage />} />
      <Route path="/nhap-thong-tin.html" element={<OrderPage />} />
      <Route path="/mua-bao-hiem/:productId" element={<OrderPage />} />
      <Route path="/mua-ngay/:productType" element={<OrderPage />} />
      <Route path="/dat-hang" element={<OrderPage />} />
      <Route path="/gio-hang.html" element={<CartPage />} />
      {/* Các route cụ thể cho từng sản phẩm */}
      <Route
        path="/bao-hiem-trach-nhiem-dan-su-chu-xe-o-to-9.html"
        element={
          <ProductDetailPage productSlug="bao-hiem-trach-nhiem-dan-su-chu-xe-o-to" />
        }
      />
      <Route
        path="/bao-hiem-vat-chat-o-to-10.html"
        element={<ProductDetailPage productSlug="bao-hiem-vat-chat-o-to" />}
      />
      <Route
        path="/bao-hiem-tnds-xe-may-11.html"
        element={<ProductDetailPage productSlug="bao-hiem-tnds-xe-may" />}
      />
      <Route
        path="/bao-hiem-suc-khoe-ca-nhan-12.html"
        element={<ProductDetailPage productSlug="bao-hiem-suc-khoe-ca-nhan" />}
      />
      <Route
        path="/bao-hiem-du-lich-quoc-te-13.html"
        element={<ProductDetailPage productSlug="bao-hiem-du-lich-quoc-te" />}
      />
      <Route
        path="/bao-hiem-tai-nan-24h-14.html"
        element={<ProductDetailPage productSlug="bao-hiem-tai-nan-24h" />}
      />
      {/* Thêm các routes mới cho đường dẫn sản phẩm mới */}
      <Route
        path="/san-pham/bao-hiem-trach-nhiem-dan-su-chu-xe-o-to"
        element={
          <ProductDetailPage productSlug="bao-hiem-trach-nhiem-dan-su-chu-xe-o-to" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-vat-chat-o-to"
        element={<ProductDetailPage productSlug="bao-hiem-vat-chat-o-to" />}
      />
      <Route
        path="/san-pham/bao-hiem-tnds-xe-may"
        element={<ProductDetailPage productSlug="bao-hiem-tnds-xe-may" />}
      />
      <Route
        path="/san-pham/bao-hiem-suc-khoe-tam-an"
        element={<ProductDetailPage productSlug="bao-hiem-suc-khoe-tam-an" />}
      />
      <Route
        path="/san-pham/bao-hiem-benh-ung-thu-phuc-tam-an"
        element={
          <ProductDetailPage productSlug="bao-hiem-benh-ung-thu-phuc-tam-an" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-du-lich-quoc-te"
        element={<ProductDetailPage productSlug="bao-hiem-du-lich-quoc-te" />}
      />
      <Route
        path="/san-pham/bao-hiem-du-lich-trong-nuoc"
        element={
          <ProductDetailPage productSlug="bao-hiem-du-lich-trong-nuoc" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-tai-nan-khach-du-lich"
        element={
          <ProductDetailPage productSlug="bao-hiem-tai-nan-khach-du-lich" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-tai-nan-24-24"
        element={<ProductDetailPage productSlug="bao-hiem-tai-nan-24-24" />}
      />
      <Route
        path="/san-pham/bao-hiem-toan-dien-nha-tu-nhan"
        element={
          <ProductDetailPage productSlug="bao-hiem-toan-dien-nha-tu-nhan" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-an-ninh-mang"
        element={<ProductDetailPage productSlug="bao-hiem-an-ninh-mang" />}
      />
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/add" element={<AddPost />} />
        <Route path="posts/edit/:id" element={<EditPost />} />
        <Route path="users" element={<Users />} />
        <Route path="comments" element={<Comments />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
      {/* User Profile Routes */}
      <Route path="/tai-khoan" element={<UserProfilePage />}>
        {/* Default content or redirect */}
        <Route index element={<div>Chọn một mục từ menu bên trái.</div>} />{" "}
        {/* Personal Info Route */}
        <Route path="thong-tin-ca-nhan" element={<PersonalInfoPage />} />{" "}
        {/* Change Password Route */}
        <Route path="doi-mat-khau" element={<ChangePasswordPage />} />{" "}
        {/* Order History Route */}
        <Route path="don-hang" element={<OrderHistoryPage />} />{" "}
        {/* Placeholder */}
      </Route>
      {/* New routes */}
      <Route path="/danh-muc/:categorySlug" element={<CategoryPage />} />
      <Route path="/san-pham/:productSlug" element={<ProductDetailPage />} />
      <Route path="/gio-hang" element={<CartPage />} />
      <Route path="/thanh-toan" element={<CheckoutPage />} />
      <Route
        path="/xac-nhan-thanh-toan"
        element={<PaymentConfirmationPage />}
      />
      <Route path="*" element={<NotFoundPage />} />{" "}
      {/* Optional: Not Found Page */}
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
