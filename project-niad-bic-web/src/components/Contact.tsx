import type React from "react";
import { Phone, MapPin, Mail } from "lucide-react";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  extraInfo?: string;
  linkText?: string;
  linkUrl?: string;
}

const ContactCard = ({
  icon,
  title,
  description,
  extraInfo,
  linkText,
  linkUrl,
}: ContactCardProps) => {
  return (
    <div className="bg-gray-50 p-8 flex flex-col items-center text-center">
      <div className="text-red-600 mb-4">{icon}</div>
      <div className="font-medium text-gray-800 mb-2">{title}</div>
      <p className="text-gray-600 mb-2">{description}</p>
      {extraInfo && <p className="text-gray-600 text-sm mb-2">{extraInfo}</p>}
      {linkText && linkUrl && (
        <a
          href={linkUrl}
          className="text-black hover:underline text-sm font-bold"
        >
          {linkText}
        </a>
      )}
    </div>
  );
};

export default function Contact() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tiêu đề */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-0.5 bg-gray-400 mb-4"></div>
          <h2 className="text-3xl font-bold text-red-600">
            Liên hệ ngay với chúng tôi
          </h2>
        </div>

        {/* Thông tin liên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContactCard
            icon={<Phone className="w-10 h-10" />}
            title="19009456 - 0916186611"
            description="Hỗ trợ trực tuyến 24/7"
            linkText="Liên hệ"
            linkUrl="/lien-he"
          />

          <ContactCard
            icon={<MapPin className="w-10 h-10" />}
            title="TẦNG 11, TÒA NHÀ SỐ 263 CẦU GIẤY"
            description="Thứ 2 - Thứ 6: 8:00 - 17:00"
            extraInfo="Nghỉ Thứ 7 & Chủ nhật"
          />

          <ContactCard
            icon={<Mail className="w-10 h-10" />}
            title="EBUSINESS.BIC@BIDV.COM.VN"
            description="Hỗ trợ thông tin 24/7"
            linkText="Gửi mail"
            linkUrl="mailto:EBUSINESS.BIC@BIDV.COM.VN"
          />
        </div>
      </div>
    </section>
  );
}
