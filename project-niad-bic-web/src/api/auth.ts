const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface LoginResponse {
  token: string;
  role: string;
  message?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email hoặc mật khẩu không đúng");
    }

    const data = await response.json();
    
    // Lưu token vào sessionStorage thay vì localStorage
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("role", data.role);
    
    console.log("Login successful:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Xóa token từ sessionStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    console.log("Logout successful");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
  }
};
