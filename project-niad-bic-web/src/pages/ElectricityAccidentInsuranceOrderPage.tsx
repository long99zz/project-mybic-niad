import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const insuranceOptions = [
  {
    value: 180_000_000,
    label: "180 triệu đồng",
    benefit: {
      soTien: "180.000.000 VNĐ",
      thuongTatVV: "Theo Bảng tỉ lệ trả tiền thương tật",
      thuongTatTT:
        "Nếu STBH <= 20 triệu: Theo Bảng tỉ lệ trả tiền thương tật\nNếu STBH > 20 triệu: Theo chi phí thực tế, không quá vết thương theo Bảng tỉ lệ trả tiền thương tật",
    },
  },
  {
    value: 75_000_000,
    label: "75 triệu đồng",
    benefit: {
      soTien: "75.000.000 VNĐ",
      thuongTatVV: "Theo Bảng tỉ lệ trả tiền thương tật",
      thuongTatTT:
        "Nếu STBH <= 20 triệu: Theo Bảng tỉ lệ trả tiền thương tật\nNếu STBH > 20 triệu: Theo chi phí thực tế, không quá vết thương theo Bảng tỉ lệ trả tiền thương tật",
    },
  },
  {
    value: 55_000_000,
    label: "55 triệu đồng",
    benefit: {
      soTien: "55.000.000 VNĐ",
      thuongTatVV: "Theo Bảng tỉ lệ trả tiền thương tật",
      thuongTatTT:
        "Nếu STBH <= 20 triệu: Theo Bảng tỉ lệ trả tiền thương tật\nNếu STBH > 20 triệu: Theo chi phí thực tế, không quá vết thương theo Bảng tỉ lệ trả tiền thương tật",
    },
  },
  {
    value: 40_000_000,
    label: "40 triệu đồng",
    benefit: {
      soTien: "40.000.000 VNĐ",
      thuongTatVV: "Theo Bảng tỉ lệ trả tiền thương tật",
      thuongTatTT:
        "Nếu STBH <= 20 triệu: Theo Bảng tỉ lệ trả tiền thương tật\nNếu STBH > 20 triệu: Theo chi phí thực tế, không quá vết thương theo Bảng tỉ lệ trả tiền thương tật",
    },
  },
];

const calcFee = (num: number, amount: number) => {
  if (!num || !amount) return 0;
  // Định nghĩa bảng phí
  const feeTable: Record<number, number> = {
    40_000_000: 100_000,
    55_000_000: 150_000,
    75_000_000: 200_000,
    180_000_000: 500_000,
  };
  const baseFee = feeTable[amount] || 0;
  if (num <= 6) {
    return baseFee * num;
  } else {
    const extra = num - 6;
    let extraFee = 0;
    if (amount === 180_000_000) {
      // Chương trình 4
      extraFee = amount * 0.0007 * extra;
    } else {
      // Chương trình 1,2,3
      extraFee = amount * 0.0005 * extra;
    }
    return Math.round(baseFee * 6 + extraFee);
  }
};

const ElectricityAccidentInsuranceOrderPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [numPeople, setNumPeople] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([
    { fullName: "", gender: "", dob: "", idNumber: "" },
  ]);
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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [insuranceStart, setInsuranceStart] = useState("");
  const [insuranceDuration, setInsuranceDuration] = useState(12);

  const selectedOption = insuranceOptions.find((opt) => opt.value === amount);
  const fee = calcFee(Number(numPeople), amount || 0);
  const discount = 0;
  const total = fee - discount;

  // Tính phí bảo hiểm 1 năm
  const annualFee = calcFee(Number(numPeople), amount || 0);

  // Cập nhật số người => cập nhật mảng participants
  React.useEffect(() => {
    const n = Number(numPeople) || 0;
    if (n > 0) {
      setParticipants((current) => {
        if (current.length === n) return current;
        const newArr = Array.from(
          { length: n },
          (_, i) =>
            current[i] || { fullName: "", gender: "", dob: "", idNumber: "" }
        );
        return newArr;
      });
    }
  }, [numPeople]);

  const handleNumPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (Number(val) > 100) {
      setError("Số người tham gia tối đa là 100");
    } else {
      setError("");
    }
    setNumPeople(val);
  };

  const handleParticipantChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setParticipants((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [name]: value };
      return arr;
    });
  };

  const handleAccountInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!numPeople || !amount || !!error) return;
    }
    if (step === 2) {
      // Có thể kiểm tra validate participants ở đây nếu muốn
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

  const handleOrder = async () => {
    try {
      // 1. Chuẩn bị dữ liệu invoice với định dạng RFC3339
      const startDate = insuranceStart ? new Date(insuranceStart) : new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + insuranceDuration);

      const invoice = {
        product_id: 10,
        InsuranceAmount: amount,
        InsuranceQuantity: Number(numPeople),
        InsuranceStart: startDate.toISOString(), // RFC3339 format
        InsuranceEnd: endDate.toISOString(), // RFC3339 format
        ContractType: "Mới",
        Status: "Chưa thanh toán",
      };
      // 2. Chuẩn bị participants với định dạng RFC3339 cho ngày sinh
      const participantsPayload = participants.map((p) => ({
        FullName: p.fullName,
        Gender:
          p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác",
        BirthDate: p.dob ? new Date(p.dob).toISOString() : null, // RFC3339 format
        IdentityNumber: p.idNumber,
      }));
      // 3. Gọi API tạo hóa đơn
      const res = await axios.post(
        `${API_URL}/api/insurance_accident/create_accident`,
        {
          invoice,
          participants: participantsPayload,
        }
      );
      const invoice_id = res.data.invoice?.invoice_id;
      // 4. (Tuỳ chọn) Gọi API update customer cho invoice nếu cần
      // await axios.post(`${API_URL}/api/insurance_accident/update_invoice_customer`, { invoice_id, customer_id: ... });
      // 5. Lưu đơn hàng vào localStorage và chuyển hướng
      const cartItem = {
        id: "GPA",
        name: "Bảo hiểm tai nạn con người 24/24",
        description: `${numPeople} người, Số tiền BH: ${amount?.toLocaleString(
          "vi-VN"
        )} VNĐ`,
        price: total,
        image: "/products/bic-tai-nan-24h.png",
        buyerName: accountInfo.fullName,
        buyerPhone: accountInfo.phone,
        buyerEmail: accountInfo.email,
        isSelected: true,
      };
      localStorage.setItem("cartItem", JSON.stringify(cartItem));
      setOrderSuccess(true);
      setTimeout(() => {
        window.location.href = "/gio-hang.html";
      }, 1000);
    } catch (error) {
      const err = error as any;
      alert(
        "Có lỗi khi đặt mua bảo hiểm: " +
          (err?.response?.data?.message || err?.message || "")
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 pt-[84px] py-12">
          <div className="max-w-5xl mx-auto mb-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((s, idx) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-2 ${
                        step >= s
                          ? "bg-red-600 text-white"
                          : "bg-gray-300 text-gray-400"
                      }`}
                    >
                      <span>{s}</span>
                    </div>
                    <span
                      className={`font-semibold text-left w-full block ${
                        step === s
                          ? "text-red-600"
                          : step > s
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {s === 1 && "Thông tin & Phí"}
                      {s === 2 && "Người tham gia"}
                      {s === 3 && "Tài khoản & Giao nhận"}
                    </span>
                  </div>
                  {s < 3 && <div className="w-16 h-1 bg-gray-300 mx-2"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {step === 1 && (
              <>
                {/* Form thông tin & phí */}
                <div className="bg-[#ededed] rounded-2xl shadow-lg p-8 mb-8 text-left max-w-5xl mx-auto">
                  <h2 className="text-2xl font-bold text-red-600 mb-4 text-left">
                    Thông tin
                  </h2>
                  <div className="flex items-center mb-4">
                    <label className="block text-base text-gray-800 w-1/3 whitespace-nowrap">
                      Số người tham gia bảo hiểm{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={numPeople}
                        onChange={handleNumPeopleChange}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 text-left text-base"
                        placeholder="Nhập số người tham gia (<= 100)"
                      />
                      {error && (
                        <div className="text-red-500 text-sm mt-1 text-left">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-base text-gray-800 w-1/3 whitespace-nowrap">
                      Số tiền bảo hiểm (/người){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <select
                        className="w-full border rounded px-3 py-2 text-left text-base"
                        value={amount || ""}
                        onChange={(e) =>
                          setAmount(Number(e.target.value) || null)
                        }
                      >
                        <option value="">-- Chọn số tiền BH --</option>
                        {insuranceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-2 text-left">
                    <span className="font-bold text-gray-800 text-base text-left">
                      Quyền lợi bảo hiểm
                    </span>
                  </div>
                  <div className="bg-white border rounded px-4 py-3 text-sm text-left text-base">
                    <div className="flex items-center border-b pb-2 mb-2">
                      <div className="font-semibold text-gray-700 w-1/3 whitespace-nowrap text-base">
                        Số tiền bảo hiểm:
                      </div>
                      <div className="w-2/3 text-base">
                        {selectedOption
                          ? selectedOption.benefit.soTien
                          : "0 VNĐ"}
                      </div>
                    </div>
                    <div className="flex items-center border-b pb-2 mb-2">
                      <div className="font-semibold text-gray-700 w-1/3 whitespace-nowrap text-base">
                        Thương tật vĩnh viễn do tai nạn:
                      </div>
                      <div className="w-2/3 text-base">
                        {selectedOption
                          ? selectedOption.benefit.thuongTatVV
                          : "Theo Bảng tỉ lệ trả tiền thương tật"}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="font-semibold text-gray-700 w-1/3 whitespace-nowrap pt-1 text-base">
                        Thương tật tạm thời:
                      </div>
                      <div className="w-2/3 whitespace-pre-line text-base">
                        {selectedOption
                          ? selectedOption.benefit.thuongTatTT
                          : "Nếu STBH <= 20 triệu: Theo Bảng tỉ lệ trả tiền thương tật\nNếu STBH > 20 triệu: Theo chi phí thực tế, không quá vết thương theo Bảng tỉ lệ trả tiền thương tật"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phí */}
                <div className="bg-white rounded-2xl shadow-lg p-6 text-left mt-8 mb-8 max-w-5xl mx-auto">
                  <p className="text-lg">
                    Tổng phí (miễn VAT):{" "}
                    <span className="text-red-600 font-bold">
                      {fee.toLocaleString("vi-VN")} VNĐ
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
                      {total.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-8">
                {/* Danh sách người tham gia bảo hiểm */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-red-600">
                    Danh sách người tham gia bảo hiểm
                  </h2>
                  {/* Table Header */}
                  <div className="grid grid-cols-11 gap-0 bg-red-600 text-white font-semibold text-sm rounded-t-md">
                    <div className="col-span-1 p-2 text-center border-r border-red-500">
                      STT
                    </div>
                    <div className="col-span-3 p-2 text-center border-r border-red-500">
                      Họ tên
                    </div>
                    <div className="col-span-2 p-2 text-center border-r border-red-500">
                      Giới tính
                    </div>
                    <div className="col-span-2 p-2 text-center border-r border-red-500">
                      Ngày sinh
                    </div>
                    <div className="col-span-3 p-2 text-center">
                      Số CMND/CCCD
                    </div>
                  </div>
                  {/* Table Body */}
                  <div className="bg-white rounded-b-md border border-t-0">
                    {participants.map((p, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-11 gap-0 items-center border-b last:border-b-0"
                      >
                        <div className="col-span-1 p-2 text-center border-r">
                          {index + 1}
                        </div>
                        <div className="col-span-3 p-1 border-r">
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Họ tên"
                            value={p.fullName}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded text-base"
                          />
                        </div>
                        <div className="col-span-2 p-1 border-r">
                          <select
                            name="gender"
                            value={p.gender}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded bg-white text-base"
                          >
                            <option value="">Chọn</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </div>
                        <div className="col-span-2 p-1 border-r">
                          <input
                            type="text"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => (e.target.type = "text")}
                            name="dob"
                            placeholder="Ngày sinh (dd/mm/yyyy)"
                            value={p.dob}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded text-base"
                          />
                        </div>
                        <div className="col-span-3 p-1">
                          <input
                            type="text"
                            name="idNumber"
                            placeholder="CMND/CCCD"
                            value={p.idNumber}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded text-base"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-left">
                    (Đối với trẻ em chưa có CMND/CCCD thì quý khách vui lòng
                    nhập số CMND/CCCD của bố hoặc mẹ)
                  </p>
                </div>
                {/* Thông tin Bên mua bảo hiểm */}
                <div className="bg-[#F4F6F8] p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold text-left mb-6 text-red-600">
                    Thông tin Bên mua bảo hiểm
                  </h3>
                  <div className="space-y-6">
                    {/* Loại người mua */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <div className="flex items-center gap-8">
                        <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                    )}
                    {/* Họ và tên */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        Họ và tên<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="fullName"
                          value={accountInfo.fullName}
                          onChange={handleAccountInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                        />
                      </div>
                    </div>
                    {/* Địa chỉ */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                    {/* Ngày hiệu lực bảo hiểm */}
                    <div className="flex items-center gap-8 mt-6">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        Ngày hiệu lực bảo hiểm{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="date"
                          value={insuranceStart}
                          onChange={(e) => setInsuranceStart(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                  <h4 className="text-xl font-bold mb-4">
                    Hình thức giao nhận
                  </h4>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-700">
                      Giấy chứng nhận bảo hiểm điện tử (có giá trị như bản giấy)
                      sẽ được gửi đến email Quý khách đăng ký ở trên sau khi
                      chúng tôi nhận được phí thanh toán
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-xl font-bold mb-4">
                    Thời điểm giao nhận
                  </h4>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-700">
                      Trong vòng 24 giờ kể từ thời điểm thanh toán phí
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nút điều hướng */}
            <div className="flex justify-between max-w-5xl mx-auto mt-8">
              <button
                className="px-6 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
                onClick={handleBack}
                disabled={step === 1}
              >
                Quay lại
              </button>
              {step < 3 ? (
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={handleNext}
                  disabled={step === 1 && (!numPeople || !amount || !!error)}
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={handleOrder}
                  disabled={
                    !accountInfo.fullName ||
                    !accountInfo.address ||
                    !accountInfo.email ||
                    !accountInfo.phone
                  }
                >
                  Xác nhận & Thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <CustomerSupport />
      <Footer />
      {/* Hiển thị thông báo thành công nếu orderSuccess */}
      {orderSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Đặt mua thành công!
            </h2>
            <p className="mb-4">Đơn hàng của bạn đã được lưu vào giỏ hàng.</p>
            <p>Đang chuyển hướng sang trang giỏ hàng...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ElectricityAccidentInsuranceOrderPage;
