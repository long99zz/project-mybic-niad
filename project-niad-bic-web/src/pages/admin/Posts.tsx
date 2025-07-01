import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Post {
  post_id: number;
  title: string;
  content: string;
  category_id: number;
  image: string;
  author: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  category_id: number;
  Name: string; // Backend trả về Name với chữ N viết hoa
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category_id: "",
    status: "",
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    current_page: 1,
  });

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category_id) params.append("category_id", filters.category_id);
      if (filters.status) params.append("status", filters.status);

      const response = await axios.get(`${API_URL}/api/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(response.data.posts || []);
      setPagination({
        total: response.data.total,
        total_pages: response.data.total_pages,
        current_page: response.data.page,
      });
      
      // Debug: Log image URLs
      if (response.data.posts && response.data.posts.length > 0) {
        console.log('Posts with images:', response.data.posts.map(post => ({
          id: post.post_id,
          title: post.title,
          image: post.image
        })));
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      setError("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Get category name by category_id
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.Name : "Không xác định";
  };

  // Delete post
  const handleDelete = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchPosts(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting post:", error);
      alert("Không thể xóa bài viết");
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : (value as number), // Reset to page 1 when other filters change
    }));
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800", 
      archived: "bg-gray-100 text-gray-800",
    };
    
    const labels = {
      draft: "Nháp",
      published: "Đã xuất bản",
      archived: "Lưu trữ",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
        <Link
          to="/admin/posts/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm bài viết
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange("category_id", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số bài viết/trang
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 ">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có bài viết nào</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Bắt đầu bằng cách tạo bài viết đầu tiên của bạn.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/admin/posts/add"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          + Thêm bài viết
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.post_id} className="hover:bg-gray-50">
                    {/* Hình ảnh */}
                    <td className="px-6 py-4">
                      <div className="h-16 w-16 flex-shrink-0">
                        {post.image ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                            src={post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`}
                            alt={post.title}
                            onError={(e) => {
                              console.error('Image load error:', post.image);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Bài viết */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs">
                          ID: {post.post_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryName(post.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/posts/edit/${post.post_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(post.post_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => handleFilterChange("page", Math.min(pagination.total_pages, filters.page + 1))}
                disabled={filters.page >= pagination.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{pagination.total}</span> bài viết
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ‹
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.total_pages || 
                      Math.abs(page - filters.page) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => handleFilterChange("page", page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            filters.page === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))
                  }
                  
                  <button
                    onClick={() => handleFilterChange("page", Math.min(pagination.total_pages, filters.page + 1))}
                    disabled={filters.page >= pagination.total_pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;