import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getProductName } from "../constants/productMapping";
import { verifyPayment } from "../services/payment";

const HomeInsuranceOrderPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dang-nhap");
    }
  }, [isAuthenticated, navigate]);

  // State cho các trường form bước 1
  const [scope, setScope] = useState<string[]>(["co-ban"]);
  const [houseType, setHouseType] = useState("lien-ke");
  const [year, setYear] = useState("01-15");
  const [houseValue, setHouseValue] = useState("300 triệu đồng");
  const [assetValue, setAssetValue] = useState("100 triệu đồng");

  // State cho các bước
  const [step, setStep] = useState(1);
  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    type: "individual",
    companyName: "",
    taxCode: "",
    companyAddress: "",
    identityCard: "",
    invoice: false,
  });
  const [insuredName, setInsuredName] = useState("");
  const [insuredAddress, setInsuredAddress] = useState("");
  const [insuredDate, setInsuredDate] = useState("");

  // 1. Bảng phí phần vật chất ngôi nhà
  const houseFeeTable = [
    // 01-15 năm
    {
      value: "300 triệu đồng",
      year: "01-15",
      base: 225000,
      ext1: 45000,
      ext2: 90000,
    },
    {
      value: "500 triệu đồng",
      year: "01-15",
      base: 375000,
      ext1: 75000,
      ext2: 150000,
    },
    {
      value: "750 triệu đồng",
      year: "01-15",
      base: 562500,
      ext1: 112500,
      ext2: 225000,
    },
    {
      value: "1 tỷ đồng",
      year: "01-15",
      base: 750000,
      ext1: 150000,
      ext2: 300000,
    },
    {
      value: "1.5 tỷ đồng",
      year: "01-15",
      base: 1125000,
      ext1: 225000,
      ext2: 450000,
    },
    {
      value: "2 tỷ đồng",
      year: "01-15",
      base: 1500000,
      ext1: 300000,
      ext2: 600000,
    },
    {
      value: "3 tỷ đồng",
      year: "01-15",
      base: 2250000,
      ext1: 450000,
      ext2: 900000,
    },
    {
      value: "4 tỷ đồng",
      year: "01-15",
      base: 3000000,
      ext1: 600000,
      ext2: 1200000,
    },
    {
      value: "5 tỷ đồng",
      year: "01-15",
      base: 3750000,
      ext1: 750000,
      ext2: 1500000,
    },
    // 15-25 năm
    {
      value: "300 triệu đồng",
      year: "16-25",
      base: 360000,
      ext1: 60000,
      ext2: 120000,
    },
    {
      value: "500 triệu đồng",
      year: "16-25",
      base: 600000,
      ext1: 100000,
      ext2: 200000,
    },
    {
      value: "750 triệu đồng",
      year: "16-25",
      base: 900000,
      ext1: 150000,
      ext2: 300000,
    },
    {
      value: "1 tỷ đồng",
      year: "16-25",
      base: 1200000,
      ext1: 200000,
      ext2: 400000,
    },
    {
      value: "1.5 tỷ đồng",
      year: "16-25",
      base: 1800000,
      ext1: 300000,
      ext2: 600000,
    },
    {
      value: "2 tỷ đồng",
      year: "16-25",
      base: 2400000,
      ext1: 400000,
      ext2: 800000,
    },
    {
      value: "3 tỷ đồng",
      year: "16-25",
      base: 3600000,
      ext1: 600000,
      ext2: 1200000,
    },
    {
      value: "4 tỷ đồng",
      year: "16-25",
      base: 4800000,
      ext1: 800000,
      ext2: 1600000,
    },
    {
      value: "5 tỷ đồng",
      year: "16-25",
      base: 6000000,
      ext1: 1000000,
      ext2: 2000000,
    },
  ];
  // 2. Bảng phí phần tài sản bên trong
  const assetFeeTable = [
    { value: "100 triệu đồng", base: 100000, ext1: 15000, ext2: 35000 },
    { value: "300 triệu đồng", base: 300000, ext1: 45000, ext2: 105000 },
    { value: "500 triệu đồng", base: 500000, ext1: 75000, ext2: 175000 },
    { value: "750 triệu đồng", base: 750000, ext1: 112500, ext2: 262500 },
    { value: "1 tỷ đồng", base: 1000000, ext1: 150000, ext2: 350000 },
  ];
  // 3. Hàm tính phí
  function calcHomeInsuranceFee(
    houseValue: string,
    year: string,
    scope: string[],
    assetValue: string
  ) {
    if (year === ">25") {
      return 0; // hoặc có thể trả về null/hoặc báo lỗi tuỳ ý
    }
    // Map lại year cho đúng key
    let yearKey = year;
    if (year === "01-15") yearKey = "01-15";
    if (year === "16-25") yearKey = "16-25";
    const houseRow = houseFeeTable.find(
      (r) => r.value === houseValue && r.year === yearKey
    );
    const assetRow = assetFeeTable.find((r) => r.value === assetValue);
    let houseFee = 0;
    let assetFee = 0;
    if (houseRow) {
      houseFee += houseRow.base;
      if (scope.includes("mo-rong-1")) houseFee += houseRow.ext1;
      if (scope.includes("mo-rong-2")) houseFee += houseRow.ext2;
    }
    if (assetRow) {
      assetFee += assetRow.base;
      if (scope.includes("mo-rong-1")) assetFee += assetRow.ext1;
      if (scope.includes("mo-rong-2")) assetFee += assetRow.ext2;
    }
    return houseFee + assetFee;
  }

  // Tạm thời phí bảo hiểm là số cố định
  const insuranceFee = calcHomeInsuranceFee(
    houseValue,
    year,
    scope,
    assetValue
  );
  const discount = 0;
  const totalFee = insuranceFee - discount;

  // Xử lý chọn phạm vi bảo hiểm
  const handleScopeChange = (value: string) => {
    setScope((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate bước 1 nếu cần
    }
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };
  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo(0, 0);
    } else {
      window.history.back();
    }
  };
  const handleAccountInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo((prev) => ({ ...prev, [name]: value }));
  };

  const API_URL = import.meta.env.VITE_API_URL || "";

  const handleOrderHomeInsurance = async () => {
    try {
      // Chuẩn hóa ngày tháng
      const duration = 12;
      // Tính ngày kết thúc dựa trên ngày bắt đầu + thời hạn
      let insuranceEnd = new Date();
      if (insuredDate) {
        insuranceEnd = new Date(insuredDate);
        insuranceEnd.setFullYear(insuranceEnd.getFullYear() + Math.floor(duration / 12));
        insuranceEnd.setMonth(insuranceEnd.getMonth() + (duration % 12));
      }
      
      // Chuẩn bị dữ liệu gửi lên
      const invoice = {
        coverage_scope: scope.join(","),
        home_type: houseType,
        home_usage_status: year === "01-15" ? "Mới" : "Đã sử dụng",
        home_insurance_amount: Number(houseValue.replace(/\D/g, "")) * 1000000, // chuyển sang số nếu cần
        asset_insurance_amount: Number(assetValue.replace(/\D/g, "")) * 1000000, // chuyển sang số nếu cần
        insured_person_name: insuredName,
        insured_home_address: insuredAddress,
        insurance_duration: duration,
        insurance_start: insuredDate
          ? new Date(insuredDate).toISOString()
          : new Date().toISOString(),
        insurance_end: insuranceEnd.toISOString(),
        total_amount: totalFee, // Tổng phí thực thu (đã trừ chiết khấu)
        product_id: 17,
        // Có thể bổ sung thêm các trường khác nếu backend yêu cầu
      };
      const token = sessionStorage.getItem("token");
      // Gửi API
      const res = await axios.post(
        `${API_URL}/insurance_home/create_home_invoice`,
        invoice,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Xử lý kết quả
      if (res.data && res.data.master_invoice_id) {
        const master_invoice_id = res.data.master_invoice_id;
        
        // Lưu thông tin đơn hàng vào sessionStorage
        const orderInfo = {
          invoice_id: master_invoice_id, // Dùng master_invoice_id
          product_name: getProductName(17),
          insurance_amount: totalFee,
          customer_name: accountInfo.fullName,
          created_at: new Date().toISOString(),
          insurance_start: insuredDate,
          insurance_end: new Date(new Date(insuredDate).setFullYear(
            new Date(insuredDate).getFullYear() + 1
          )).toISOString(),
          status: "Chưa thanh toán",
          // Thông tin bổ sung
          house_address: insuredAddress,
          house_value: houseValue,
          asset_value: assetValue
        };
        sessionStorage.setItem('temp_order_info', JSON.stringify(orderInfo));
        
        // Chuyển hướng đến trang đặt hàng thành công (OrderSuccessPage sẽ xử lý payment)
        navigate(`/dat-hang-thanh-cong?master_invoice_id=${master_invoice_id}&amount=${totalFee}`);
      } else {
        alert("Có lỗi khi đặt mua bảo hiểm!");
      }
    } catch (error) {
      const err = error as any;
      alert(
        "Có lỗi khi đặt mua bảo hiểm: " +
          (err?.response?.data?.error || err?.message || "")
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[82px] pb-10">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Tiến trình */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full ${
                  step >= 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-300 text-gray-500"
                } flex items-center justify-center text-2xl font-bold`}
              >
                1
              </div>
              <span
                className={`ml-3 text-xl font-semibold ${
                  step === 1 ? "text-red-600" : "text-gray-500"
                }`}
              >
                Thông tin chung
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full ${
                  step >= 2
                    ? "bg-red-600 text-white"
                    : "bg-gray-300 text-gray-500"
                } flex items-center justify-center text-2xl font-bold`}
              >
                2
              </div>
              <span
                className={`ml-3 text-xl font-semibold ${
                  step === 2 ? "text-red-600" : "text-gray-500"
                }`}
              >
                Thông tin khách hàng
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full ${
                  step === 3
                    ? "bg-red-600 text-white"
                    : "bg-gray-300 text-gray-500"
                } flex items-center justify-center text-2xl font-bold`}
              >
                3
              </div>
              <span
                className={`ml-3 text-xl font-semibold ${
                  step === 3 ? "text-red-600" : "text-gray-500"
                }`}
              >
                Tài khoản & Giao nhận
              </span>
            </div>
          </div>

          {/* Bước 1: Thông tin chung */}
          {step === 1 && (
            <>
              {/* Form nhập liệu bảo hiểm nhà tư nhân */}
              <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-red-600 mb-6 text-left">
                  Thông tin chung
                </h2>
                <div className="space-y-6">
                  {/* Phạm vi bảo hiểm */}
                  <div className="flex items-start gap-8">
                    <label className="block text-lg font-medium min-w-[220px] pt-2 text-left">
                      Phạm vi bảo hiểm
                    </label>
                    <div className="flex flex-col gap-2 flex-1">
                      <label className="grid grid-cols-[24px_1fr] items-start text-left">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="mt-1"
                        />
                        <span className="pl-4">Cơ bản (cháy, nổ)</span>
                      </label>
                      <label className="grid grid-cols-[24px_1fr] items-start text-left">
                        <input
                          type="checkbox"
                          checked={scope.includes("mo-rong-1")}
                          onChange={() => handleScopeChange("mo-rong-1")}
                          className="mt-1"
                        />
                        <span className="pl-4">
                          Mở rộng 1 (Giông, Bão, Lụt, Nước tràn, Va chạm với
                          ngôi nhà, Trộm cướp)
                        </span>
                      </label>
                      <label className="grid grid-cols-[24px_1fr] items-start text-left">
                        <input
                          type="checkbox"
                          checked={scope.includes("mo-rong-2")}
                          onChange={() => handleScopeChange("mo-rong-2")}
                          className="mt-1"
                        />
                        <span className="pl-4">
                          Mở rộng 2 (Chi phí dọn hiện trường, chữa cháy, Tiền
                          thuê nhà sau tổn thất)
                        </span>
                      </label>
                    </div>
                  </div>
                  {/* Loại hình ngôi nhà */}
                  <div className="flex items-center gap-8">
                    <label className="block text-lg font-medium min-w-[220px] text-left">
                      Loại hình ngôi nhà
                    </label>
                    <div className="flex gap-8 flex-1">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={houseType === "lien-ke"}
                          onChange={() => setHouseType("lien-ke")}
                          className="mr-2"
                        />
                        Nhà liền kề/Biệt thự
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={houseType === "chung-cu"}
                          onChange={() => setHouseType("chung-cu")}
                          className="mr-2"
                        />
                        Căn hộ chung cư
                      </label>
                    </div>
                  </div>
                  {/* Năm sử dụng */}
                  <div className="flex items-center gap-8">
                    <label className="block text-lg font-medium min-w-[220px] text-left">
                      Ngôi nhà đã sử dụng *
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    >
                      <option value="01-15">01 - 15 năm</option>
                      <option value="16-25">16 - 25 năm</option>
                    </select>
                  </div>
                  {/* Số tiền bảo hiểm căn nhà */}
                  <div className="flex items-center gap-8">
                    <label className="block text-lg font-medium min-w-[220px] text-left">
                      Số tiền bảo hiểm căn nhà
                    </label>
                    <select
                      value={houseValue}
                      onChange={(e) => setHouseValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    >
                      <option value="300 triệu đồng">300 triệu đồng</option>
                      <option value="500 triệu đồng">500 triệu đồng</option>
                      <option value="750 triệu đồng">750 triệu đồng</option>
                      <option value="1 tỷ đồng">1 tỷ đồng</option>
                      <option value="2 tỷ đồng">2 tỷ đồng</option>
                      <option value="3 tỷ đồng">3 tỷ đồng</option>
                      <option value="4 tỷ đồng">4 tỷ đồng</option>
                      <option value="5 tỷ đồng">5 tỷ đồng</option>
                    </select>
                  </div>
                  {/* Số tiền bảo hiểm tài sản */}
                  <div className="flex items-center gap-8">
                    <label className="block text-lg font-medium min-w-[220px] text-left">
                      Số tiền bảo hiểm tài sản *
                    </label>
                    <select
                      value={assetValue}
                      onChange={(e) => setAssetValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    >
                      <option value="100 triệu đồng">100 triệu đồng</option>
                      <option value="300 triệu đồng">300 triệu đồng</option>
                      <option value="500 triệu đồng">500 triệu đồng</option>
                      <option value="750 triệu đồng">750 triệu đồng</option>
                      <option value="1 tỷ đồng">1 tỷ đồng</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Box tính phí bảo hiểm */}
              <div className="bg-white rounded-2xl shadow-lg p-6 text-left mt-8 mb-8 max-w-5xl mx-auto">
                <p className="text-lg">
                  Tổng phí (miễn VAT):{" "}
                  <span className="text-red-600 font-bold">
                    {insuranceFee.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <p className="text-lg">
                  Số tiền chiết khấu:{" "}
                  <span className="text-red-600 font-bold">
                    {discount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
                <hr className="my-2" />
                <p className="text-xl font-bold">
                  Tổng phí thực thu (miễn VAT):{" "}
                  <span className="text-red-600">
                    {totalFee.toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
              </div>
            </>
          )}

          {/* Bước 2: Danh sách người tham gia & Thông tin bên mua bảo hiểm */}
          {step === 2 && (
            <>
              <div className="space-y-8">
                {/* Thông tin người được bảo hiểm */}
                <div className="bg-[#ededed] rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 max-w-5xl mx-auto">
                  <h2 className="text-2xl font-medium text-red-600 mb-4 text-left">
                    Thông tin người được bảo hiểm
                  </h2>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Họ tên người được bảo hiểm{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-base"
                          value={insuredName}
                          onChange={(e) => setInsuredName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Địa chỉ ngôi nhà được bảo hiểm{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-base"
                          value={insuredAddress}
                          onChange={(e) => setInsuredAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Thời hạn bảo hiểm{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md text-base"
                          value={insuredDate}
                          onChange={(e) => setInsuredDate(e.target.value)}
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          01 năm kể từ ngày trên và sau thời điểm thanh toán phí
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Thông tin Bên mua bảo hiểm */}
                <div className="bg-[#F4F6F8] p-6 rounded-lg max-w-5xl mx-auto">
                  <h3 className="text-2xl font-semibold text-left mb-6 text-red-600">
                    Thông tin Bên mua bảo hiểm
                  </h3>
                  <div className="space-y-6">
                    {/* Loại người mua */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Người mua <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <select
                          name="type"
                          value={accountInfo.type || "individual"}
                          onChange={(e) =>
                            setAccountInfo((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-base"
                        >
                          <option value="individual">Cá nhân</option>
                          <option value="organization">Tổ chức</option>
                        </select>
                      </div>
                    </div>
                    {/* CMND/CCCD hoặc thông tin tổ chức */}
                    {accountInfo.type === "organization" ? (
                      <>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium min-w-[380px] text-left">
                            Mã số thuế <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="taxCode"
                              value={accountInfo.taxCode || ""}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  taxCode: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium min-w-[380px] text-left">
                            Tên công ty/ Tổ chức{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="companyName"
                              value={accountInfo.companyName || ""}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  companyName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium min-w-[380px] text-left">
                            Địa chỉ công ty
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="companyAddress"
                              value={accountInfo.companyAddress || ""}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  companyAddress: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium min-w-[380px] text-left">
                            Họ và tên <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="fullName"
                              value={accountInfo.fullName || ""}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  fullName: e.target.value,
                                }))
                              }
                              placeholder="Nhập họ và tên"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium min-w-[380px] text-left">
                            CMND/CCCD <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="identityCard"
                              value={accountInfo.identityCard || ""}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  identityCard: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Địa chỉ */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Địa chỉ<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="address"
                          value={accountInfo.address}
                          onChange={handleAccountInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Email nhận thông báo{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="email"
                          name="email"
                          value={accountInfo.email}
                          onChange={handleAccountInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                        />
                      </div>
                    </div>
                    {/* Số điện thoại */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Số điện thoại di động{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={accountInfo.phone}
                          onChange={handleAccountInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                        />
                      </div>
                    </div>
                    {/* Xuất hóa đơn */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium min-w-[380px] text-left">
                        Xuất hóa đơn
                      </label>
                      <div className="flex-1 flex gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="invoice"
                            value="false"
                            checked={!accountInfo.invoice}
                            onChange={() =>
                              setAccountInfo((prev) => ({
                                ...prev,
                                invoice: false,
                              }))
                            }
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="ml-2">Không nhận hóa đơn</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="invoice"
                            value="true"
                            checked={!!accountInfo.invoice}
                            onChange={() =>
                              setAccountInfo((prev) => ({
                                ...prev,
                                invoice: true,
                              }))
                            }
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="ml-2">Có nhận hóa đơn</span>
                        </label>
                      </div>
                    </div>
                    {accountInfo.invoice && (
                      <p className="text-sm text-gray-600 mt-2">
                        Theo quy định của Nhà nước tại Nghị định số
                        123/2020/NĐ-CP và thông tư số 78/2021/TT-BTC, BIC sẽ
                        cung cấp hóa đơn GTGT dưới dạng hóa đơn điện tử và gửi
                        đến quý khách qua email đã đăng ký khi mua hàng.
                      </p>
                    )}
                  </div>
                </div>
                {/* Box tổng phí bảo hiểm ở cuối bước 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 text-left mt-8 mb-8 max-w-5xl mx-auto">
                  <p className="text-lg">
                    Tổng phí (miễn VAT):{" "}
                    <span className="text-red-600 font-bold">
                      {insuranceFee.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                  <p className="text-lg">
                    Số tiền chiết khấu:{" "}
                    <span className="text-red-600 font-bold">
                      {discount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                  <hr className="my-2" />
                  <p className="text-xl font-bold">
                    Tổng phí thực thu (miễn VAT):{" "}
                    <span className="text-red-600">
                      {totalFee.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Bước 3: Thông tin tài khoản & Giao nhận */}
          {step === 3 && (
            <div className="space-y-8">
              {/* Thông tin tài khoản */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-red-600 mb-6">
                  Thông tin tài khoản
                </h3>
                {/* Nút sao chép thông tin */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountInfo({
                        ...accountInfo,
                        fullName: accountInfo.fullName,
                        address: accountInfo.address,
                        email: accountInfo.email,
                        phone: accountInfo.phone,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Sao chép thông tin từ bên mua bảo hiểm
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-8">
                    <label className="text-lg font-medium min-w-[380px] text-left">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="fullName"
                        value={accountInfo.fullName}
                        onChange={handleAccountInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="text-lg font-medium min-w-[380px] text-left">
                      Địa chỉ <span className="text-red-600">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="address"
                        value={accountInfo.address}
                        onChange={handleAccountInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="text-lg font-medium min-w-[380px] text-left">
                      Email nhận thông báo{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="email"
                        name="email"
                        value={accountInfo.email}
                        onChange={handleAccountInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="text-lg font-medium min-w-[380px] text-left">
                      Số điện thoại di động{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="tel"
                        name="phone"
                        value={accountInfo.phone}
                        onChange={handleAccountInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Giao nhận */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-xl font-bold mb-4">Hình thức giao nhận</h4>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-700">
                    Giấy chứng nhận bảo hiểm điện tử (có giá trị như bản giấy)
                    sẽ được gửi đến email Quý khách đăng ký ở trên sau khi chúng
                    tôi nhận được phí thanh toán
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-xl font-bold mb-4">Thời điểm giao nhận</h4>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-700">
                    Trong vòng 24 giờ kể từ thời điểm thanh toán phí
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nút điều hướng */}
          <div className="flex justify-between mt-8 max-w-5xl mx-auto">
            <button
              className="px-6 py-3 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={handleBack}
              disabled={step === 1}
            >
              Quay lại
            </button>
            {step < 3 ? (
              <button
                className="px-8 py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
                onClick={handleNext}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                className="px-8 py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
                onClick={handleOrderHomeInsurance}
              >
                {" "}
                Xác nhận & Thanh toán{" "}
              </button>
            )}
          </div>
        </div>
      </div>
      <CustomerSupport />
      <Footer />
    </main>
  );
};

export default HomeInsuranceOrderPage;
