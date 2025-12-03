"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";
import CustomerSupport from "../components/CustomerSupport";
import Contact from "../components/Contact";

// Dữ liệu chi tiết sản phẩm
import { productDetails } from "../data/productDetails";

interface ProductDetailPageProps {
  productSlug?: string;
}

export default function ProductDetailPage({
  productSlug,
}: ProductDetailPageProps) {
  const params = useParams<{ productId?: string }>();
  const [product, setProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("thong-tin-chung");

  useEffect(() => {
    // Ưu tiên sử dụng productSlug từ props (được truyền trực tiếp từ Route)
    const slug =
      productSlug ||
      params.productId ||
      "bao-hiem-trach-nhiem-dan-su-chu-xe-o-to";

    // Lấy thông tin sản phẩm dựa trên slug
    const foundProduct = productDetails[slug as keyof typeof productDetails];
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Mặc định hiển thị sản phẩm bảo hiểm TNDS ô tô nếu không tìm thấy
      setProduct(productDetails["bao-hiem-trach-nhiem-dan-su-chu-xe-o-to"]);
    }
  }, [productSlug, params.productId]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[82px]">
        {/* Chi tiết sản phẩm */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Hình ảnh sản phẩm - điều chỉnh kích thước */}
            <div className="w-full lg:w-[45%]">
              <img
                src={product.bannerImage || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-auto"
              />
            </div>

            {/* Thông tin sản phẩm - điều chỉnh kích thước và căn trái */}
            <div className="w-full lg:w-[55%] text-left">
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                {product.title}
              </h1>
              <h2 className="text-xl font-medium text-gray-700 mb-6">
                {product.subtitle}
              </h2>

              <div className="mb-6 text-left">
                <p className="text-gray-700 font-medium mb-1">
                  Giá bán (chưa gồm VAT):
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <Link
                  to={`/mua-bao-hiem/${productSlug}`}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  MUA NGAY
                </Link>
                <Link
                  to="/lien-he"
                  className="px-6 py-3 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  LIÊN HỆ TƯ VẤN
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs và nội dung chi tiết */}
          <div className="mt-12 flex flex-col md:flex-row gap-0 max-w-6xl mx-auto">
            {/* Sidebar menu - điều chỉnh kích thước */}
            <div className="w-full md:w-[33%]">
              <div className="border-t border-gray-300">
                <button
                  className={`w-full text-left px-6 py-4 flex items-center justify-between border-b border-gray-300 ${
                    activeTab === "thong-tin-chung"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-red-600 text-white hover:bg-gray-200 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("thong-tin-chung")}
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 mr-3" />
                    <span className="font-medium text-lg">Thông tin chung</span>
                  </div>
                </button>

                <button
                  className={`w-full text-left px-6 py-4 flex items-center justify-between border-b border-gray-300 ${
                    activeTab === "bang-quyen-loi"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-red-600 text-white hover:bg-gray-200 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("bang-quyen-loi")}
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 mr-3" />
                    <span className="font-medium text-lg">
                      Bảng quyền lợi bảo hiểm
                    </span>
                  </div>
                </button>

                <button
                  className={`w-full text-left px-6 py-4 flex items-center justify-between border-b border-gray-300 ${
                    activeTab === "bieu-phi"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-red-600 text-white hover:bg-gray-200 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("bieu-phi")}
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 mr-3" />
                    <span className="font-medium text-lg">
                      Biểu phí bảo hiểm
                    </span>
                  </div>
                </button>

                <button
                  className={`w-full text-left px-6 py-4 flex items-center justify-between border-b border-gray-300 ${
                    activeTab === "huong-dan-boi-thuong"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-red-600 text-white hover:bg-gray-200 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("huong-dan-boi-thuong")}
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 mr-3" />
                    <span className="font-medium text-lg">
                      Hướng dẫn bồi thường
                    </span>
                  </div>
                </button>

                <button
                  className={`w-full text-left px-6 py-4 flex items-center justify-between border-b border-gray-300 ${
                    activeTab === "quy-tac-bieu-mau"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-red-600 text-white hover:bg-gray-200 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab("quy-tac-bieu-mau")}
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 mr-3" />
                    <span className="font-medium text-lg">
                      Quy tắc, biểu mẫu
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Nội dung chi tiết - điều chỉnh kích thước và căn trái */}
            <div className="w-full md:w-[66%] ml-[15px]">
              <div className="bg-gray-100 p-8 text-left h-auto min-h-[168px]">
                {activeTab === "thong-tin-chung" && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Đối tượng bảo hiểm
                    </h3>
                    <p className="text-gray-700 mb-6 text-left">
                      {product.doiTuongBaoHiem}
                    </p>

                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Phạm vi bảo hiểm
                    </h3>
                    <p className="text-gray-700 mb-6 text-left">
                      {product.phamViBaoHiem}
                    </p>
                  </div>
                )}

                {activeTab === "bang-quyen-loi" && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Quyền lợi bảo hiểm
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-left">
                      {product.quyenLoiBaoHiem.map(
                        (item: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {activeTab === "bieu-phi" && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Biểu phí bảo hiểm
                    </h3>
                    <p className="text-gray-700 text-left">
                      {product.bieuPhiBaoHiem}
                    </p>
                  </div>
                )}

                {activeTab === "huong-dan-boi-thuong" && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Hướng dẫn bồi thường
                    </h3>
                    <p className="text-gray-700 text-left">
                      {product.huongDanBoiThuong}
                    </p>
                  </div>
                )}

                {activeTab === "quy-tac-bieu-mau" && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 text-left">
                      Quy tắc, biểu mẫu
                    </h3>
                    <p className="text-gray-700 text-left">
                      {product.quyTacBieuMau}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <CustomerSupport />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
