import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
export default function PromotionsPage() {
    const promotions = [
        {
            id: 1,
            title: "08.03: TƯNG BỪNG ƯU ĐÃI TỚI 30% PHÍ BẢO HIỂM TẠI BIC",
            date: "March 05, 2025",
            image: "/promotion-1.jpg",
            category: "Khuyến mại",
            content:
                "Chào mừng ngày Quốc tế Phụ nữ 8/3, Tổng Công ty Bảo hiểm BIDV (BIC) gửi tặng khách hàng chương trình khuyến mại Siêu hời bảo hiểm,",
        },
        {
            id: 2,
            title: "ƯU ĐÃI 15% PHÍ BẢO HIỂM SỨC KHỎE CAO CẤP BIC SMART CARE MỪNG QUỐC TẾ PHỤ NỮ",
            date: "February 28, 2025",
            image: "/promotion-1.jpg",
            category: "Khuyến mại",
        },
        {
            id: 3,
            title: "28.12: SIÊU ƯU ĐÃI TỚI 40% MỪNG SINH NHẬT BIC",
            date: "December 24, 2024",
            image: "/promotion-2.jpg",
            category: "Khuyến mại",
        },
    ]
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="container mx-auto py-8">
                <div className="pt-[82px]  mb-8">
                    <div className="border-b border-gray-200 flex flex-col items-center">
                        <div className="max-w-6xl mx-auto px-4 py-8">
                            <div className="w-20 h-1 bg-black mb-1 mx-auto"></div>
                            <h1 className="text-4xl font-bold text-red-600 text-center">Khuyến mãi</h1>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <img src="/promotion-1.jpg" alt="Featured Promotion" className="w-full h-auto rounded" />
                            <div className="p-10">
                                <div className="flex items-center text-sm text-gray-500 my-8">
                                    <span className="mr-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2 text-red-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        March 05, 2025
                                    </span>
                                    <Link to="/khuyen-mai" className="text-red-600 hover:underline flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-2">
                                            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                                        </svg>

                                        Khuyến mại
                                    </Link>
                                </div>

                                <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-4">
                                    08.03: Ưu đãi 15% phí bảo hiểm sức khỏe cao cấp BIC Smart Care mừng Quốc tế Phụ nữ
                                </h2>

                                <p className="text-gray-700 text-xl">
                                    Chào mừng ngày Quốc tế Phụ nữ 8/3, Tổng Công ty Bảo hiểm BIDV (BIC) gửi tặng khách hàng chương trình khuyến mại Siêu hội bảo hiểm, giảm tới 30% phí nhiều sản phẩm bảo hiểm.
                                </p>
                                <Link to="#" className="rounded inline-flex cursor-pointer mt-9 border-[#ee1c24] text-black text-base p-[0_34px] h-12 leading-[48px] border-[2px] justify-center items-center">
                                    Xem thêm
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-600">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 p-10">
                            <h3 className="text-lg font-bold text-red-600 border-b-2 border-red-600 pb-2 mb-4">TIN MỚI NHẤT</h3>

                            <div className="space-y-10">
                                {promotions.map((promo) => (
                                    <div key={promo.id} className="flex gap-6">
                                        <img
                                            src={promo.image || "/placeholder.svg"}
                                            alt={promo.title}
                                            className="h-16 object-cover rounded"
                                        />
                                        <div>
                                            <h4 className="text-sm leading-[1.6] font-medium text-gray-800 hover:text-red-600">
                                                <Link to={`/khuyen-mai/${promo.id}`}>{promo.title}</Link>
                                            </h4>
                                            <p className="text-[15px] text-gray-500 mt-1">{promo.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <img src="/promotion-1.jpg" alt="Featured Promotion" className="w-full h-auto rounded" />
                            <div className="p-10">
                                <div className="flex items-center text-sm text-gray-500 my-8">
                                    <span className="mr-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2 text-red-600">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        March 05, 2025
                                    </span>
                                    <Link to="/khuyen-mai" className="text-red-600 hover:underline flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-2">
                                            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                                        </svg>

                                        Khuyến mại
                                    </Link>
                                </div>

                                <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-4">
                                    08.03: Ưu đãi 15% phí bảo hiểm sức khỏe cao cấp BIC Smart Care mừng Quốc tế Phụ nữ
                                </h2>

                                <p className="text-gray-700 text-xl">
                                    Chào mừng ngày Quốc tế Phụ nữ 8/3, Tổng Công ty Bảo hiểm BIDV (BIC) gửi tặng khách hàng chương trình khuyến mại Siêu hội bảo hiểm, giảm tới 30% phí nhiều sản phẩm bảo hiểm.
                                </p>
                                <Link to="#" className="rounded inline-flex cursor-pointer mt-9 border-[#ee1c24] text-black text-base p-[0_34px] h-12 leading-[48px] border-[2px] justify-center items-center">
                                    Xem thêm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main >
    )
}
