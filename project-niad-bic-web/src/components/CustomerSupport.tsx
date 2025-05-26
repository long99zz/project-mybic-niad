import type React from "react";
import { Car, Building2, Phone, FileSearch, CircleHelp } from "lucide-react";

interface SupportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive?: boolean;
  href: string;
}

const SupportCard = ({
  icon,
  title,
  description,
  isActive = false,
  href,
}: SupportCardProps) => {
  return (
    <a
      href={href}
      className={`bg-white p-6 flex flex-col items-center text-center relative transition-all group ${
        isActive ? "shadow-sm" : ""
      }`}
      style={{ height: "280px", width: "100%" }}
    >
      <div className="text-red-600 mb-4 h-16 flex items-center justify-center">
        {icon}
      </div>

      <h3 className="font-medium text-gray-700 mb-2">{title}</h3>

      <p className="text-sm text-gray-600 mb-4 px-2">{description}</p>

      <div className="text-gray-400 mt-auto mb-2">
        <span className="text-[40px]">&rsaquo;</span>
      </div>

      {/* Vạch đỏ khi hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </a>
  );
};

export default function CustomerSupport() {
  const supportItems = [
    {
      id: "garage",
      icon: <Car className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Mạng lưới Gara",
      description:
        "Hệ thống, danh sách các Garage sửa chữa xe có liên kết với BIC trên khắp cả nước.",
      href: "/ho-tro/mang-luoi-gara",
      isActive: false,
    },
    {
      id: "hospital",
      icon: <Building2 className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Mạng lưới bệnh viện liên kết",
      description:
        "Hệ thống, danh sách các bệnh viện có liên kết với BIC trên khắp cả nước.",
      href: "/ho-tro/mang-luoi-benh-vien",
      isActive: true,
    },
    {
      id: "nationwide",
      icon: <Phone className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Mạng lưới toàn quốc",
      description:
        "Phòng kinh doanh khu vực sẵn sàng phục vụ khách hàng BIC trên toàn quốc",
      href: "/ho-tro/mang-luoi-toan-quoc",
      isActive: false,
    },
    {
      id: "faq",
      icon: <CircleHelp className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Các câu hỏi thường gặp",
      description: "Giải đáp các thắc mắc của khách hàng về sản phẩm & dịch vụ",
      href: "/ho-tro/cau-hoi-thuong-gap",
      isActive: false,
    },
    {
      id: "claims",
      icon: <CircleHelp className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Yêu cầu / Truy vấn bồi thường online",
      description:
        "Hỗ trợ Khách hàng tra cứu thông tin/theo dõi tình trạng hồ sơ bồi thường 24/7",
      href: "/ho-tro/truy-van-boi-thuong",
      isActive: false,
    },
    {
      id: "certificate",
      icon: <FileSearch className="w-14 h-14 stroke-[1.5] text-red-600" />,
      title: "Tra cứu Giấy chứng nhận bảo hiểm",
      description:
        "Hỗ trợ khách hàng tra cứu thông tin Giấy chứng nhận bảo hiểm đã tham gia tại BIC",
      href: "/ho-tro/tra-cuu-giay-chung-nhan",
      isActive: false,
    },
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-red-600 text-3xl font-bold mb-4">
          Hỗ trợ khách hàng
        </h2>

        <div className="flex justify-center mb-12">
          <div className="w-32 h-1 bg-red-600"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {supportItems.map((item) => (
            <SupportCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              isActive={item.isActive}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
