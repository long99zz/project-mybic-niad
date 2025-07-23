"use client"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"
import { Mail, MapPin, Phone, RefreshCw } from "lucide-react"
import { useState } from "react"
export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        captcha: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission
        console.log("Form submitted:", formData)
    }
    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="container mx-auto py-8">
                <div className="flex flex-col min-h-screen">
                    {/* Hero Banner */}
                    <div
                        className="w-full h-[420px] bg-cover flex items-center justify-center"
                        style={{ backgroundImage: "url(https://mybic.vn/assets/2ac8db5b/images/banner-4.jpg)" }}
                    ></div>

                    {/* Main Content */}
                    <div className="container mx-auto py-12">
                        <h1 className="text-4xl font-bold text-center text-red-600 mb-12 relative">
                            Liên hệ ngay với chúng tôi
                            <span className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800"></span>
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {/* Phone Contact */}
                            <div className="bg-white p-8 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4">
                                    <Phone className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">19009456 - 0916186611</h3>
                                <p className="text-gray-600 mb-4">Hỗ trợ trực tuyến 24/7</p>
                                <Link to="tel:19009456" className="text-red-600 hover:underline font-medium">
                                    Liên hệ
                                </Link>
                            </div>

                            {/* Address */}
                            <div className="bg-white p-8 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4">
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">TẦNG 11, TÒA NHÀ SỐ 263 CẦU GIẤY</h3>
                                <p className="text-gray-600 mb-1">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                                <p className="text-gray-600 mb-4">Nghỉ Thứ 7 & Chủ nhật</p>
                            </div>

                            {/* Email */}
                            <div className="bg-white p-8 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">EBUSINESS.BIC@BIDV.COM.VN</h3>
                                <p className="text-gray-600 mb-4">Hỗ trợ thông tin 24/7</p>
                                <Link to="mailto:EBUSINESS.BIC@BIDV.COM.VN" className="text-red-600 hover:underline font-medium">
                                    Gửi mail
                                </Link>
                            </div>
                        </div>

                        {/* Contact Form and Map */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Contact Form */}
                            <div className="bg-white p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Họ và Tên"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Điện thoại"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Nội dung"
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="mb-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="captcha"
                                                value={formData.captcha}
                                                onChange={handleChange}
                                                placeholder="Nhập mã xác nhận"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <img src="/captcha.png" alt="CAPTCHA" className="h-10" />
                                            <button
                                                type="button"
                                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                                                onClick={() => console.log("Change CAPTCHA")}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Đổi mã khác
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-white text-red-600 border border-red-600 rounded hover:bg-red-50 font-medium"
                                        >
                                            Gửi ngay
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Google Map */}
                            <div className="bg-white h-[450px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9265586961897!2d105.79188007597555!3d21.035710980615344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3b4220c2bd%3A0x1c9e359e2a4f618c!2s263%20C%E1%BA%A7u%20Gi%E1%BA%A5y%2C%20D%E1%BB%8Bch%20V%E1%BB%8Dng%2C%20C%E1%BA%A7u%20Gi%E1%BA%A5y%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vietnam!5e0!3m2!1sen!2s!4v1712432287889!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="BIC Office Location"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    )
}
