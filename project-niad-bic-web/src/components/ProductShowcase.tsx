"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Dữ liệu sản phẩm bảo hiểm
const insuranceProducts = [
  {
    id: "cyber-risk",
    image: "/products/bic-cyber-risk.png",
    tag: "BIC Cyber Risk",
    title: "Bảo hiểm an ninh mạng",
    contactLink: "/lien-he/an-ninh-mang",
    buyLink: "/mua-ngay/an-ninh-mang",
    detailUrl: "/san-pham/bao-hiem-an-ninh-mang",
  },
  {
    id: "phuc-tam-an",
    image: "/products/bic-phuc-tam-an.png",
    tag: "BIC Phúc Tâm An",
    title: "Bảo hiểm bệnh ung thư",
    contactLink: "/lien-he/benh-ung-thu",
    buyLink: "/mua-ngay/benh-ung-thu",
    detailUrl: "/san-pham/bao-hiem-benh-ung-thu-phuc-tam-an",
  },
  {
    id: "tam-an",
    image: "/products/bic-tam-an.png",
    tag: "BIC Tâm An",
    title: "Bảo hiểm tai nạn và sức khỏe cá nhân",
    contactLink: "/lien-he/tai-nan-suc-khoe",
    buyLink: "/mua-ngay/tai-nan-suc-khoe",
    detailUrl: "/san-pham/bao-hiem-suc-khoe-tam-an",
  },
  {
    id: "tai-nan-24h",
    image: "/products/bic-tai-nan-24h.png",
    tag: "BIC Tâm An",
    title: "Bảo hiểm tai nạn con người 24/24",
    contactLink: "/lien-he/tai-nan-24h",
    buyLink: "/mua-ngay/tai-nan-24h",
    detailUrl: "/san-pham/bao-hiem-tai-nan-24-24",
  },
  {
    id: "travel-care",
    image: "/products/bic-travel-care.png",
    tag: "BIC Travel Care",
    title: "Bảo hiểm du lịch trong nước (TRV)",
    contactLink: "/lien-he/du-lich-trong-nuoc",
    buyLink: "/mua-ngay/du-lich-trong-nuoc",
    detailUrl: "/san-pham/bao-hiem-du-lich-trong-nuoc",
  },
  {
    id: "tnds-oto",
    image: "/products/bic-tnds-oto.png",
    tag: "TNDS Ô tô",
    title: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
    contactLink: "/lien-he/tnds-oto",
    buyLink: "/mua-ngay/tnds-oto",
    detailUrl: "/san-pham/bao-hiem-trach-nhiem-dan-su-chu-xe-o-to",
  },
  {
    id: "tnds-xe-may",
    image: "/products/bic-tnds-xe-may.png",
    tag: "TNDS Xe máy",
    title: "Bảo hiểm trách nhiệm dân sự chủ xe máy",
    contactLink: "/lien-he/tnds-xe-may",
    buyLink: "/mua-ngay/tnds-xe-may",
    detailUrl: "/san-pham/bao-hiem-tnds-xe-may",
  },
  {
    id: "du-lich-quoc-te",
    image: "/products/bic-du-lich-quoc-te.png",
    tag: "Du lịch quốc tế",
    title: "Bảo hiểm du lịch quốc tế (ITI)",
    contactLink: "/lien-he/du-lich-quoc-te",
    buyLink: "/mua-ngay/du-lich-quoc-te",
    detailUrl: "/san-pham/bao-hiem-du-lich-quoc-te",
  },
];

