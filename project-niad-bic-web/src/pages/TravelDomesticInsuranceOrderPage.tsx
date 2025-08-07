import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { Bell, UploadCloud } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DOMESTIC_TRAVEL_PRODUCT_ID = 12; // Bảo hiểm du lịch trong nước (TRV)

// Bảng phí bảo hiểm du lịch trong nước
const domesticTravelFeeTable = [
  { amount: 10000000, fee: 1500 },
  { amount: 20000000, fee: 3000 },
  { amount: 30000000, fee: 4500 },
  { amount: 40000000, fee: 6000 },
  { amount: 50000000, fee: 7500 },
  { amount: 60000000, fee: 9000 },
  { amount: 70000000, fee: 10500 },
  { amount: 80000000, fee: 12000 },
  { amount: 90000000, fee: 13500 },
  { amount: 100000000, fee: 15000 },
  { amount: 110000000, fee: 16500 },
  { amount: 120000000, fee: 18000 },
  { amount: 130000000, fee: 19500 },
  { amount: 140000000, fee: 21000 },
  { amount: 150000000, fee: 22500 },
  { amount: 160000000, fee: 24000 },
  { amount: 170000000, fee: 25500 },
  { amount: 180000000, fee: 27000 },
  { amount: 190000000, fee: 28500 },
  { amount: 200000000, fee: 30000 },
];

function getDomesticTravelFee(amount: number) {
  const found = domesticTravelFeeTable.find((row) => row.amount === amount);
  return found ? found.fee : 0;
}

function toISOStringDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split(".")[0] + "Z";
}

function TravelDomesticInsuranceOrderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dang-nhap");
    }
  }, [isAuthenticated, navigate]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    departureDate: "",
    returnDate: "",
    numberOfDays: 0,
    numberOfPeople: 1,
    itinerary: "",
  });

  const [participants, setParticipants] = useState([
    { fullName: "", gender: "", dob: "", idNumber: "" },
  ]);
  const [buyerInfo, setBuyerInfo] = useState({
    type: "individual" as "individual" | "organization",
    isParticipant: false,
    fullName: "",
    phone: "",
    email: "",
    address: "",
    identityCard: "",
    companyName: "",
    taxCode: "",
    companyAddress: "",
    insuranceTerm: 1,
    insuranceStartDate: "",
    invoice: false,
  });
  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [totalFee, setTotalFee] = useState(0);

  // Thêm state cho số tiền bảo hiểm được chọn
  const [selectedAmount, setSelectedAmount] = useState(10000000);

  useEffect(() => {
    const numPeople = Number(form.numberOfPeople) || 0;
    if (numPeople > 0) {
      setParticipants((currentParticipants) => {
        if (currentParticipants.length === numPeople) {
          return currentParticipants;
        }
        const newParticipants = Array.from({ length: numPeople }, (_, i) => {
          return (
            currentParticipants[i] || {
              fullName: "",
              gender: "",
              dob: "",
              idNumber: "",
            }
          );
        });
        return newParticipants;
      });
    }
  }, [form.numberOfPeople]);

  useEffect(() => {
    if (form.departureDate && form.returnDate) {
      const start = new Date(form.departureDate);
      const end = new Date(form.returnDate);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setForm((prev) => ({ ...prev, numberOfDays: diffDays }));
      } else {
        setForm((prev) => ({ ...prev, numberOfDays: 0 }));
      }
    }
  }, [form.departureDate, form.returnDate]);

  useEffect(() => {
    const numPeople = Number(form.numberOfPeople) || 0;
    const numDays = Number(form.numberOfDays) || 0;
    const feePerPersonPerDay = getDomesticTravelFee(selectedAmount);
    setTotalFee(feePerPersonPerDay * numPeople * numDays);
  }, [form.numberOfPeople, form.numberOfDays, selectedAmount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuyerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setBuyerInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInvoiceChange = (value: string) => {
    setBuyerInfo((prev) => ({ ...prev, invoice: value === "true" }));
  };

  const firstParticipantFullName = participants[0]?.fullName;
  const firstParticipantIdNumber = participants[0]?.idNumber;

  useEffect(() => {
    if (buyerInfo.isParticipant) {
      setBuyerInfo((prev) => ({
        ...prev,
        fullName: firstParticipantFullName || "",
        identityCard: firstParticipantIdNumber || "",
      }));
    }
  }, [
    buyerInfo.isParticipant,
    firstParticipantFullName,
    firstParticipantIdNumber,
  ]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Bước xác nhận & thanh toán
      try {
        // Lấy token từ session storage
        const token = sessionStorage.getItem('token');
        console.log("[DEBUG] Token when submitting:", token);

        // Kiểm tra xem có token không
        if (!token) {
          console.log("[DEBUG] No token found when submitting, redirecting to login");
          // Lưu đường dẫn hiện tại để quay lại sau khi đăng nhập
          sessionStorage.setItem('redirectPath', window.location.pathname);
          alert("Vui lòng đăng nhập để tiếp tục");
          navigate('/login');
          return;
        }
        
        // 1. Tạo hóa đơn du lịch trong nước
        const invoiceRes = await axios.post(
          `${API_URL}/api/insurance_travel/create_travel_invoice`,
          {
            departure_location: form.itinerary || "",
            destination: "Trong nước",
            departure_date: toISOStringDate(form.departureDate),
            return_date: toISOStringDate(form.returnDate),
            total_duration: form.numberOfDays,
            group_size: form.numberOfPeople,
            total_amount: totalFee,
            status: "Chưa thanh toán",
            product_id: DOMESTIC_TRAVEL_PRODUCT_ID,
            participants: participants.map((p) => ({
              full_name: p.fullName,
              gender:
                p.gender === "male"
                  ? "Nam"
                  : p.gender === "female"
                  ? "Nữ"
                  : "Khác",
              birth_date: toISOStringDate(p.dob),
              identity_number: p.idNumber,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("[DEBUG] Response create_travel_invoice:", invoiceRes.data);
        const invoice_id = invoiceRes.data.invoice_id;

        // 2. Đăng ký khách hàng
        const customerRes = await axios.post(
          `${API_URL}/api/insurance_travel/create_customer_registration`,
          {
            customer_type:
              buyerInfo.type === "individual" ? "Cá nhân" : "Tổ chức",
            identity_number: buyerInfo.identityCard,
            full_name: buyerInfo.fullName,
            address: buyerInfo.address,
            email: buyerInfo.email,
            phone_number: buyerInfo.phone,
            invoice_request: buyerInfo.invoice,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("[DEBUG] Response create_customer_registration:", customerRes.data);
        const customer_id = customerRes.data.customer_id;

        // 3. Gán customer_id vào hóa đơn
        await axios.post(
          `${API_URL}/api/insurance_travel/update_invoice_customer`,
          {
            invoice_id,
            customer_id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("[DEBUG] Update invoice customer successful");
        alert("Đặt mua bảo hiểm thành công!");
        // Lưu đơn hàng vào localStorage
        const cartItem = {
          id: "TRAVEL_DOMESTIC",
          name: "Bảo hiểm du lịch trong nước",
          description: `${form.numberOfPeople} người, ${form.numberOfDays} ngày, hành trình: ${form.itinerary}`,
          price: totalFee,
          image: "/products/bic-travel-care.png",
          buyerName: buyerInfo.fullName,
          buyerPhone: buyerInfo.phone,
          buyerEmail: buyerInfo.email,
          isSelected: true,
        };
        localStorage.setItem("cartItem", JSON.stringify(cartItem));
        // Chuyển hướng sang giỏ hàng
        window.location.href = "/gio-hang.html";
      } catch (error: any) {
        console.error("[ERROR] Thực hiện đặt bảo hiểm:", error);
        if (error.response) {
          console.error("[ERROR] Response data:", error.response.data);
          console.error("[ERROR] Response status:", error.response.status);
        }
        alert(
          "Có lỗi xảy ra khi đặt mua bảo hiểm: " +
            (error?.response?.data?.error || error.message)
        );
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    } else {
      window.history.back();
    }
  };

  const handleParticipantChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newParticipants = [...participants];
    const { name, value } = event.target;
    newParticipants[index] = {
      ...newParticipants[index],
      [name]: value,
    };
    setParticipants(newParticipants);
  };

  const handleAccountInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo((prev) => ({ ...prev, [name]: value }));
  };

  const copyBuyerToAccountInfo = () => {
    setAccountInfo({
      fullName: buyerInfo.fullName,
      email: buyerInfo.email,
      phone: buyerInfo.phone,
      address: buyerInfo.address,
    });
  };

  // Tạo mảng feeRows cho bảng tính phí
  const feeRows = [
    ["Hình thức bảo hiểm", "Bảo hiểm trọn gói theo chuyến"],
    ["Phạm vi bảo hiểm", "Trong lãnh thổ Việt Nam"],
    [
      "Ngày đi",
      form.departureDate
        ? new Date(form.departureDate).toLocaleDateString("vi-VN")
        : "--",
    ],
    [
      "Ngày về",
      form.returnDate
        ? new Date(form.returnDate).toLocaleDateString("vi-VN")
        : "--",
    ],
    ["Số ngày đi", form.numberOfDays + " ngày"],
    ["Số người trong đoàn", form.numberOfPeople + " người"],
    ["Số tiền bảo hiểm", null],
    ["Tổng phí (miễn VAT)", totalFee.toLocaleString("vi-VN") + " VNĐ"],
    ["Số tiền chiết khấu", "0 VNĐ"],
  ];

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500";
  const handleCustomerInfoChange = (
    field: keyof typeof buyerInfo,
    value: any
  ) => {
    setBuyerInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 pt-[84px] pb-12">
          {/* Progress Bar */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-start justify-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 z-10 ${
                    step >= 1 ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    step >= 1 ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  Thông tin chung
                </span>
              </div>

              {/* Connector */}
              <div
                className={`flex-auto border-t-2 mt-8 ${
                  step > 1 ? "border-red-600" : "border-gray-300"
                }`}
              ></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 z-10 ${
                    step >= 2 ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    step >= 2 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Chương trình bảo hiểm
                </span>
              </div>

              {/* Connector */}
              <div
                className={`flex-auto border-t-2 mt-8 ${
                  step > 2 ? "border-red-600" : "border-gray-300"
                }`}
              ></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 z-10 ${
                    step >= 3 ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    step >= 3 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Thông tin người được bảo hiểm
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-8 text-red-600 text-left">
                  Thông tin chung
                </h2>
                <div className="space-y-6">
                  {/* Số người trong đoàn */}
                  <div className="flex items-start gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                      Số người trong đoàn{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="number"
                        name="numberOfPeople"
                        onChange={handleChange}
                        value={form.numberOfPeople}
                        min="1"
                        max="250"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Nhập số người trong đoàn"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        (Ít nhất 1, nhiều nhất 250 người)
                      </p>
                    </div>
                  </div>
                  {/* Ngày đi */}
                  <div className="flex items-start gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                      Ngày đi <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="date"
                        name="departureDate"
                        onChange={handleChange}
                        value={form.departureDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Chọn ngày, giờ khởi hành"
                      />
                    </div>
                  </div>
                  {/* Ngày về */}
                  <div className="flex items-start gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                      Ngày về <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="date"
                        name="returnDate"
                        onChange={handleChange}
                        value={form.returnDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Chọn ngày về"
                      />
                    </div>
                  </div>
                  {/* Số ngày du lịch */}
                  <div className="flex items-start gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                      Số ngày du lịch
                    </label>
                    <div className="flex-1">
                      <input
                        type="number"
                        name="numberOfDays"
                        value={form.numberOfDays}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        placeholder="Số ngày du lịch"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        (Tối đa 180 ngày)
                      </p>
                    </div>
                  </div>
                  {/* Hành trình */}
                  <div className="flex items-start gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                      Hành trình
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="itinerary"
                        value={form.itinerary || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Hành trình"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        (Ví dụ: Hà Nội - Nha Trang - Đà Lạt - Hà Nội)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-red-600 text-left">
                    Tính phí bảo hiểm du lịch nội địa
                  </h2>
                  <table className="w-full">
                    <tbody>
                      {feeRows.map((row, idx) => {
                        if (row[0] === "Số tiền bảo hiểm") {
                          return (
                            <tr
                              key="selectedAmount"
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-gray-200"
                              }
                            >
                              <td className="py-2 px-4 font-semibold text-left w-1/3">
                                Số tiền bảo hiểm
                              </td>
                              <td className="py-2 px-4 text-left">
                                <select
                                  value={selectedAmount}
                                  onChange={(e) =>
                                    setSelectedAmount(Number(e.target.value))
                                  }
                                  className="p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                >
                                  {domesticTravelFeeTable.map((opt) => (
                                    <option key={opt.amount} value={opt.amount}>
                                      {opt.amount.toLocaleString("vi-VN")} VNĐ
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        }
                        return (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-200"
                            }
                          >
                            <td className="py-2 px-4 font-semibold text-left w-1/3">
                              {row[0]}
                            </td>
                            <td className="py-2 px-4 text-left">{row[1]}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td
                          colSpan={2}
                          className="pt-6 pl-4 pb-2 text-left font-bold text-lg"
                        >
                          Quyền lợi bảo hiểm:
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-4 font-semibold text-left w-1/3">
                          Trường hợp tai nạn
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="py-1 px-4 italic text-left w-1/3">
                          Chết do tai nạn:
                        </td>
                        <td className="py-1 px-4 text-left">
                          {selectedAmount.toLocaleString("vi-VN")} VNĐ
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-4 italic text-left w-1/3">
                          Bị thương tật do tai nạn:
                        </td>
                        <td className="py-1 px-4 text-left">
                          Theo{" "}
                          <span className="text-red-600 font-semibold">
                            Bảng tỉ lệ trả tiền bảo hiểm thương tật
                          </span>
                          , tối đa tới {selectedAmount.toLocaleString("vi-VN")}{" "}
                          VNĐ
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-4 font-semibold text-left w-1/3">
                          Trường hợp ốm đau, bệnh tật
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td className="py-1 px-4 italic text-left w-1/3">
                          Chết do ốm đau, bệnh tật:
                        </td>
                        <td className="py-1 px-4 text-left">
                          {(selectedAmount / 2).toLocaleString("vi-VN")} VNĐ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Danh sách người tham gia bảo hiểm luôn nằm trong bước 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-red-600 text-left">
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
                      Số CMND /Hộ chiếu
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
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded"
                          />
                        </div>
                        <div className="col-span-2 p-1 border-r">
                          <select
                            name="gender"
                            value={p.gender}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded bg-white"
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
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded"
                          />
                        </div>
                        <div className="col-span-3 p-1">
                          <input
                            type="text"
                            name="idNumber"
                            placeholder="CMND/CCCD"
                            value={p.idNumber}
                            onChange={(e) => handleParticipantChange(index, e)}
                            className="w-full p-2 border-0 focus:ring-1 focus:ring-red-500 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-left">
                    (Đối với trẻ em chưa có CMND/Hộ chiếu thì quý khách vui lòng
                    nhập số CMND/Hộ chiếu của bố hoặc mẹ)
                  </p>
                </div>

                {/* Thông tin bên mua bảo hiểm */}
                <div className="bg-[#F4F6F8] p-6 rounded-lg">
                  <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
                    Thông tin Bên mua bảo hiểm
                  </h3>
                  <div className="space-y-6">
                    {/* Loại người mua */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Người mua <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <select
                          name="type"
                          value={buyerInfo.type}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-base"
                        >
                          <option value="individual">Cá nhân</option>
                          <option value="organization">Tổ chức</option>
                        </select>
                      </div>
                    </div>
                    {/* CMND/CCCD hoặc thông tin tổ chức */}
                    {buyerInfo.type === "organization" ? (
                      <>
                        <div className="flex items-start gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                            Tên công ty<span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="companyName"
                              value={buyerInfo.companyName}
                              onChange={handleBuyerInfoChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                            Mã số thuế<span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="taxCode"
                              value={buyerInfo.taxCode}
                              onChange={handleBuyerInfoChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                            Địa chỉ công ty
                            <span className="text-red-600">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              name="companyAddress"
                              value={buyerInfo.companyAddress}
                              onChange={handleBuyerInfoChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-8">
                        <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                          CMND/CCCD
                          <span className="text-red-600">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={buyerInfo.identityCard}
                            onChange={(e) =>
                              handleCustomerInfoChange(
                                "identityCard",
                                e.target.value
                              )
                            }
                            className={inputClassName}
                            placeholder="Nhập CMND/CCCD"
                          />
                        </div>
                      </div>
                    )}
                    {/* Họ và tên */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        {buyerInfo.type === "organization"
                          ? "Tên công ty/ Tổ chức"
                          : "Họ và tên"}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={buyerInfo.fullName}
                          onChange={(e) =>
                            handleCustomerInfoChange("fullName", e.target.value)
                          }
                          className={inputClassName}
                          placeholder={
                            buyerInfo.type === "organization"
                              ? "Nhập tên công ty/ tổ chức"
                              : "Nhập họ và tên"
                          }
                        />
                      </div>
                    </div>
                    {/* Địa chỉ */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Địa chỉ<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="address"
                          value={buyerInfo.address}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Email nhận thông báo{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="email"
                          name="email"
                          value={buyerInfo.email}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {/* Số điện thoại */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Số điện thoại di động{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={buyerInfo.phone}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {/* Thời hạn bảo hiểm */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Thời hạn bảo hiểm
                      </label>
                      <div className="flex-1 text-base text-left pl-2">
                        Từ ngày{" "}
                        <span className="text-red-600 font-bold">
                          {form.departureDate
                            ? new Date(form.departureDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "--"}
                        </span>
                        {form.departureDate && form.returnDate && (
                          <>
                            {" "}
                            - Đến ngày{" "}
                            <span className="text-red-600 font-bold">
                              {new Date(form.returnDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Xuất hóa đơn */}
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                        Xuất hóa đơn
                      </label>
                      <div className="flex-1 flex gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="invoice"
                            value="false"
                            checked={!buyerInfo.invoice}
                            onChange={() => handleInvoiceChange("false")}
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="ml-2">Không nhận hóa đơn</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="invoice"
                            value="true"
                            checked={!!buyerInfo.invoice}
                            onChange={() => handleInvoiceChange("true")}
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="ml-2">Có nhận hóa đơn</span>
                        </label>
                      </div>
                    </div>
                    {buyerInfo.invoice && (
                      <p className="text-sm text-gray-600 mt-2">
                        Theo quy định của Nhà nước tại Nghị định số
                        123/2020/NĐ-CP và thông tư số 78/2021/TT-BTC, BIC sẽ
                        cung cấp hóa đơn GTGT dưới dạng hóa đơn điện tử và gửi
                        đến quý khách qua email đã đăng ký khi mua hàng.
                      </p>
                    )}
                  </div>
                </div>

                {/* Tổng phí */}
                <div className="bg-white rounded-2xl shadow-lg p-6 text-left mt-8">
                  <p className="text-lg">
                    Tổng phí (miễn VAT):{" "}
                    <span className="text-red-600 font-bold">
                      {totalFee.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </p>
                  <p className="text-lg">
                    Số tiền chiết khấu:{" "}
                    <span className="text-red-600 font-bold">0 VNĐ</span>
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
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-red-600 mb-6">
                    Thông tin tài khoản
                  </h3>
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={copyBuyerToAccountInfo}
                      className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                      Sao chép từ thông tin bên mua bảo hiểm
                    </button>
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
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
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
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
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
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
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
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

            {/* Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-10 py-3 bg-white border border-gray-400 rounded-lg text-lg font-bold text-gray-800 hover:bg-gray-100 transition-all"
              >
                Quay lại
              </button>
              <button
                onClick={handleNext}
                className="px-10 py-3 bg-red-600 text-white rounded-lg text-lg font-bold hover:bg-red-700 transition-all"
              >
                {step === 3 ? "Xác nhận & Thanh toán" : "Tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CustomerSupport />
      <Footer />
    </>
  );
}

export default TravelDomesticInsuranceOrderPage;
