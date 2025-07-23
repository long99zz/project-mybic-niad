import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Tạm thời bỏ Link

interface Comment {
  id: number;
  name: string;
  content: string;
  time: string;
}

const mockComments = [
  {
    id: 1,
    name: "Admin",
    content: "Hello, sản phẩm này rất tốt!!!",
    time: "25-06-2024 17:02",
  },
  {
    id: 2,
    name: "User1",
    content: "Sản phẩm tạm được.",
    time: "26-06-2024 09:30",
  },
];

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    // TODO: Gọi API lấy danh sách bình luận
    // Tạm thời mock dữ liệu
    setComments(mockComments);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách bình luận</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Họ tên</th>
            <th className="p-2 text-left">Bình luận</th>
            <th className="p-2 text-left">Thời gian</th>
            <th className="p-2 text-left">Chỉnh sửa</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c, i) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.content}</td>
              <td className="p-2">{c.time}</td>
              <td className="p-2">
                {/* <Link to={`/admin/comments/${c.id}`} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Chi tiết</Link> */}
                <button className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Comments;