export default function ProductShowcase() {
  const [slideIndex, setSlideIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerRow, setItemsPerRow] = useState(3);
  const [itemWidth, setItemWidth] = useState(0);

  // Chia sản phẩm thành 2 hàng chính xác
  const firstRowCount = Math.ceil(insuranceProducts.length / 2);
  const topRowProducts = insuranceProducts.slice(0, firstRowCount);
  const bottomRowProducts = insuranceProducts.slice(firstRowCount);

  // Xác định số lượng sản phẩm hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerRow(3); // Desktop: 3 sản phẩm mỗi hàng
      } else if (window.innerWidth >= 768) {
        setItemsPerRow(2); // Tablet: 2 sản phẩm mỗi hàng
      } else {
        setItemsPerRow(1); // Mobile: 1 sản phẩm mỗi hàng
      }

      // Tính toán chiều rộng của mỗi item
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const gap = 24; // gap-6 = 1.5rem = 24px
        const calculatedWidth =
          (containerWidth - gap * (itemsPerRow - 1)) / itemsPerRow;
        setItemWidth(calculatedWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerRow]);

  // Tính toán số slide tối đa dựa trên hàng có nhiều sản phẩm nhất
  const maxSlides = Math.max(0, topRowProducts.length - itemsPerRow);

  // Di chuyển sang phải
  const nextSlide = () => {
    if (slideIndex < maxSlides) {
      setSlideIndex(slideIndex + 1);
    }
  };

  // Di chuyển sang trái
  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  // Tính toán translateX dựa trên slide hiện tại
  const getTranslateX = () => {
    if (itemWidth === 0) return 0;
    const gapWidth = 24; // gap-6 = 1.5rem = 24px
    return -slideIndex * (itemWidth + gapWidth);
  };

  // Tạo danh sách sản phẩm cho một hàng
  const renderProductRow = (products: typeof insuranceProducts) => {
    return products.map((product) => (
      <div
        key={product.id}
        className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex-shrink-0 group cursor-pointer"
        style={{
          width:
            itemWidth > 0 ? `${itemWidth}px` : `calc(100% / ${itemsPerRow})`,
        }}
      >
        <div className="relative h-[200px] overflow-hidden">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay gradient để làm nổi bật text nếu cần */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="p-6 flex flex-col min-h-[160px] bg-white">
          <div className="text-red-600 font-medium text-center mb-2">
            {product.tag}
          </div>

          <h3 className="text-gray-800 font-medium text-center mb-6 group-hover:text-red-600 transition-colors line-clamp-2">
            {product.title}
          </h3>

          <div className="flex justify-between items-center mt-4">
            <Link
              to={`/mua-ngay/${product.id}`}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              MUA NGAY
            </Link>
            <Link
              to={product.contactLink}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              LIÊN HỆ
            </Link>
          </div>
        </div>
      </div>
    ));
  };

  // Kiểm tra xem có thể trượt sang phải không
  const canSlideNext = slideIndex < maxSlides;

  // Kiểm tra xem có thể trượt sang trái không
  const canSlidePrev = slideIndex > 0;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-red-600 text-3xl font-bold mb-12">
          Sản phẩm Bảo hiểm trực tuyến BIC
        </h2>

        <div className="relative px-16">
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className={`absolute left-[-10px] top-1/2 transform -translate-y-1/2 z-10 ${
              canSlidePrev
                ? "text-gray-600 hover:text-red-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous slide"
            disabled={!canSlidePrev}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button
            onClick={nextSlide}
            className={`absolute right-[-10px] top-1/2 transform -translate-y-1/2 z-10 ${
              canSlideNext
                ? "text-gray-600 hover:text-red-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Next slide"
            disabled={!canSlideNext}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Slider container */}
          <div ref={containerRef} className="overflow-hidden">
            <div className="grid grid-rows-2 gap-8">
              {/* Hàng 1 */}
              <div className="overflow-hidden">
                <div
                  className="flex gap-6 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(${getTranslateX()}px)` }}
                >
                  {renderProductRow(topRowProducts)}
                </div>
              </div>

              {/* Hàng 2 */}
              <div className="overflow-hidden">
                <div
                  className="flex gap-6 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(${getTranslateX()}px)` }}
                >
                  {renderProductRow(bottomRowProducts)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
