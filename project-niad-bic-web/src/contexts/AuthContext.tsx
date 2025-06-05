import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  citizenId: string;
  gender: string;
  dateOfBirth: string;
  province: string;
  city: string;
  district: string;
  subDistrict: string;
  houseNumber: string;
  role: "Admin" | "Customer";
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  citizenId?: string;
  gender: string;
  dateOfBirth: string;
  province?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  houseNumber?: string;
}

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  citizenId?: string;
  gender?: string;
  dateOfBirth?: string;
  province?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  houseNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (
    data: UpdateUserData
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Failed to get user info:", error);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const register = async (data: RegisterData) => {
    try {
      console.log("Attempting register with data:", {
        ...data,
        password: "***", // Không log mật khẩu
      });

      const response = await axios.post(`${API_URL}/register`, data);
      console.log("Register response:", response.data);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Register error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return {
        success: false,
        message: error.response?.data?.error || "Đăng ký thất bại",
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email });
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      console.log("Login response:", response.data);

      const { token, role } = response.data;
      sessionStorage.setItem("token", token);

      // Lấy thông tin user
      const userResponse = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User info response:", userResponse.data);

      setUser(userResponse.data);
      sessionStorage.setItem("user", JSON.stringify(userResponse.data));
      return true;
    } catch (error: any) {
      console.error("Login error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
  };

  const updateUser = async (data: UpdateUserData) => {
    if (!user) {
      return { success: false, message: "Người dùng chưa đăng nhập." };
    }
    try {
      console.log("Attempting to update user with data:", data);
      const response = await axios.put(`${API_URL}/api/user/${user.id}`, data);
      console.log("Update user response:", response.data);
      setUser(response.data);
      sessionStorage.setItem("user", JSON.stringify(response.data));
      return { success: true, message: "Cập nhật thông tin thành công!" };
    } catch (error: any) {
      console.error("Update user error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return {
        success: false,
        message: error.response?.data?.error || "Cập nhật thông tin thất bại.",
      };
    }
  };

  // Add axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "Admin",
        login,
        register,
        logout,
        updateUser,
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
