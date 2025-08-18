import React, { useEffect, useState } from "react";

interface Post {
  id?: number;
  title: string;
  content: string;
}

const API_URL = "http://localhost:8080/api/posts"; // thay bằng domain backend Golang của bạn

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<Post>({ title: "", content: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Lấy danh sách bài viết
  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Thêm hoặc sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // update
        await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // add
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      setForm({ title: "", content: "" });
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      console.error("Save post error:", err);
    }
  };

  // Xóa bài viết
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchPosts();
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  // Bắt đầu sửa
  const handleEdit = (post: Post) => {
    setForm({ title: post.title, content: post.content });
    setEditingId(post.id || null);
  };

  return (
    <div className="p-6">
      {/* Form thêm / sửa */}
      <form
        onSubmit={handleSubmit}
        className="p-4 mb-6 space-y-4 bg-white shadow rounded-xl"
      >
        <input
          type="text"
          placeholder="Tiêu đề"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Nội dung"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded"
        >
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      {/* Danh sách bài viết */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-start justify-between p-4 bg-gray-100 rounded-xl"
          >
            <div>
              <h2 className="font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-600">{post.content}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(post)}
                className="px-3 py-1 text-white bg-yellow-500 rounded"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(post.id!)}
                className="px-3 py-1 text-white bg-red-600 rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
