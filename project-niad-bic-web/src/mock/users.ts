export const mockUsers = [
  {
    id: 1,
    username: "admin",
    full_name: "Administrator",
    email: "admin@example.com",
    password: "admin123", // Trong thực tế nên mã hóa mật khẩu
    role: 1, // Admin
  },
  {
    id: 2,
    username: "user1",
    full_name: "Nguyễn Văn A",
    email: "user1@example.com",
    password: "user123",
    role: 0, // User thường
  },
  {
    id: 3,
    username: "staff1",
    full_name: "Trần Thị B",
    email: "staff1@example.com",
    password: "staff123",
    role: 1, // Admin
  },
];
