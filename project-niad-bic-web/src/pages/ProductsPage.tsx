"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import {
  ChevronRight,
  Car,
  Bike,
  Heart,
  Map,
  Shield,
  Home,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface ProductCardProps {
  id: number;
  image: string;
  title: string;
  detailUrl: string;
  buyUrl?: string;
}

// Cập nhật component ProductCard để tăng kích thước chiều ngang và căn trái nội dung
const ProductCard = ({ image, title, detailUrl, buyUrl }: ProductCardProps) => {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm mb-6 border border-gray-200 w-full">
      <div className="flex items-center">
        {/* Phần ảnh bên trái - giữ nguyên tỷ lệ */}
        <div className="w-1/3 pr-6">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-auto object-cover rounded-md"
          />
        </div>

        {/* Phần nội dung ở giữa - căn trái text */}
        <div className="w-1/3 pr-4 text-left">
          <h3 className="text-xl font-medium text-red-600 mb-3">{title}</h3>
          <a
            href={detailUrl}
            className="text-blue-600 text-sm flex items-center hover:underline text-left"
          >
            Chi tiết <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        {/* Phần button bên phải */}
        <div className="w-1/3 flex justify-end">
          {buyUrl && (
            <a
              href={buyUrl}
              className="border-2 border-red-600 text-red-600 font-medium px-10 py-3 inline-block hover:bg-red-600 hover:text-white transition-colors"
            >
              MUA NGAY
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Danh mục sản phẩm với icon
const categories = [
  {
    id: "bao-hiem-o-to-9",
    name: "Bảo hiểm ô tô",
    icon: <Car className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-xe-may-10",
    name: "Bảo hiểm xe máy",
    icon: <Bike className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-suc-khoe-11",
    name: "Bảo hiểm sức khỏe",
    icon: <Heart className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-du-lich-13",
    name: "Bảo hiểm du lịch",
    icon: <Map className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-tai-nan-12",
    name: "Bảo hiểm tai nạn",
    icon: <Shield className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-nha-tu-nhan-14",
    name: "Bảo hiểm nhà tư nhân",
    icon: <Home className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
  {
    id: "bao-hiem-an-ninh-mang-15",
    name: "Bảo hiểm an ninh mạng",
    icon: <Lock className="w-7 h-7 stroke-[1.5] group-hover:text-red-600" />,
    active: false,
  },
];

// Dữ liệu sản phẩm theo danh mục
const productsByCategory = {
  "bao-hiem-o-to-9": [
    {
      id: 1,
      image: "/products/bic-tnds-oto.png?height=200&width=300",
      title: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
      detailUrl: "/san-pham/bao-hiem-trach-nhiem-dan-su-chu-xe-o-to",
      buyUrl: "/mua-bao-hiem/bao-hiem-o-to/tnds-bat-buoc",
    },
    {
      id: 2,
      image: "/products/vc-oto.png?height=200&width=300",
      title: "Bảo hiểm vật chất ô tô",
      detailUrl: "/san-pham/bao-hiem-vat-chat-o-to",
      buyUrl: "/mua-bao-hiem/bao-hiem-o-to/vat-chat-xe",
    },
  ],
  "bao-hiem-xe-may-10": [
    {
      id: 3,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm TNDS bắt buộc xe máy",
      detailUrl: "/san-pham/bao-hiem-tnds-xe-may",
      buyUrl: "/mua-bao-hiem/bao-hiem-xe-may/tnds-bat-buoc",
    },
  ],
  "bao-hiem-suc-khoe-11": [
    {
      id: 4,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm sức khỏe và tai nạn cá nhân BIC Tâm An",
      detailUrl: "/san-pham/bao-hiem-suc-khoe-tam-an",
      buyUrl: "/mua-bao-hiem/bao-hiem-suc-khoe/bic-tam-an",
    },
    {
      id: 5,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm bệnh ung thư BIC Phúc Tâm An",
      detailUrl: "/san-pham/bao-hiem-benh-ung-thu-phuc-tam-an",
      buyUrl: "/mua-bao-hiem/bao-hiem-suc-khoe/bic-phuc-tam-an",
    },
  ],
  "bao-hiem-du-lich-13": [
    {
      id: 6,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm du lịch quốc tế (ITI)",
      detailUrl: "/san-pham/bao-hiem-du-lich-quoc-te",
      buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/quoc-te",
    },
    {
      id: 7,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm du lịch trong nước (TRV)",
      detailUrl: "/san-pham/bao-hiem-du-lich-trong-nuoc",
      buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/trong-nuoc",
    },
    {
      id: 8,
      image: "/placeholder.svg?height=200&width=300",
      title: "BIC TRAVEL CARE\nBảo hiểm tai nạn khách du lịch (TVC)",
      detailUrl: "/san-pham/bao-hiem-tai-nan-khach-du-lich",
      buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/tai-nan-khach-du-lich",
    },
  ],
  "bao-hiem-tai-nan-12": [
    {
      id: 9,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm tai nạn 24/24",
      detailUrl: "/san-pham/bao-hiem-tai-nan-24-24",
      buyUrl: "/mua-bao-hiem/bao-hiem-tai-nan/24-24",
    },
    {
      id: 10,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm tai nạn người sử dụng điện",
      detailUrl: "/san-pham/bao-hiem-tai-nan-nguoi-su-dung-dien",
      buyUrl:
        "/mua-bao-hiem/bao-hiem-tai-nan/bao-hiem-tai-nan-nguoi-su-dung-dien",
    },
    {
      id: 11,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm tai nạn mở rộng",
      detailUrl: "/san-pham/bao-hiem-tai-nan-mo-rong",
      buyUrl: "/mua-bao-hiem/bao-hiem-tai-nan/bao-hiem-tai-nan-mo-rong",
    },
  ],
  "bao-hiem-nha-tu-nhan-14": [
    {
      id: 10,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm toàn diện nhà tư nhân",
      detailUrl: "/san-pham/bao-hiem-toan-dien-nha-tu-nhan",
      buyUrl: "/mua-bao-hiem/bao-hiem-nha-tu-nhan/toan-dien",
    },
  ],
  "bao-hiem-an-ninh-mang-15": [
    {
      id: 11,
      image: "/placeholder.svg?height=200&width=300",
      title: "Bảo hiểm an ninh mạng",
      detailUrl: "/san-pham/bao-hiem-an-ninh-mang",
      buyUrl: "/mua-bao-hiem/bao-hiem-an-ninh-mang/ca-nhan",
    },
  ],
};

// Banner images for each category
const categoryBanners = {
  "bao-hiem-o-to-9": "/banner1.png?height=400&width=1920",
  "bao-hiem-xe-may-10": "/placeholder.svg?height=400&width=1920",
  "bao-hiem-suc-khoe-11": "/placeholder.svg?height=400&width=1920",
  "bao-hiem-du-lich-13": "/placeholder.svg?height=400&width=1920",
  "bao-hiem-tai-nan-12": "/placeholder.svg?height=400&width=1920",
  "bao-hiem-nha-tu-nhan-14": "/placeholder.svg?height=400&width=1920",
  "bao-hiem-an-ninh-mang-15": "/placeholder.svg?height=400&width=1920",
};

// Category titles
const categoryTitles = {
  "bao-hiem-o-to-9": "BẢO HIỂM Ô TÔ",
  "bao-hiem-xe-may-10": "BẢO HIỂM XE MÁY",
  "bao-hiem-suc-khoe-11": "BẢO HIỂM SỨC KHỎE",
  "bao-hiem-du-lich-13": "BẢO HIỂM DU LỊCH",
  "bao-hiem-tai-nan-12": "BẢO HIỂM TAI NẠN",
  "bao-hiem-nha-tu-nhan-14": "BẢO HIỂM NHÀ TƯ NHÂN",
  "bao-hiem-an-ninh-mang-15": "BẢO HIỂM AN NINH MẠNG",
};

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [categoryTitle, setCategoryTitle] = useState("Sản phẩm");
  const [bannerImage, setBannerImage] = useState(
    "/placeholder.svg?height=400&width=1920"
  );

  const params = useParams<{ category?: string }>();

  useEffect(() => {
    // Xử lý tham số URL
    let categorySlug = params.category
      ? params.category.replace(".html", "")
      : null;
    let isTaiNanSanPhamCon = false;
    // Nếu truy cập vào /san-pham/bao-hiem-tai-nan-24-24 hoặc các sản phẩm con của tai nạn
    if (
      window.location.pathname.includes("/san-pham/bao-hiem-tai-nan-24-24") ||
      window.location.pathname.includes(
        "/san-pham/bao-hiem-tai-nan-nguoi-su-dung-dien"
      ) ||
      window.location.pathname.includes("/san-pham/bao-hiem-tai-nan-mo-rong")
    ) {
      categorySlug = "bao-hiem-tai-nan-12";
      isTaiNanSanPhamCon = true;
    }
    if (categorySlug) {
      // Loại bỏ phần .html nếu có
      // const categorySlug = params.category.replace(".html", "");
      // Tìm danh mục phù hợp
      const foundCategory = categories.find((cat) => cat.id === categorySlug);
      if (foundCategory) {
        setActiveCategory(foundCategory.id);
        // Lấy sản phẩm theo danh mục
        const categoryProducts =
          productsByCategory[
            foundCategory.id as keyof typeof productsByCategory
          ] || [];
        setProducts(categoryProducts);
        // Cập nhật tiêu đề và banner
        setCategoryTitle(
          categoryTitles[foundCategory.id as keyof typeof categoryTitles] ||
            "Sản phẩm"
        );
        setBannerImage(
          categoryBanners[foundCategory.id as keyof typeof categoryBanners] ||
            "/placeholder.svg?height=400&width=1920"
        );
      } else {
        // Nếu không tìm thấy danh mục, hiển thị tất cả sản phẩm
        setActiveCategory(null);
        const allProducts = Object.values(productsByCategory).flat();
        setProducts(allProducts);
        setCategoryTitle("Sản phẩm");
        setBannerImage("/placeholder.svg?height=400&width=1920");
      }
    } else {
      // Nếu không có tham số, hiển thị tất cả sản phẩm
      setActiveCategory(null);
      const allProducts = Object.values(productsByCategory).flat();
      setProducts(allProducts);
      setCategoryTitle("Sản phẩm");
      setBannerImage("/placeholder.svg?height=400&width=1920");
    }
  }, [params.category]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-[81px]">
        {/* Banner */}
        <div className="relative w-full">
          <img
            src={bannerImage || "/placeholder.svg"}
            alt={categoryTitle}
            className="w-full h-auto"
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tiêu đề */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-600 relative inline-block">
              Sản phẩm
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-red-600"></div>
            </h2>
          </div>

          {/* Thay thế phần container chính với flex-col và flex-row */}
          <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
            {/* Sidebar - Danh mục sản phẩm với icon - Đã làm rộng hơn */}
            <div className="w-full md:w-1/3">
              <div className="overflow-hidden">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/danh-muc/${category.id}.html`}
                    className={`flex items-center py-5 px-6 border-b border-white hover:bg-gray-100 hover:text-red-600 ${
                      activeCategory === category.id
                        ? "bg-gray-100 text-red-600"
                        : "bg-red-600 text-white"
                    } transition-colors`}
                  >
                    <div className="w-8 h-8 mr-4 flex items-center justify-center">
                      <div
                        className={
                          activeCategory === category.id
                            ? "text-red-600"
                            : "text-white hover:text-red-600"
                        }
                      >
                        {category.icon}
                      </div>
                    </div>
                    <span className="font-medium text-base">
                      {category.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Main Content - Sản phẩm - Đã thêm màu nền xám nhạt và đảm bảo chiều cao lớn nhất */}
            <div className="w-full md:w-2/3 flex-grow">
              <div className="bg-gray-100 rounded-md p-8 h-full min-h-[600px] w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  {categoryTitle}
                </h3>

                {products.length > 0 ? (
                  <div className="space-y-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        image={product.image}
                        title={product.title}
                        detailUrl={product.detailUrl}
                        buyUrl={product.buyUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Không tìm thấy sản phẩm nào trong danh mục này.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <CustomerSupport />
        <Footer />
      </div>
    </main>
  );
}
