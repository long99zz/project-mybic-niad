import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const CyberInsuranceOrderPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dang-nhap");
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState(1);
  const [numPeople, setNumPeople] = useState("");
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
  const [hasOtherCyberInsurance, setHasOtherCyberInsurance] = useState(false);
  const [otherCyberInsuranceCompany, setOtherCyberInsuranceCompany] =
    useState("");

  const fee = Number(numPeople) * 184000;
  const discount = 0;
  const total = fee - discount;

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
      if (!numPeople || !!error) return;
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
      const startDate = insuranceStart ? new Date(insuranceStart) : new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12); // Default to 12 months

      const payload = {
        invoice: {
          ProductID: 18,
          InsurancePackage: "Bảo hiểm an ninh mạng",
          InsuranceStart: startDate.toISOString(), // RFC3339 format
          InsuranceEnd: endDate.toISOString(), // RFC3339 format
          InsuranceAmount: total, // Tổng phí thực thu
          InsuranceQuantity: Number(numPeople),
          ContractType: "Mới",
          Status: "Chưa thanh toán",
        },
        participants: participants.map((p) => ({
          FullName: p.fullName,
          Gender:
            p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác",
          BirthDate: p.dob ? new Date(p.dob).toISOString() : null, // RFC3339 format
          IdentityNumber: p.idNumber,
        })),
      };

      const token = sessionStorage.getItem("token");

      // Kiểm tra xem có token không
      if (!token) {
        alert("Vui lòng đăng nhập để tiếp tục");
        window.location.href = "/dang-nhap";
        return;
      }

    const res = await axios.post(
      `${API_URL}/insurance_accident/create_accident`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const invoice_id = res.data.master_invoice_id;      // Lưu thông tin đơn hàng vào sessionStorage
      const orderInfo = {
        invoice_id: invoice_id,
        product_name: "Bảo hiểm an ninh mạng",
        insurance_amount: total,
        customer_name: accountInfo.fullName,
        created_at: new Date().toISOString(),
        insurance_start: insuranceStart,
        insurance_end: new Date(new Date(insuranceStart).setFullYear(
          new Date(insuranceStart).getFullYear() + 1
        )).toISOString(),
        status: "Chưa thanh toán",
        // Thông tin bổ sung
        insurance_package: "Bảo hiểm mạng xã hội",
        participants: participants.map(p => ({
          full_name: p.fullName,
          gender: p.gender,
          dob: p.dob,
          id_number: p.idNumber
        }))
      };
      sessionStorage.setItem('temp_order_info', JSON.stringify(orderInfo));
      
      // Chuyển hướng đến trang đặt hàng thành công (OrderSuccessPage sẽ xử lý payment)
      setOrderSuccess(true);
      setTimeout(() => {
        window.location.href = `/dat-hang-thanh-cong?master_invoice_id=${invoice_id}&amount=${total}`;
      }, 500);
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
              {[1, 2, 3].map((s) => (
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
                {/* Box Thông tin chuẩn như ảnh */}
                <div className="bg-[#ededed] rounded-2xl shadow-lg p-8 mb-8 max-w-5xl mx-auto">
                  <h2 className="text-2xl font-bold text-red-600 mb-4 text-left">
                    Thông tin
                  </h2>
                  <div className="border-t border-gray-300 mb-6"></div>
                  {/* Số người tham gia */}
                  <div className="flex items-center mb-6">
                    <label className="block text-lg font-medium text-gray-800 min-w-[220px] text-left">
                      Số người tham gia BH{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={numPeople}
                      onChange={handleNumPeopleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 text-base"
                      placeholder="Nhập số người tham gia (<= 100)"
                    />
                  </div>
                  {/* Phạm vi địa lý */}
                  <div className="flex items-center">
                    <label className="block text-lg font-medium text-gray-800 min-w-[220px] text-left">
                      Phạm vi địa lý
                    </label>
                    <div className="text-base">Toàn thế giới</div>
                  </div>
                </div>
                {/* Box tính phí bảo hiểm */}
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
                {/* Thông tin đã từng tham gia bảo hiểm an ninh mạng ở công ty khác */}
                <div className="bg-[#ededed] rounded-2xl shadow-lg p-6">
                  <div className="grid grid-cols-[450px_1fr] gap-y-4">
                    <label className="block text-base font-medium text-gray-800 text-left col-span-1 self-center">
                      NĐBH đã tham gia BH An ninh mạng tại Công ty BH khác?
                    </label>
                    <div className="flex items-center gap-4 col-span-1 justify-start">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="hasOtherCyberInsurance"
                          checked={hasOtherCyberInsurance === true}
                          onChange={() => setHasOtherCyberInsurance(true)}
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-2">Có</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="hasOtherCyberInsurance"
                          checked={hasOtherCyberInsurance === false}
                          onChange={() => setHasOtherCyberInsurance(false)}
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-2">Không</span>
                      </label>
                    </div>
                    <label className="block text-base font-medium text-gray-800 text-left col-span-1 self-center">
                      Tên công ty bảo hiểm đã tham gia
                    </label>
                    <input
                      type="text"
                      value={otherCyberInsuranceCompany}
                      onChange={(e) =>
                        setOtherCyberInsuranceCompany(e.target.value)
                      }
                      className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 text-base col-span-1"
                      disabled={!hasOtherCyberInsurance}
                      placeholder="Nhập tên công ty nếu có"
                    />
                  </div>
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
                      <>
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                            CMND/CCCD<span className="text-red-600">*</span>
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
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                            Họ và tên<span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="fullName"
                              value={accountInfo.fullName}
                              onChange={(e) =>
                                setAccountInfo((prev) => ({
                                  ...prev,
                                  fullName: e.target.value,
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
                  disabled={step === 1 && (!numPeople || !!error)}
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

export default CyberInsuranceOrderPage;
