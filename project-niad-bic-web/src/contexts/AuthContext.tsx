import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  username: string;
  fullName: string;
  role: "admin" | "user";
  first_name?: string;
  last_name?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: User[] = [
  { username: "admin", fullName: "Quản trị viên", role: "admin" },
  { username: "user", fullName: "Người dùng", role: "user" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Hàm fetch thông tin user chi tiết từ API
  const fetchUserInfo = async (token?: string) => {
    try {
      const tk = token || sessionStorage.getItem("token");
      if (!tk) return;
      // Sử dụng JWT từ backend, gửi vào header Authorization
      const res = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      const userInfo = res.data;
      setUser((prev) => {
        const merged = {
          ...prev,
          ...userInfo,
          fullName: userInfo.full_name || prev?.fullName || prev?.username,
        };
        sessionStorage.setItem("user", JSON.stringify(merged));
        return merged;
      });
    } catch (err) {
      console.error("Lỗi fetch user info:", err);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    if (stored) setUser(JSON.parse(stored));
    if (token) fetchUserInfo(token);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: username,
        password: password,
      });

      const { token, role, fullName } = response.data;

      // Lưu token vào sessionStorage
      sessionStorage.setItem("token", token);

      // Tạo user object
      const userData: User = {
        username,
        fullName: fullName || username,
        role: role === "Admin" ? "admin" : "user",
      };

      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));

      // Gọi fetchUserInfo để lấy thông tin chi tiết
      await fetchUserInfo(token);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
