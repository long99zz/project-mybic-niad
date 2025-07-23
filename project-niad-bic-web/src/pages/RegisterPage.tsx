"use client"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CustomerSupport from "../components/CustomerSupport"
import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        userType: "individual",
        lastName: "",
        firstName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        idNumber: "",
        gender: "male",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
        province: "",
        city: "",
        district: "",
        ward: "",
        houseNumber: "",
        useAsDefaultAddress: false,
        captcha: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        setFormData((prev) => ({ ...prev, [name]: val }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle registration submission
        console.log("Registration submitted:", formData)
    }

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="flex-1 flex flex-col">
                <div className="container mx-auto py-24 flex-1">
                    <div className="max-w-4xl mx-auto w-full">
                        <h1 className="text-4xl font-bold text-center text-red-600 mb-12">Đăng ký thành viên</h1>

                        <div className="text-center mb-8">
                            <p className="text-gray-700">
                                Nếu bạn đã có tài khoản?
                                <Link to="/dang-nhap" className="text-red-600 hover:underline ml-1">
                                    Nhấn vào đây
                                </Link>
                                để đến trang đăng nhập
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center">
                                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Bạn là?
                                </label>
                                <div className="md:col-span-2">
                                    <select
                                        id="userType"
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="individual">Khách hàng cá nhân</option>
                                        <option value="business">Doanh nghiệp</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Họ tên đệm <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Tên <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Điện thoại <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Email <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Mật khẩu <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Nhập lại mật khẩu <span className="text-red-600">*</span>
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Số CMND/CCCD
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="idNumber"
                                        name="idNumber"
                                        type="text"
                                        value={formData.idNumber}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label className="block text-sm font-medium text-gray-700 md:text-left">Giới tính</label>
                                <div className="md:col-span-2 flex items-center space-x-6">
                                    <div className="flex items-center">
                                        <input
                                            id="male"
                                            name="gender"
                                            type="radio"
                                            value="male"
                                            checked={formData.gender === "male"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <label htmlFor="male" className="ml-2 block text-sm text-gray-700">
                                            Nam
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="female"
                                            name="gender"
                                            type="radio"
                                            value="female"
                                            checked={formData.gender === "female"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <label htmlFor="female" className="ml-2 block text-sm text-gray-700">
                                            Nữ
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label className="block text-sm font-medium text-gray-700 md:text-left">Ngày sinh</label>
                                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                    <select
                                        name="birthDay"
                                        value={formData.birthDay}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">Chọn</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthMonth"
                                        value={formData.birthMonth}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">Chọn</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthYear"
                                        value={formData.birthYear}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">Chọn</option>
                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Province field */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="province" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Tỉnh
                                </label>
                                <div className="md:col-span-2">
                                    <select
                                        id="province"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="hanoi">Hà Nội</option>
                                        <option value="hochiminh">Hồ Chí Minh</option>
                                        <option value="danang">Đà Nẵng</option>
                                        {/* Add more provinces as needed */}
                                    </select>
                                </div>
                            </div>

                            {/* City field */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Thành phố
                                </label>
                                <div className="md:col-span-2">
                                    <select
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {/* Options would be populated based on selected province */}
                                    </select>
                                </div>
                            </div>

                            {/* District field */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Quận/Huyện
                                </label>
                                <div className="md:col-span-2">
                                    <select
                                        id="district"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {/* Options would be populated based on selected city */}
                                    </select>
                                </div>
                            </div>

                            {/* Ward field */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="ward" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Phường/Xã
                                </label>
                                <div className="md:col-span-2">
                                    <select
                                        id="ward"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 0.5rem center",
                                            backgroundSize: "1.5em 1.5em",
                                            paddingRight: "2.5rem",
                                        }}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {/* Options would be populated based on selected district */}
                                    </select>
                                </div>
                            </div>

                            {/* House number field */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 md:text-left">
                                    Số nhà
                                </label>
                                <div className="md:col-span-2">
                                    <input
                                        id="houseNumber"
                                        name="houseNumber"
                                        type="text"
                                        value={formData.houseNumber}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>
                            {/* Required fields note */}
                            <div className="grid grid-cols-1 gap-y-6 items-center mt-6">
                                <div className="md:col-span-2 md:col-start-2 text-right">
                                    <p className="text-sm text-gray-500 italic">(Những trường có dấu * bắt buộc phải điền)</p>
                                </div>
                            </div>

                            {/* Use as default address checkbox */}
                            <div className="flex gap-y-6 items-center mt-6">
                                <div className="md:col-span-2 md:col-start-2 flex items-center">
                                    <input
                                        id="useAsDefaultAddress"
                                        name="useAsDefaultAddress"
                                        type="checkbox"
                                        checked={formData.useAsDefaultAddress}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="useAsDefaultAddress" className="ml-2 block text-sm text-gray-700">
                                        Sử dụng như địa chỉ thanh toán mặc định
                                    </label>
                                </div>
                            </div>

                            {/* CAPTCHA */}
                            <div className="flex justify-end grid-cols-1 md:grid-cols-3 gap-y-6 items-center mt-6">
                                <div className="md:col-span-2 md:col-start-2 flex items-center justify-between space-x-4">
                                    <div className="flex-shrink-0">
                                        <img src="/captcha.png" alt="CAPTCHA" className="h-12" />
                                        <button
                                            type="button"
                                            className="text-red-600 text-xs mt-1 flex items-center"
                                            onClick={() => console.log("Change CAPTCHA")}
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Đổi mã khác
                                        </button>
                                    </div>
                                    <div className="flex-grow">
                                        <input
                                            id="captcha"
                                            name="captcha"
                                            type="text"
                                            placeholder="Nhập mã xác nhận"
                                            value={formData.captcha}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center grid-cols-1 gap-y-6 items-center mt-8">
                                <div className="md:col-span-2 w-1/2 md:col-start-2">
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Customer Support Section */}
                <CustomerSupport />
            </div>
            <Footer />
        </main>
    )
}
