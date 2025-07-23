import Navbar from "../components/Navbar";
import CustomerSupport from "../components/CustomerSupport";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* Banner */}
      <div className="w-full h-screen">
        <img
          src="/banner-3.png"
          alt="Banner Giới thiệu"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="pt-[81px]">
        {/* Phần nội dung chính của trang Giới thiệu */}
        <section className="py-6 bg-white">
          <div className="flex flex-col">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="w-20 h-1 bg-black mb-1"></div>
              <h1 className="text-5xl font-bold text-red-600 text-left">
                Giới thiệu
              </h1>
            </div>
          </div>
          <div className="mx-[90px] px-[15px] pt-[40px]">
            <div className="flex justify-center mb-3">
              <img src="/bic-logo.png" alt="BIC Logo" className="h-28" />
            </div>

            <div className="prose max-w-none text-gray-700 space-y-3 text-left">
              <p className="mb-4 text-[20px]">
                <strong className="text-red-600">BIC</strong> là website bán
                trực tuyến các sản phẩm bảo hiểm của Tổng công ty Bảo hiểm BIDV
                (BIC). Sản phẩm bán trên website hướng tới các nhu cầu cá nhân,
                sẵn sàng phục vụ 24/7 để tiết kiệm thời gian, công sức cho Quý
                khách.
              </p>

              <h2 className="text-xl font-bold text-red-600 mt-6 mb-4 text-left">
                LỢI ÍCH KHI MUA BẢO HIỂM QUA WEBSITE?
              </h2>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  1. Giúp quý khách tiết kiệm thời gian và công sức:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Quý khách vừa mua một chiếc ô tô mới, Quý khách đang chuẩn bị
                  xin visa đi du lịch nước ngoài cần mua bảo hiểm du lịch, hay
                  Quý khách đang tìm kiếm một chương trình bảo hiểm sức khỏe phù
                  hợp cho con. Chỉ với một vài thao tác đơn giản trên website,
                  Quý khách có thể tìm hiểu thông tin về điều khoản điều kiện
                  bảo hiểm, tính phí và đặt mua, trong vòng 24h quý khách đã
                  được BIC giao giấy chứng nhận bảo hiểm tận tay. Với các trường
                  hợp đơn giản không cần bảo hiểm BIC có thể gửi giấy chứng nhận
                  bảo hiểm điện tử cho Quý khách ngay lập tức sau khi quý khách
                  thanh toán phí bảo hiểm.
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  2. Tôn trọng sự riêng tư và quyền tự do lựa chọn của Quý
                  khách:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Với BIC tính riêng tư và quyền tự do lựa chọn của quý khách
                  được bảo đảm ở mức cao nhất. Quý khách không cần phải nhận
                  những cuộc gọi chào mời không mong muốn, những cuộc hẹn gặp để
                  trao đổi về hợp đồng bảo hiểm. Quý khách chỉ đơn giản truy cập
                  website, tìm hiểu các thông tin về sản phẩm bảo hiểm, lựa chọn
                  chương trình bảo hiểm có mức phí phù hợp với mình. Quyết định
                  mua sắm hoàn toàn do khách hàng thực hiện.
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  3. Giúp quý khách tiết kiệm chi phí:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Với phương thức bán hàng trực tiếp trên website bộ phận được
                  thiết kế tinh gọn bán hàng, BIC đã giảm đáng kể chi phí bán
                  hàng so với mức phí bảo hiểm cạnh tranh so với các kênh bán
                  hàng truyền thống khác.
                </p>
              </div>

              <h2 className="text-xl font-bold text-red-600 mt-6 mb-4 text-left">
                KHẢ NĂNG CUNG CẤP DỊCH VỤ BẢO HIỂM CỦA BIC THẾ NÀO?
              </h2>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  1. Năng lực cung cấp các dịch vụ tài chính của hệ thống BIDV:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Là thành viên của Ngân hàng TMCP Đầu tư và Phát triển (BIDV)
                  với hơn 50 năm cung cấp các dịch vụ tài chính trong và ngoài
                  nước, BIC đã kế thừa và phát triển toàn bộ thế mạnh, ưu điểm
                  của hệ thống BIDV. Với hơn 13 năm xây dựng và phát triển, Tổng
                  Công ty Bảo hiểm BIDV đã xây dựng được hệ thống quản trị vững
                  chắc, khả năng nhận định và cung cấp dịch vụ bảo hiểm có chất
                  lượng tại khách hàng.
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  2. Khả năng cung cấp dịch vụ nhanh chóng với mạng lưới trên
                  toàn quốc:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Hiện Tổng Công ty Bảo hiểm BIDV hoạt động theo mô hình Tổng
                  công ty với 21 Công ty thành viên và hơn 100 Phòng kinh doanh
                  có mặt trên toàn quốc. Hệ thống của BIC có khả năng cung cấp
                  dịch vụ bảo hiểm cho khách hàng theo đúng các cam kết của
                  website bán bảo hiểm trực tuyến.
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold mb-1 text-[20px] text-left">
                  3. Cam kết về chất lượng dịch vụ bồi thường:
                </p>
                <p className="mb-4 text-[20px] text-left">
                  Với phương châm{" "}
                  <span className="italic">
                    "Đơn giản, nhanh chóng, tinh hoạt"
                  </span>
                  , BIC cam kết cung cấp cho Quý khách dịch vụ bảo hiểm có chất
                  lượng cao nhất.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phần Liên hệ */}
        <Contact />

        {/* Phần Hỗ trợ khách hàng */}
        <CustomerSupport />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
