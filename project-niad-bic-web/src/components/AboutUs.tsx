export default function AboutUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cột bên trái */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold text-red-600 mb-8 text-left">
              Về chúng tôi
            </h2>

            <p className="text-gray-700 mb-8 leading-relaxed text-left">
              Mybic.vn là website bán hàng trực tuyến của Tổng công ty Bảo hiểm
              BIDV (BIC). Nhằm giúp khách hàng tiếp cận với các gói bảo hiểm cá
              nhân một cách dễ dàng, chúng tôi ưu tiên sự đơn giản, thuận tiện
              từ sản phẩm đến quy trình đặt mua và thanh toán. Các sản phẩm bảo
              hiểm cung cấp trên website hướng tới nhu cầu cá nhân, thời gian
              đặt hàng 24/7 để tiết kiệm thời gian, công sức cho khách hàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-start">
              <a
                href="/gioi-thieu"
                className="inline-block border border-red-600 text-red-600 px-8 py-3 text-center hover:bg-red-600 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/gioi-thieu";
                }}
              >
                XEM THÊM
              </a>

              <a
                href="/tro-thanh-dai-ly"
                className="inline-block bg-gray-600 text-white px-8 py-3 text-center hover:bg-red-600 transition-colors"
              >
                TRỞ THÀNH ĐẠI LÝ
              </a>
            </div>
          </div>

          {/* Cột bên phải */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-md shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-left">
                TẠI SAO CHỌN MYBIC?
              </h3>

              <div className="w-16 h-1 bg-gray-800 mb-8"></div>

              <div className="space-y-8 text-left">
                {/* Mục 1 */}
                <div>
                  <h4 className="text-red-600 font-medium mb-2 text-left">
                    <a href="/uu-diem/don-gian" className="underline">
                      Đơn giản, nhanh chóng, thuận tiện
                    </a>
                  </h4>
                  <p className="text-gray-700 text-left">
                    10 phút: Là thời gian để khách hàng nhận Giấy chứng nhận bảo
                    hiểm điện tử qua email sau khi thanh toán thành công
                  </p>
                </div>

                {/* Mục 2 */}
                <div>
                  <h4 className="text-red-600 font-medium mb-2 text-left">
                    <a href="/uu-diem/khuyen-mai" className="underline">
                      Khuyến mại hấp dẫn
                    </a>
                  </h4>
                  <p className="text-gray-700 text-left">
                    LÊN TỚI 50%: Là mức ưu đãi phí hàng năm BIC dành cho khách
                    hàng mua bảo hiểm online qua website trực tuyến
                  </p>
                </div>

                {/* Mục 3 */}
                <div>
                  <h4 className="text-red-600 font-medium mb-2 text-left">
                    <a href="/uu-diem/he-thong-doi-tac" className="underline">
                      Hệ thống đối tác liên kết toàn quốc
                    </a>
                  </h4>
                  <p className="text-gray-700 text-left">
                    &gt; 300: Là số lượng bệnh viện và gara sửa chữa liên kết
                    phục vụ bảo lãnh bồi thường cho khách hàng của BIC
                  </p>
                </div>

                {/* Mục 4 */}
                <div>
                  <h4 className="text-red-600 font-medium mb-2 text-left">
                    <a href="/uu-diem/mang-luoi" className="underline">
                      Mạng lưới rộng khắp
                    </a>
                  </h4>
                  <p className="text-gray-700 text-left">
                    150: Là số lượng phòng kinh doanh khu vực sẵn sàng phục vụ
                    khách hàng BIC trên toàn quốc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
