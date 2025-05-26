"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { newsData } from "../data/newsData";

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Hiển thị 2 bài viết trên mỗi trang

  // Lọc tin tức theo từ khóa tìm kiếm
  const filteredNews = newsData.filter(
    (news) =>
      searchTerm === "" ||
      news.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Lấy tin tức cho trang hiện tại
  const currentPageNews = filteredNews.slice(
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
            {currentPageNews.map((news) => (
              <div key={news.id} className="mb-8">
                <img
                  src={news.image || "/placeholder.svg"}
                  alt={news.title}
                  className="w-full h-auto rounded"
                />
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
                      {news.date}
                    </span>
                    <Link
                      to="/tin-tuc"
                      className="text-red-600 hover:underline flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 mr-2"
                      >
                        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                      </svg>
                      {news.category}
                    </Link>
                  </div>

                  <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-4">
                    {news.title}
                  </h2>

                  <p className="text-gray-700 text-xl">{news.excerpt}</p>
                  <Link
                    to={news.link}
                    className="rounded inline-flex cursor-pointer mt-9 border-[#ee1c24] text-black text-base p-[0_34px] h-12 leading-[48px] border-[2px] justify-center items-center"
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

            {/* Tin mới nhất */}
            <div className="bg-white rounded-md shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-red-600 mb-6 pb-2 border-b border-gray-200">
                TIN MỚI NHẤT
              </h3>
              <div className="space-y-6">
                {newsData
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 3)
                  .map((news) => (
                    <Link to={news.link} key={news.id} className="flex gap-4">
                      <img
                        src={news.thumbnail || news.image || "/placeholder.svg"}
                        alt={news.title}
                        className="w-[110px] h-[80px] object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {news.title}
                        </h4>
                        <div className="text-gray-500 text-xs">{news.date}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
