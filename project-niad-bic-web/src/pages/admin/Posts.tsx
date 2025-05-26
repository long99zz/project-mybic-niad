import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Tạm thời bỏ Link nếu không cần điều hướng chi tiết

interface Post {
  post_id: number;
  title: string;
  author: string;
  category_name: string;
  created_at: string;
}

const mockPosts = [
  {
    post_id: 1,
    title: "Đánh giá MSI Katana 15",
    author: "Admin",
    category_name: "Thông tin về Laptop",
    created_at: "2024-06-27 16:08:14",
  },
  {
    post_id: 2,
    title: "Chính thức: Samsung xác nhận sự kiện Galaxy Unpacked 2024",
    author: "Admin",
    category_name: "Thông tin về Laptop",
    created_at: "2024-06-30 20:28:18",
  },
];

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [success, setSuccess] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Thay thế bằng lệnh gọi API thực tế
      console.log("Fetching posts...");
      // const response = await fetch('/api/admin/posts');
      // if (!response.ok) { throw new Error('Failed to fetch posts'); }
      // const data = await response.json();
      // setPosts(data);

      // Mô phỏng độ trễ API và dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPosts(mockPosts);
      console.log("Posts fetched:", mockPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Không thể tải dữ liệu bài viết.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Các hàm CRUD placeholder
  const handleCreate = () => {
    // TODO: Triển khai chức năng tạo bài viết mới (có thể dùng routing hoặc modal)
    console.log("Initiating post creation...");
    alert("Chức năng thêm bài viết mới");
  };

  const handleView = (postId: number) => {
    // TODO: Triển khai chức năng xem chi tiết bài viết (có thể dùng routing)
    console.log("Viewing post with ID:", postId);
    alert(`Xem chi tiết bài viết ${postId}`);
  };

  const handleEdit = (postId: number) => {
    // TODO: Triển khai chức năng chỉnh sửa bài viết (có thể dùng routing hoặc modal)
    console.log("Editing post with ID:", postId);
    alert(`Chỉnh sửa bài viết ${postId}`);
  };

  const handleDelete = async (postId: number) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa?\nSau khi xóa sẽ không thể khôi phục"
      )
    ) {
      // TODO: Thay thế bằng lệnh gọi API xóa thực tế
      console.log("Attempting to delete post with ID:", postId);
      try {
        // const response = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
        // if (!response.ok) { throw new Error('Failed to delete post'); }

        // Mô phỏng độ trễ API và cập nhật trạng thái
        await new Promise((resolve) => setTimeout(resolve, 300));
        setPosts(posts.filter((post) => post.post_id !== postId));
        setSuccess("Đã xóa thành công 1 bài viết");
        console.log("Post deleted with ID:", postId);
      } catch (err) {
        console.error("Error deleting post:", err);
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
                  {/* <Link
                      to={`/admin/posts/view/${post.post_id}`}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Xem
                    </Link> */}
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                    onClick={() => handleView(post.post_id)}
                  >
                    Xem
                  </button>
                  {/* <Link
                      to={`/admin/posts/edit/${post.post_id}`}
                      className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                    >
                      Sửa
                    </Link> */}
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
