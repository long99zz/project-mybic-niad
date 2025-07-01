"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
// import { newsData } from "../data/newsData"; // Comment lại data cũ vì đã không dùng

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
  Name: string;
}

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 6; // Tăng số bài viết hiển thị

  // Fetch posts từ backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "100"); // Lấy nhiều bài viết để phân trang client-side
      params.append("status", "published"); // Chỉ lấy bài viết đã xuất bản
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axios.get(`${API_URL}/api/posts?${params}`);
      setPosts(response.data.posts || []);
      
      // Debug log
      console.log('Posts data:', response.data.posts);
      
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
      const response = await axios.get(`${API_URL}/api/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.Name : "Tin tức";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  // Truncate content for excerpt
  const getExcerpt = (content: string, maxLength = 200) => {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  useEffect(() => {
    // Reset về trang 1 khi tìm kiếm thay đổi
    setCurrentPage(1);
    fetchPosts();
  }, [searchTerm]);

  // Comment lại logic cũ
  // Lọc tin tức theo từ khóa tìm kiếm
  // const filteredNews = newsData.filter(
  //   (news) =>
  //     searchTerm === "" ||
  //     news.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Tính toán tổng số trang
  // const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Lấy tin tức cho trang hiện tại
  // const currentPageNews = filteredNews.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // Logic phân trang - hiện tại là client-side pagination
  const totalItems = posts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Lấy posts cho trang hiện tại
  const currentPagePosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Xử lý chuyển trang
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="pt-[82px] mb-8">
          {/* Tiêu đề trang */}
          <div className="border-b border-gray-200 flex flex-col items-center">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="w-20 h-1 bg-black mb-1 mx-auto"></div>
              <h1 className="text-4xl font-bold text-red-600 text-center">
                Tin tức
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Posts list */}
            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không có bài viết nào được tìm thấy.</p>
              </div>
            )}

            {!loading && !error && currentPagePosts.map((post) => (
              <div key={post.post_id} className="mb-8">
                {post.image && (
                  <img
                    src={post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`}
                    alt={post.title}
                    className="w-full h-auto rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                )}
                <div className="p-10">
                  <div className="flex items-center text-sm text-gray-500 my-8">
                    <span className="mr-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6 mr-2 text-red-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      {formatDate(post.created_at)}
                    </span>
                    <span className="text-red-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 mr-2"
                      >
                        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                      </svg>
                      {getCategoryName(post.category_id)}
                    </span>
                  </div>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-4">
                    {post.title}
                  </h2>

                  <p className="text-gray-700 text-xl">{getExcerpt(post.content)}</p>
                  <Link
                    to={`/tin-tuc/${post.post_id}`}
                    className="rounded inline-flex cursor-pointer mt-9 border-[#ee1c24] text-black text-base p-[0_34px] h-12 leading-[48px] border-[2px] justify-center items-center hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Xem thêm
                  </Link>
                </div>
              </div>
            ))}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 mb-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-md ${
                          currentPage === page
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            {/* Ô tìm kiếm - giữ nguyên kiểu cũ */}
            <div className="bg-white rounded-md shadow-md p-4 mb-8">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                  }}
                />
                <button className="bg-red-600 text-white px-4 py-2 rounded-r-md">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tin mới nhất - lấy từ backend */}
            <div className="bg-white rounded-md shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-red-600 mb-6 pb-2 border-b border-gray-200">
                TIN MỚI NHẤT
              </h3>
              <div className="space-y-6">
                {posts
                  .filter(post => post.status === 'published')
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 3)
                  .map((post) => (
                    <Link to={`/tin-tuc/${post.post_id}`} key={post.post_id} className="flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors">
                      <img
                        src={post.image ? (post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`) : "/placeholder.svg"}
                        alt={post.title}
                        className="w-[110px] h-[80px] object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="text-gray-500 text-xs">{formatDate(post.created_at)}</div>
                      </div>
                    </Link>
                  ))}
                {posts.length === 0 && !loading && (
                  <p className="text-gray-500 text-sm">Chưa có bài viết nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
