import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Post {
  post_id: number;
  title: string;
  author: string;
  category_name: string;
  created_at: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [success, setSuccess] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/posts`, { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      setError("Không thể tải dữ liệu bài viết.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/admin/posts/add");
  };

  const handleEdit = (postId: number) => {
    navigate(`/admin/posts/edit/${postId}`);
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa? Sau khi xóa sẽ không thể khôi phục")) {
      try {
        await axios.delete(`${API_URL}/api/posts/${postId}`, { withCredentials: true });
        setPosts(posts.filter((post) => post.post_id !== postId));
        setSuccess("Đã xóa thành công 1 bài viết");
      } catch (err) {
        setError("Không thể xóa bài viết.");
      }
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu bài viết...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách bài viết</h2>
      <div className="mb-4 flex justify-between items-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          onClick={handleCreate}
        >
          Thêm bài viết
        </button>
        <input
          type="text"
          className="w-64 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tìm bài viết..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-center">Tiêu đề</th>
              <th className="p-2 text-center">Tác giả</th>
              <th className="p-2 text-center">Chuyên mục</th>
              <th className="p-2 text-center">Ngày đăng</th>
              <th className="p-2 text-center">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post, index) => (
              <tr key={post.post_id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2 text-center">{post.title}</td>
                <td className="p-2 text-center">{post.author}</td>
                <td className="p-2 text-center">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {post.category_name}
                  </span>
                </td>
                <td className="p-2 text-center">{post.created_at}</td>
                <td className="p-2 space-x-2 text-center">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    onClick={() => handleEdit(post.post_id)}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(post.post_id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Posts;