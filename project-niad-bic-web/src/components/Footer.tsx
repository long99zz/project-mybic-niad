import { Facebook, Twitter, Youtube, ChevronRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="bg-red-600 text-white py-12 relative overflow-hidden">
        {/* Nền hình học */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Các đường kết nối và điểm sẽ được tạo bằng background */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='white' strokeWidth='0.5' opacity='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23smallGrid)' /%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Cột trái - Thông tin công ty */}
            <div className="text-left">
              <div className="mb-6">
                <a href="/">
                  <img
                    src="/Footer-Logo.png"
                    alt="BIC Logo"
                    className="h-21 mb-1"
                  />
                </a>
              </div>

              <h3 className="font-bold text-lg mb-4 uppercase leading-tight text-left">
                TỔNG CÔNG TY CỔ PHẦN BẢO HIỂM NGÂN HÀNG ĐẦU TƯ VÀ PHÁT TRIỂN
                VIỆT NAM (BIC)
              </h3>

              <div className="space-y-1 text-sm mb-6 text-left">
                <p>
                  ĐC: Tầng 11, tòa nhà số 263 đường Cầu Giấy, phường Dịch Vọng,
                  quận Cầu Giấy, thành phố Hà Nội.
                </p>

                <p>ĐT: 024 22200282 | Fax: 024 22200281 | Hotline: 1900 9456</p>
                <p>Website: bic.vn | mybic.vn</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-10 text-left">
                <a href="/dieu-khoan-hop-dong" className="hover:underline">
                  Điều khoản hợp đồng
                </a>
                <a href="/dieu-khoan-su-dung" className="hover:underline">
                  Điều khoản sử dụng
                </a>
                <a href="/dieu-khoan-thanh-toan" className="hover:underline">
                  Điều khoản thanh toán
                </a>
                <a href="/bao-mat-quyen-rieng-tu" className="hover:underline">
                  Bảo mật & quyền riêng tư
                </a>
              </div>
            </div>

            {/* Cột phải - Đăng ký và thanh toán */}
            <div className="flex flex-col justify-between pt-8 md:pt-10">
              <div className="flex items-start justify-between">
                <div className="w-2/3 text-left">
                  <h3 className="font-bold text-lg mb-4 text-left">
                    ĐĂNG KÝ NHẬN BẢN TIN BIC
                  </h3>
                  <p className="text-sm mb-4 text-left">
                    Đăng ký nhận thông tin khuyến mại, sản phẩm mới từ bảo hiểm
                    Bic
                  </p>

                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Email"
                      className="px-4 py-2 text-gray-800 w-full"
                    />
                    <button className="bg-gray-200 text-red-600 px-3 flex items-center">
                      Gửi <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <a
                      href="https://facebook.com"
                      className="bg-white rounded-full p-1"
                    >
                      <Facebook className="w-6 h-6 text-red-600" />
                    </a>
                    <a
                      href="https://twitter.com"
                      className="bg-white rounded-full p-1"
                    >
                      <Twitter className="w-6 h-6 text-red-600" />
                    </a>
                    <a
                      href="https://youtube.com"
                      className="bg-white rounded-full p-1"
                    >
                      <Youtube className="w-6 h-6 text-red-600" />
                    </a>
                  </div>
                </div>

                <div className="w-1/3 flex justify-end">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-red-600 transform rotate-45 text-xl font-bold">
                        ✓
                      </div>
                    </div>
                    <div
                      className="absolute inset-[-5px] border-2 border-white/30 rounded-full"
                      style={{ clipPath: "circle(50% at 50% 50%)" }}
                    ></div>
                    <div
                      className="absolute inset-[-10px] border border-white/20 rounded-full animate-spin"
                      style={{
                        animationDuration: "20s",
                        clipPath: "circle(50% at 50% 50%)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <img
                      src="/mastercard-logo.png"
                      alt="Mastercard"
                      className="h-10 w-auto"
                    />
                    <img
                      src="/visa-logo.png"
                      alt="Visa"
                      className="h-10 w-auto"
                    />
                  </div>
                  <p className="text-sm text-left">
                    Chấp nhận thanh toán Master Card, Visa Card
                    <br />
                    và các thẻ ATM nội địa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-4 text-center px-4 max-w-6xl mx-auto text-gray-600 text-sm">
        Copyright © 2021 BIC
      </div>
    </footer>
  );
}
