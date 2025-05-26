// Dữ liệu tin tức chung cho toàn ứng dụng
export interface NewsItem {
  id: string;
  image: string;
  thumbnail: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  link: string;
  featured: boolean;
}

export const newsData: NewsItem[] = [
  {
    id: "news1",
    image: "/lich-nghi-tet.png?height=400&width=800",
    thumbnail: "/lich-nghi-tet.png?height=80&width=110",
    title: "THÔNG BÁO LỊCH NGHỈ TẾT NGUYÊN ĐÁN QUÝ MÃO 2023",
    date: "January 18, 2023",
    category: "Tin tức BIC",
    excerpt:
      "Tổng Công ty Bảo hiểm BIDV (BIC) trân trọng thông báo lịch nghỉ Tết Nguyên đán Quý Mão 2023 như sau...",
    link: "/tin-tuc/thong-bao-lich-nghi-tet-nguyen-dan-2023",
    featured: true,
  },
  {
    id: "news2",
    image: "/BH-smart-care.png?height=400&width=800",
    thumbnail: "/BH-smart-care.png?height=80&width=110",
    title:
      "BIC RA MẮT BẢO HIỂM SỨC KHỎE BIC SMART CARE DÀNH CHO KHÁCH HÀNG CAO CẤP CỦA BIDV",
    date: "July 19, 2023",
    category: "Tin tức BIC",
    excerpt:
      "Tổng Công ty Bảo hiểm BIDV (BIC) chính thức ra mắt sản phẩm bảo hiểm sức khỏe BIC Smart Care dành riêng cho khách hàng cao cấp của BIDV...",
    link: "/tin-tuc/bic-ra-mat-bao-hiem-suc-khoe-smart-care",
    featured: false,
  },
  {
    id: "news3",
    image:
      "/Thong-bao-dieu-chinh-thoi-gian-thuc-hien-bao-lanh-vien-phi.png?height=400&width=800",
    thumbnail:
      "/Thong-bao-dieu-chinh-thoi-gian-thuc-hien-bao-lanh-vien-phi.png?height=80&width=110",
    title: "THÔNG BÁO ĐIỀU CHỈNH THỜI GIAN THỰC HIỆN BẢO LÃNH VIỆN PHÍ",
    date: "October 05, 2023",
    category: "Tin tức BIC",
    excerpt:
      "Thông báo về việc điều chỉnh thời gian thực hiện bảo lãnh viện phí đối với các hợp đồng bảo hiểm sức khỏe...",
    link: "/tin-tuc/thong-bao-dieu-chinh-thoi-gian-bao-lanh-vien-phi",
    featured: false,
  },
  {
    id: "news4",
    image: "/Ngay-Vang-83.png?height=400&width=800",
    thumbnail: "/Ngay-Vang-83.png?height=80&width=110",
    title: "BIC TẶNG QUÀ HẤP DẪN MỪNG NGÀY PHỤ NỮ VIỆT NAM",
    date: "October 11, 2023",
    category: "Khuyến mại",
    excerpt:
      "Chào mừng ngày Phụ nữ Việt Nam 20/10, từ ngày 11/10/2023 đến ngày 31/10/2023, Tổng Công ty Bảo hiểm BIDV (BIC) gửi tặng khách hàng nữ...",
    link: "/tin-tuc/bic-tang-qua-phu-nu-viet-nam",
    featured: false,
  },
  {
    id: "news5",
    image: "/sieu-hoi-99.png?height=400&width=800",
    thumbnail: "/sieu-hoi-99.png?height=80&width=110",
    title: "SIÊU HỘI NGÀY ĐÔI 9.9: BIC ƯU ĐÃI TỚI 40% PHÍ BẢO HIỂM",
    date: "September 09, 2023",
    category: "Khuyến mại",
    excerpt:
      "Ngày 09/09/2023, Tổng Công ty Bảo hiểm BIDV (BIC) gửi tặng khách hàng chương trình khuyến mại 'Ngày vàng siêu ưu đãi'...",
    link: "/tin-tuc/sieu-hoi-ngay-doi",
    featured: false,
  },
  {
    id: "news6",
    image: "/bic-giam-15-phi-bao-hiem-xe-may.png?height=400&width=800",
    thumbnail: "/bic-giam-15-phi-bao-hiem-xe-may.png?height=80&width=110",
    title: "BIC GIẢM 15% PHÍ BẢO HIỂM XE MÁY",
    date: "August 01, 2023",
    category: "Tin tức BIC",
    excerpt:
      "Từ ngày 01/08/2023, BIC chính thức triển khai chương trình bảo hiểm xe máy mới với nhiều quyền lợi hấp dẫn cho khách hàng...",
    link: "/tin-tuc/bao-hiem-xe-may-moi",
    featured: false,
  },
  {
    id: "news7",
    image: "/bic-top10.png?height=400&width=800",
    thumbnail: "/bic-top10.png?height=80&width=110",
    title: "BIC ĐƯỢC VINH DANH TOP 10 DOANH NGHIỆP BẢO HIỂM UY TÍN",
    date: "July 15, 2023",
    category: "Tin tức BIC",
    excerpt:
      "Ngày 15/07/2023, BIC vinh dự được trao tặng danh hiệu Top 10 Doanh nghiệp Bảo hiểm uy tín năm 2023 do Công ty CP Báo cáo Đánh giá VN tổ chức...",
    link: "/tin-tuc/top-10-doanh-nghiep-bao-hiem",
    featured: false,
  },
];
