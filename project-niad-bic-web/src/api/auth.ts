import { mockUsers } from "../mock/users";

interface LoginResponse {
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: number;
  };
  message?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Giả lập độ trễ của API
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    console.log("User found:", user); // Debug log

    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Không trả về password trong response
    const { password: _, ...userWithoutPassword } = user;
    const response = {
      user: userWithoutPassword,
    };

    console.log("Login response:", response); // Debug log
    return response;
  } catch (error) {
    console.error("Login error:", error); // Debug log
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Giả lập độ trễ của API
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
  }
};
