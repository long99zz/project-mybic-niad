import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, Calendar, User, Eye, Tag } from "lucide-react";

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

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch post detail
  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts/${id}`);
      setPost(response.data);
      
      // Fetch related posts từ cùng category
      if (response.data?.category_id) {
        fetchRelatedPosts(response.data.category_id, parseInt(id));
      }
    } catch (error: any) {
      console.error("Error fetching post:", error);
      setError("Không thể tải bài viết");
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

  // Fetch related posts
  const fetchRelatedPosts = async (categoryId: number, currentPostId: number) => {
    try {
      const params = new URLSearchParams();
      params.append("category_id", categoryId.toString());
      params.append("status", "published");
      params.append("limit", "4");
      
      const response = await axios.get(`${API_URL}/api/posts?${params}`);
      const posts = response.data.posts || [];
      
      // Loại bỏ bài viết hiện tại khỏi danh sách liên quan
      const filtered = posts.filter((p: Post) => p.post_id !== currentPostId);
      setRelatedPosts(filtered.slice(0, 3));
    } catch (error) {
      console.error("Error fetching related posts:", error);
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Truncate content for related posts
  const getExcerpt = (content: string, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  useEffect(() => {
    fetchCategories();
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="pt-[82px] flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="pt-[82px]">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || "Không tìm thấy bài viết"}
            </div>
            <Link 
              to="/tin-tuc" 
              className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách tin tức
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="pt-[82px]">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-red-600 transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <Link to="/tin-tuc" className="hover:text-red-600 transition-colors">
                Tin tức
              </Link>
              <span>/</span>
              <span className="text-gray-800">{post.title}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Featured image */}
                {post.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-red-600" />
                      {post.author || "Admin"}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-red-600" />
                      {post.views || 0} lượt xem
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-red-600" />
                      {getCategoryName(post.category_id)}
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {post.title}
                  </h1>

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-a:hover:text-red-800 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Back button */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link 
                      to="/tin-tuc" 
                      className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại danh sách tin tức
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-bold text-red-600 mb-6 pb-2 border-b border-gray-200">
                    BÀI VIẾT LIÊN QUAN
                  </h3>
                  <div className="space-y-6">
                    {relatedPosts.map((relatedPost) => (
                      <Link 
                        to={`/tin-tuc/${relatedPost.post_id}`} 
                        key={relatedPost.post_id} 
                        className="flex gap-4 hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <img
                          src={relatedPost.image ? (relatedPost.image.startsWith('http') ? relatedPost.image : `${API_URL}${relatedPost.image}`) : "/placeholder.svg"}
                          alt={relatedPost.title}
                          className="w-[100px] h-[70px] object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {getExcerpt(relatedPost.content)}
                          </p>
                          <div className="text-gray-500 text-xs mt-1">
                            {formatDate(relatedPost.created_at)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to news list */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-red-600 mb-4">
                  XEM THÊM TIN TỨC
                </h3>
                <Link 
                  to="/tin-tuc"
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors text-center block"
                >
                  Xem tất cả tin tức
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
