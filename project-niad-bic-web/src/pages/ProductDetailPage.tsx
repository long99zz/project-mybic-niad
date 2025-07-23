"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";
import CustomerSupport from "../components/CustomerSupport";
import Contact from "../components/Contact";

// Dữ liệu chi tiết sản phẩm
const productDetails = {
  "bao-hiem-trach-nhiem-dan-su-chu-xe-o-to": {
    id: "bao-hiem-trach-nhiem-dan-su-chu-xe-o-to",
    title: "Bảo hiểm trách nhiệm dân sự chủ xe ô tô",
    subtitle: "TNDS Ô tô",
    description:
      "Bảo hiểm trách nhiệm dân sự (TNDS) của chủ xe ô tô là loại bảo hiểm bắt buộc theo quy định của pháp luật. Sản phẩm này bảo vệ quyền lợi của chủ xe trước những thiệt hại về người và tài sản đối với bên thứ ba do xe gây ra.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 436.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-o-to/tnds-bat-buoc",
    category: "bao-hiem-o-to-9",
    categoryName: "Bảo hiểm ô tô",
    doiTuongBaoHiem:
      "Chủ xe cơ giới tham gia giao thông trên lãnh thổ Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
    phamViBaoHiem:
      "BIC thay mặt cho chủ xe bồi thường cho các tổn thất về người và tài sản cho bên thứ ba (bên bị thiệt hại do xe của chủ xe gây ra).",
    quyenLoiBaoHiem: [
      "Bồi thường thiệt hại về thân thể, tính mạng và tài sản đối với bên thứ ba do xe gây ra",
      "Bồi thường thiệt hại về thân thể và tính mạng của hành khách theo quy định",
      "Thủ tục đơn giản, giải quyết bồi thường nhanh chóng",
      "Mạng lưới bảo lãnh rộng khắp trên toàn quốc",
    ],
    bieuPhiBaoHiem:
      "Biểu phí bảo hiểm TNDS bắt buộc được quy định theo Thông tư của Bộ Tài chính.",
    huongDanBoiThuong:
      "Khi xảy ra tai nạn, chủ xe cần thông báo ngay cho BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm TNDS bắt buộc được ban hành theo Thông tư của Bộ Tài chính.",
  },
  "bao-hiem-vat-chat-o-to": {
    id: "bao-hiem-vat-chat-o-to",
    title: "Bảo hiểm vật chất ô tô",
    subtitle: "Bảo vệ toàn diện cho xe của bạn",
    description:
      "Bảo hiểm vật chất ô tô bảo vệ xe của bạn trước các rủi ro như va chạm, cháy nổ, thiên tai, mất cắp và các rủi ro khác. Đây là sự bổ sung hoàn hảo cho bảo hiểm TNDS bắt buộc.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 1.200.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-o-to/vat-chat-xe",
    category: "bao-hiem-o-to-9",
    categoryName: "Bảo hiểm ô tô",
    doiTuongBaoHiem:
      "Chủ sở hữu xe ô tô hoặc người được ủy quyền sử dụng xe ô tô hợp pháp.",
    phamViBaoHiem:
      "Bảo hiểm cho các thiệt hại vật chất xe do va chạm, cháy nổ, thiên tai, mất cắp và các rủi ro khác theo quy định trong hợp đồng bảo hiểm.",
    quyenLoiBaoHiem: [
      "Bảo hiểm cho các thiệt hại vật chất do va chạm, cháy nổ",
      "Bảo hiểm cho thiệt hại do thiên tai, lũ lụt, bão",
      "Bảo hiểm mất cắp toàn bộ xe",
      "Dịch vụ cứu hộ 24/7 trên toàn quốc",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm vật chất xe được tính dựa trên giá trị xe, năm sản xuất, mục đích sử dụng và các yếu tố khác.",
    huongDanBoiThuong:
      "Khi xảy ra sự cố, chủ xe cần thông báo ngay cho BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm vật chất xe ô tô được ban hành theo quy định của BIC.",
  },
  "bao-hiem-tnds-xe-may": {
    id: "bao-hiem-tnds-xe-may",
    title: "Bảo hiểm TNDS bắt buộc xe máy",
    subtitle: "TNDS xe máy",
    description:
      "Bảo hiểm trách nhiệm dân sự (TNDS) của chủ xe máy là loại bảo hiểm bắt buộc theo quy định của pháp luật. Sản phẩm này bảo vệ quyền lợi của chủ xe trước những thiệt hại về người và tài sản đối với bên thứ ba do xe gây ra.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 60.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-xe-may/tnds-bat-buoc",
    category: "bao-hiem-xe-may-10",
    categoryName: "Bảo hiểm xe máy",
    doiTuongBaoHiem:
      "Chủ xe máy tham gia giao thông trên lãnh thổ Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
    phamViBaoHiem:
      "BIC thay mặt cho chủ xe bồi thường cho các tổn thất về người và tài sản cho bên thứ ba (bên bị thiệt hại do xe của chủ xe gây ra).",
    quyenLoiBaoHiem: [
      "Bồi thường thiệt hại về thân thể, tính mạng và tài sản đối với bên thứ ba do xe gây ra",
      "Bồi thường thiệt hại về thân thể và tính mạng của người ngồi trên xe theo quy định",
      "Thủ tục đơn giản, giải quyết bồi thường nhanh chóng",
    ],
    bieuPhiBaoHiem:
      "Biểu phí bảo hiểm TNDS bắt buộc xe máy được quy định theo Thông tư của Bộ Tài chính.",
    huongDanBoiThuong:
      "Khi xảy ra tai nạn, chủ xe cần thông báo ngay cho BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm TNDS bắt buộc xe máy được ban hành theo Thông tư của Bộ Tài chính.",
  },
  "bao-hiem-suc-khoe-tam-an": {
    id: "bao-hiem-suc-khoe-tam-an",
    title: "Bảo hiểm sức khỏe và tai nạn cá nhân BIC Tâm An",
    subtitle: "BIC Tâm An",
    description:
      "Bảo hiểm sức khỏe và tai nạn cá nhân BIC Tâm An mang đến sự bảo vệ toàn diện cho sức khỏe và tính mạng của bạn và gia đình. Với nhiều lựa chọn phù hợp với nhu cầu và ngân sách khác nhau.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 300.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-suc-khoe/bic-tam-an",
    category: "bao-hiem-suc-khoe-11",
    categoryName: "Bảo hiểm sức khỏe",
    doiTuongBaoHiem:
      "Công dân Việt Nam và người nước ngoài đang sinh sống và làm việc tại Việt Nam, từ 15 đến 65 tuổi.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro tai nạn, ốm đau, bệnh tật theo chương trình bảo hiểm được lựa chọn.",
    quyenLoiBaoHiem: [
      "Bảo hiểm tai nạn cá nhân 24/7",
      "Chi trả chi phí y tế do ốm đau, bệnh tật",
      "Trợ cấp nằm viện và phẫu thuật",
      "Nhiều gói bảo hiểm linh hoạt phù hợp với mọi nhu cầu",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm được tính dựa trên độ tuổi, giới tính, và gói bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có sự cố tai nạn hoặc ốm đau, người được bảo hiểm cần thông báo cho BIC và cung cấp các giấy tờ y tế cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm sức khỏe và tai nạn cá nhân BIC Tâm An được ban hành theo quy định của BIC.",
  },
  "bao-hiem-benh-ung-thu-phuc-tam-an": {
    id: "bao-hiem-benh-ung-thu-phuc-tam-an",
    title: "Bảo hiểm bệnh ung thư BIC Phúc Tâm An",
    subtitle: "BIC Phúc Tâm An",
    description:
      "Bảo hiểm bệnh ung thư BIC Phúc Tâm An cung cấp sự bảo vệ tài chính trước nguy cơ mắc bệnh ung thư. Sản phẩm này giúp giảm gánh nặng tài chính khi không may mắc bệnh hiểm nghèo.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 200.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-suc-khoe/bic-phuc-tam-an",
    category: "bao-hiem-suc-khoe-11",
    categoryName: "Bảo hiểm sức khỏe",
    doiTuongBaoHiem:
      "Công dân Việt Nam từ 18 đến 60 tuổi, có thể mở rộng đến 65 tuổi tùy điều kiện sức khỏe.",
    phamViBaoHiem:
      "Bảo hiểm cho các bệnh ung thư được chẩn đoán trong thời hạn bảo hiểm.",
    quyenLoiBaoHiem: [
      "Chi trả quyền lợi bảo hiểm khi được chẩn đoán mắc bệnh ung thư",
      "Hỗ trợ tài chính cho việc điều trị và phục hồi",
      "Không cần thẩm định sức khỏe ban đầu (tùy gói bảo hiểm)",
      "Chi phí hợp lý và quy trình bồi thường đơn giản",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên độ tuổi, giới tính và số tiền bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi được chẩn đoán mắc bệnh ung thư, người được bảo hiểm cần thông báo cho BIC và cung cấp các giấy tờ y tế cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm bệnh ung thư BIC Phúc Tâm An được ban hành theo quy định của BIC.",
  },
  "bao-hiem-du-lich-quoc-te": {
    id: "bao-hiem-du-lich-quoc-te",
    title: "Bảo hiểm du lịch quốc tế (ITI)",
    subtitle: "ITI",
    description:
      "Bảo hiểm du lịch quốc tế (ITI) cung cấp sự bảo vệ toàn diện cho bạn khi đi du lịch nước ngoài. Sản phẩm này bảo vệ bạn trước các rủi ro như tai nạn, ốm đau, mất hành lý, và nhiều rủi ro khác trong chuyến đi.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 150.000đ/chuyến đi",
    buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/quoc-te",
    category: "bao-hiem-du-lich-13",
    categoryName: "Bảo hiểm du lịch",
    doiTuongBaoHiem:
      "Công dân Việt Nam và người nước ngoài đang cư trú tại Việt Nam đi du lịch, công tác, học tập ở nước ngoài.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro xảy ra trong chuyến đi du lịch nước ngoài như tai nạn, ốm đau, mất hành lý, chậm chuyến bay và các rủi ro khác.",
    quyenLoiBaoHiem: [
      "Chi trả chi phí y tế do tai nạn, ốm đau trong chuyến đi",
      "Bồi thường trong trường hợp tử vong hoặc thương tật vĩnh viễn do tai nạn",
      "Bồi thường mất hoặc hư hỏng hành lý, giấy tờ tùy thân",
      "Hỗ trợ chi phí do chậm chuyến, hủy chuyến",
      "Dịch vụ hỗ trợ y tế và du lịch khẩn cấp 24/7",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên thời gian chuyến đi, vùng lãnh thổ và gói bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có sự cố xảy ra trong chuyến đi, người được bảo hiểm cần liên hệ ngay với đường dây hỗ trợ khẩn cấp của BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm du lịch quốc tế được ban hành theo quy định của BIC.",
  },
  "bao-hiem-du-lich-trong-nuoc": {
    id: "bao-hiem-du-lich-trong-nuoc",
    title: "Bảo hiểm du lịch trong nước (TRV)",
    subtitle: "TRV",
    description:
      "Bảo hiểm du lịch trong nước (TRV) cung cấp sự bảo vệ cho bạn khi đi du lịch trong lãnh thổ Việt Nam. Sản phẩm này bảo vệ bạn trước các rủi ro như tai nạn, ốm đau và các rủi ro khác trong chuyến đi.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 30.000đ/chuyến đi",
    buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/trong-nuoc",
    category: "bao-hiem-du-lich-13",
    categoryName: "Bảo hiểm du lịch",
    doiTuongBaoHiem:
      "Công dân Việt Nam và người nước ngoài đi du lịch trong lãnh thổ Việt Nam.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro xảy ra trong chuyến đi du lịch trong nước như tai nạn, ốm đau đột xuất và các rủi ro khác.",
    quyenLoiBaoHiem: [
      "Chi trả chi phí y tế do tai nạn, ốm đau trong chuyến đi",
      "Bồi thường trong trường hợp tử vong hoặc thương tật vĩnh viễn do tai nạn",
      "Hỗ trợ chi phí do hủy chuyến, gián đoạn chuyến đi",
      "Dịch vụ hỗ trợ y tế và du lịch khẩn cấp 24/7",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên thời gian chuyến đi và gói bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có sự cố xảy ra trong chuyến đi, người được bảo hiểm cần liên hệ ngay với BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm du lịch trong nước được ban hành theo quy định của BIC.",
  },
  "bao-hiem-tai-nan-khach-du-lich": {
    id: "bao-hiem-tai-nan-khach-du-lich",
    title: "BIC TRAVEL CARE - Bảo hiểm tai nạn khách du lịch (TVC)",
    subtitle: "BIC TRAVEL CARE",
    description:
      "Bảo hiểm tai nạn khách du lịch (TVC) cung cấp sự bảo vệ đặc biệt cho khách du lịch trước các rủi ro tai nạn trong chuyến đi. Sản phẩm này phù hợp cho cả chuyến đi trong nước và quốc tế.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 20.000đ/chuyến đi",
    buyUrl: "/mua-bao-hiem/bao-hiem-du-lich/tai-nan-khach-du-lich",
    category: "bao-hiem-du-lich-13",
    categoryName: "Bảo hiểm du lịch",
    doiTuongBaoHiem:
      "Khách du lịch tham gia các chuyến đi do công ty du lịch tổ chức.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro tai nạn xảy ra trong suốt hành trình du lịch từ điểm khởi hành đến điểm kết thúc của chuyến đi.",
    quyenLoiBaoHiem: [
      "Bồi thường trong trường hợp tử vong hoặc thương tật vĩnh viễn do tai nạn",
      "Chi trả chi phí y tế do tai nạn trong chuyến đi",
      "Hỗ trợ chi phí vận chuyển y tế khẩn cấp",
      "Đơn giản trong thủ tục tham gia và bồi thường",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên thời gian chuyến đi và số tiền bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có tai nạn xảy ra trong chuyến đi, người được bảo hiểm hoặc người thân cần liên hệ ngay với công ty du lịch và BIC, đồng thời cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm tai nạn khách du lịch được ban hành theo quy định của BIC.",
  },
  "bao-hiem-tai-nan-24-24": {
    id: "bao-hiem-tai-nan-24-24",
    title: "Bảo hiểm tai nạn 24/24",
    subtitle: "Bảo vệ 24/24",
    description:
      "Bảo hiểm tai nạn 24/24 cung cấp sự bảo vệ toàn diện trước các rủi ro tai nạn có thể xảy ra bất cứ lúc nào, bất cứ nơi đâu, 24 giờ một ngày và 7 ngày một tuần.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 100.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-tai-nan/24-24",
    category: "bao-hiem-tai-nan-12",
    categoryName: "Bảo hiểm tai nạn",
    doiTuongBaoHiem:
      "Công dân Việt Nam và người nước ngoài đang cư trú hợp pháp tại Việt Nam từ 15 đến 65 tuổi.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro tai nạn xảy ra bất cứ lúc nào, bất cứ nơi đâu trên toàn thế giới, 24/7.",
    quyenLoiBaoHiem: [
      "Bồi thường trong trường hợp tử vong hoặc thương tật vĩnh viễn do tai nạn",
      "Chi trả chi phí y tế do tai nạn",
      "Trợ cấp thu nhập trong thời gian điều trị thương tật tạm thời",
      "Quy trình bồi thường đơn giản, nhanh chóng",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên số tiền bảo hiểm, độ tuổi và nghề nghiệp của người được bảo hiểm.",
    huongDanBoiThuong:
      "Khi có tai nạn xảy ra, người được bảo hiểm hoặc người thân cần thông báo ngay cho BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm tai nạn 24/24 được ban hành theo quy định của BIC.",
  },
  "bao-hiem-toan-dien-nha-tu-nhan": {
    id: "bao-hiem-toan-dien-nha-tu-nhan",
    title: "Bảo hiểm toàn diện nhà tư nhân",
    subtitle: "Bảo vệ tổ ấm của bạn",
    description:
      "Bảo hiểm toàn diện nhà tư nhân bảo vệ ngôi nhà và tài sản của bạn trước các rủi ro như cháy nổ, thiên tai, trộm cắp và các rủi ro khác. Đây là giải pháp bảo vệ toàn diện cho tổ ấm của bạn.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 300.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-nha-tu-nhan/toan-dien",
    category: "bao-hiem-nha-tu-nhan-14",
    categoryName: "Bảo hiểm nhà tư nhân",
    doiTuongBaoHiem:
      "Chủ sở hữu nhà hoặc người đang sử dụng, quản lý nhà hợp pháp.",
    phamViBaoHiem:
      "Bảo hiểm cho các thiệt hại đối với nhà và tài sản bên trong do cháy nổ, thiên tai, trộm cắp và các rủi ro khác.",
    quyenLoiBaoHiem: [
      "Bồi thường thiệt hại đối với công trình kiến trúc nhà",
      "Bồi thường thiệt hại đối với tài sản bên trong nhà",
      "Bảo hiểm trách nhiệm dân sự với bên thứ ba",
      "Chi phí thuê nhà tạm thời khi nhà bị hư hỏng nặng",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên giá trị nhà, tài sản bên trong và phạm vi bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có thiệt hại xảy ra, chủ nhà cần thông báo ngay cho BIC và cung cấp các giấy tờ cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm toàn diện nhà tư nhân được ban hành theo quy định của BIC.",
  },
  "bao-hiem-an-ninh-mang": {
    id: "bao-hiem-an-ninh-mang",
    title: "Bảo hiểm an ninh mạng",
    subtitle: "An toàn trong thời đại số",
    description:
      "Bảo hiểm an ninh mạng bảo vệ bạn trước các rủi ro trong thời đại số như mất cắp dữ liệu cá nhân, lừa đảo trực tuyến, tấn công mạng và các rủi ro khác liên quan đến hoạt động trên không gian mạng.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 500.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-an-ninh-mang/ca-nhan",
    category: "bao-hiem-an-ninh-mang-15",
    categoryName: "Bảo hiểm an ninh mạng",
    doiTuongBaoHiem:
      "Cá nhân và doanh nghiệp có hoạt động trên không gian mạng.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro liên quan đến hoạt động trên không gian mạng như mất cắp dữ liệu, lừa đảo trực tuyến, tấn công mạng và các rủi ro khác.",
    quyenLoiBaoHiem: [
      "Bồi thường thiệt hại tài chính do lừa đảo trực tuyến",
      "Bảo vệ trước hành vi trộm cắp danh tính",
      "Hỗ trợ pháp lý trong trường hợp tranh chấp",
      "Dịch vụ phục hồi dữ liệu và hỗ trợ kỹ thuật",
    ],
    bieuPhiBaoHiem:
      "Phí bảo hiểm dựa trên phạm vi bảo hiểm và số tiền bảo hiểm được lựa chọn.",
    huongDanBoiThuong:
      "Khi có sự cố xảy ra, người được bảo hiểm cần thông báo ngay cho BIC và cung cấp các bằng chứng cần thiết để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau:
      "Quy tắc bảo hiểm an ninh mạng được ban hành theo quy định của BIC.",
  },
  "bao-hiem-tai-nan-nguoi-su-dung-dien": {
    id: "bao-hiem-tai-nan-nguoi-su-dung-dien",
    title: "Bảo hiểm tai nạn người sử dụng điện",
    subtitle: "Bảo vệ trước rủi ro điện giật, tai nạn điện",
    description:
      "Bảo hiểm dành cho người sử dụng điện, bảo vệ trước các rủi ro tai nạn liên quan đến điện trong sinh hoạt và lao động.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 50.000đ/năm",
    buyUrl:
      "/mua-bao-hiem/bao-hiem-tai-nan/bao-hiem-tai-nan-nguoi-su-dung-dien",
    category: "bao-hiem-tai-nan-12",
    categoryName: "Bảo hiểm tai nạn",
    doiTuongBaoHiem:
      "Cá nhân, hộ gia đình, tổ chức sử dụng điện trong sinh hoạt, sản xuất, kinh doanh.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro tai nạn do điện gây ra trong quá trình sử dụng điện.",
    quyenLoiBaoHiem: [
      "Chi trả quyền lợi khi xảy ra tai nạn do điện giật, cháy nổ điện.",
      "Hỗ trợ chi phí y tế, điều trị do tai nạn điện.",
      "Bồi thường tử vong, thương tật vĩnh viễn do tai nạn điện.",
    ],
    bieuPhiBaoHiem: "Phí bảo hiểm linh hoạt theo số người và mức trách nhiệm.",
    huongDanBoiThuong:
      "Khi xảy ra tai nạn điện, liên hệ ngay với BIC và cung cấp hồ sơ y tế, xác nhận tai nạn để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau: "Theo quy tắc bảo hiểm tai nạn người sử dụng điện của BIC.",
  },
  "bao-hiem-tai-nan-mo-rong": {
    id: "bao-hiem-tai-nan-mo-rong",
    title: "Bảo hiểm tai nạn mở rộng",
    subtitle: "Bảo vệ toàn diện trước nhiều rủi ro tai nạn",
    description:
      "Bảo hiểm mở rộng phạm vi bảo vệ cho người được bảo hiểm trước nhiều rủi ro tai nạn trong sinh hoạt, lao động, học tập.",
    bannerImage: "/placeholder.svg?height=500&width=800",
    price: "Từ 80.000đ/năm",
    buyUrl: "/mua-bao-hiem/bao-hiem-tai-nan/bao-hiem-tai-nan-mo-rong",
    category: "bao-hiem-tai-nan-12",
    categoryName: "Bảo hiểm tai nạn",
    doiTuongBaoHiem:
      "Cá nhân, học sinh, sinh viên, người lao động, các đối tượng khác có nhu cầu mở rộng bảo vệ.",
    phamViBaoHiem:
      "Bảo hiểm cho các rủi ro tai nạn trong sinh hoạt, lao động, học tập, di chuyển.",
    quyenLoiBaoHiem: [
      "Chi trả quyền lợi khi xảy ra tai nạn trong sinh hoạt, lao động, học tập.",
      "Hỗ trợ chi phí y tế, điều trị do tai nạn.",
      "Bồi thường tử vong, thương tật vĩnh viễn do tai nạn.",
    ],
    bieuPhiBaoHiem: "Phí bảo hiểm linh hoạt theo gói và quyền lợi mở rộng.",
    huongDanBoiThuong:
      "Khi xảy ra tai nạn, liên hệ ngay với BIC và cung cấp hồ sơ y tế, xác nhận tai nạn để được hướng dẫn thủ tục bồi thường.",
    quyTacBieuMau: "Theo quy tắc bảo hiểm tai nạn mở rộng của BIC.",
  },
  // Thêm các sản phẩm khác tương tự
};

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
