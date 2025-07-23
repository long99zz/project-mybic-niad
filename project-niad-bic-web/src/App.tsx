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
import Users from "./pages/admin/Users";
import Comments from "./pages/admin/Comments";
import Statistics from "./pages/admin/Statistics";
import InsuranceOrderRouter from "./pages/order/InsuranceOrderRouter";

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
      <Route path="/khuyen-mai" element={<PromotionsPage />} />
      <Route path="/san-pham" element={<ProductsPage />} />
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
        path="/san-pham/bao-hiem-tai-nan-nguoi-su-dung-dien"
        element={
          <ProductDetailPage productSlug="bao-hiem-tai-nan-nguoi-su-dung-dien" />
        }
      />
      <Route
        path="/san-pham/bao-hiem-tai-nan-mo-rong"
        element={<ProductDetailPage productSlug="bao-hiem-tai-nan-mo-rong" />}
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
      <Route path="/san-pham/:category" element={<ProductsPage />} />
      <Route path="/danh-muc/:category" element={<ProductsPage />} />
      <Route path="/danh-muc/:category.html" element={<ProductsPage />} />
      <Route path="/nhap-thong-tin.html" element={<OrderPage />} />
      <Route
        path="/mua-bao-hiem/:category/:productId"
        element={<InsuranceOrderRouter />}
      />
      <Route
        path="/mua-bao-hiem/:productId"
        element={<InsuranceOrderRouter />}
      />
      <Route path="/mua-ngay/:productType" element={<InsuranceOrderRouter />} />
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

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="posts" element={<Posts />} />
        <Route path="users" element={<Users />} />
        <Route path="comments" element={<Comments />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>

      <Route
        path="/mua-bao-hiem/bao-hiem-an-ninh-mang"
        element={<InsuranceOrderRouter />}
      />
      <Route
        path="/mua-ngay/bao-hiem-an-ninh-mang"
        element={<InsuranceOrderRouter />}
      />
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
