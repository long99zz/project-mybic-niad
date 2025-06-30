import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { Bell, UploadCloud } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const regions = [
  {
    value: "asean",
    label:
      "ASEAN: Brunei, Campuchia, Indonesia, Lào, Malaysia, Myanmar (Burma), Philippines, Singapore, Thái Lan, Đông Timo.",
  },
  {
    value: "asia",
    label: "CHÂU Á: Các nước Châu Á, loại trừ Nhật Bản, Úc, New Zealand.",
  },
  {
    value: "global",
    label: "TOÀN CẦU: Các nước còn lại (bao gồm Nhật Bản, Úc, New Zealand).",
  },
];

const insurancePrograms = {
  A: {
    benefits_vnd: 250000000,
    benefits_usd: 9502,
    benefits_eur: 8031,
    fee: 50000,
  },
  B: {
    benefits_vnd: 500000000,
    benefits_usd: 19004,
    benefits_eur: 16062,
    fee: 75000,
  },
  C: {
    benefits_vnd: 750000000,
    benefits_usd: 28506,
    benefits_eur: 24093,
    fee: 100000,
  },
  D: {
    benefits_vnd: 1250000000,
    benefits_usd: 47510,
    benefits_eur: 40155,
    fee: 125000,
  },
  E: {
    benefits_vnd: 2500000000,
    benefits_usd: 95021,
    benefits_eur: 80310,
    fee: 150000,
  },
};

type InsuranceProgramKey = keyof typeof insurancePrograms;

// 1. Thêm bảng phí chuẩn hóa
const travelFeeTable = {
  asean: [
    { maxDay: 3, A: 125000, B: 150000, C: 175000, D: 225000, E: 275000 },
    { maxDay: 5, A: 150000, B: 200000, C: 250000, D: 325000, E: 375000 },
    { maxDay: 8, A: 200000, B: 275000, C: 300000, D: 375000, E: 450000 },
    { maxDay: 15, A: 250000, B: 300000, C: 375000, D: 475000, E: 650000 },
    { maxDay: 24, A: 350000, B: 425000, C: 500000, D: 650000, E: 900000 },
    { maxDay: 31, A: 425000, B: 475000, C: 650000, D: 900000, E: 1075000 },
    { maxDay: 45, A: 600000, B: 675000, C: 975000, D: 1300000, E: 1650000 },
    { maxDay: 60, A: 725000, B: 825000, C: 1275000, D: 1675000, E: 1950000 },
    { maxDay: 90, A: 1025000, B: 1100000, C: 1850000, D: 2300000, E: 2900000 },
    { maxDay: 120, A: 1300000, B: 1375000, C: 2375000, D: 3000000, E: 3600000 },
    { maxDay: 150, A: 1575000, B: 1650000, C: 2900000, D: 3450000, E: 4450000 },
    { maxDay: 180, A: 1850000, B: 1900000, C: 3475000, D: 4325000, E: 5275000 },
  ],
  asia: [
    { maxDay: 3, A: 150000, B: 175000, C: 200000, D: 250000, E: 300000 },
    { maxDay: 5, A: 200000, B: 225000, C: 300000, D: 375000, E: 400000 },
    { maxDay: 8, A: 275000, B: 300000, C: 400000, D: 525000, E: 600000 },
    { maxDay: 15, A: 325000, B: 375000, C: 425000, D: 550000, E: 875000 },
    { maxDay: 24, A: 450000, B: 575000, C: 700000, D: 775000, E: 1225000 },
    { maxDay: 31, A: 525000, B: 700000, C: 875000, D: 1050000, E: 1375000 },
    { maxDay: 45, A: 700000, B: 860000, C: 1300000, D: 1725000, E: 2050000 },
    { maxDay: 60, A: 1125000, B: 1375000, C: 1875000, D: 2400000, E: 2900000 },
    { maxDay: 90, A: 1625000, B: 1925000, C: 2465000, D: 3075000, E: 4625000 },
    { maxDay: 120, A: 1675000, B: 1900000, C: 3475000, D: 4000000, E: 4600000 },
    { maxDay: 150, A: 1825000, B: 1950000, C: 3550000, D: 4425000, E: 5750000 },
  ],
  global: [
    { maxDay: 3, A: 175000, B: 225000, C: 275000, D: 300000, E: 325000 },
    { maxDay: 5, A: 250000, B: 300000, C: 375000, D: 450000, E: 500000 },
    { maxDay: 8, A: 300000, B: 350000, C: 425000, D: 625000, E: 700000 },
    { maxDay: 15, A: 350000, B: 450000, C: 625000, D: 800000, E: 1125000 },
    { maxDay: 24, A: 500000, B: 625000, C: 850000, D: 1100000, E: 1400000 },
    { maxDay: 31, A: 675000, B: 875000, C: 1075000, D: 1400000, E: 1900000 },
    { maxDay: 45, A: 1150000, B: 1295000, C: 2075000, D: 2475000, E: 3300000 },
    { maxDay: 60, A: 1425000, B: 1900000, C: 2475000, D: 3150000, E: 4225000 },
    { maxDay: 90, A: 1725000, B: 2000000, C: 3650000, D: 4550000, E: 5425000 },
    { maxDay: 120, A: 1950000, B: 2000000, C: 3650000, D: 4550000, E: 6625000 },
  ],
};

// 2. Hàm tra cứu phí theo bảng
function getTravelInsuranceFee(
  region: keyof typeof travelFeeTable,
  program: "A" | "B" | "C" | "D" | "E",
  days: number
): number {
  const table = travelFeeTable[region] || [];
  for (let i = 0; i < table.length; i++) {
    if (days <= table[i].maxDay) {
      return table[i][program] || 0;
    }
  }
  // Nếu vượt quá max, lấy dòng cuối cùng
  if (table.length > 0) return table[table.length - 1][program] || 0;
  return 0;
}

function formatDateToISOString(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split(".")[0] + "Z";
}

function TravelInsuranceOrderPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destination: "",
    departureDate: "",
    returnDate: "",
    numberOfDays: 0,
    numberOfPeople: 1,
    currency: "vnd",
  });

  const [insuranceProgram, setInsuranceProgram] =
    useState<InsuranceProgramKey>("A");
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
  const [wantsInvoice, setWantsInvoice] = useState(false);

  const [totalFee, setTotalFee] = useState(0);
  const totalSteps = 4;

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
    // Xác định vùng, chương trình, số ngày
    const region = form.destination as "asean" | "asia" | "global";
    const program = insuranceProgram;
    const days = form.numberOfDays;
    const numPeople = participants.length || form.numberOfPeople;

    // Kiểm tra có người trên 70 tuổi không
    let hasOver70 = false;
    for (const p of participants) {
      if (p.dob) {
        const dob = new Date(p.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age >= 70) {
          hasOver70 = true;
          break;
        }
      }
    }

    // Tính phí cơ bản
    let feePerPerson = ["asean", "asia", "global"].includes(region)
      ? getTravelInsuranceFee(region, program, days)
      : 0;
    // Nếu có người trên 70 tuổi, nhân 1.5
    if (hasOver70) feePerPerson = Math.round(feePerPerson * 1.5);
    const calculatedFee = feePerPerson * numPeople;
    setTotalFee(calculatedFee);
  }, [
    insuranceProgram,
    form.numberOfDays,
    participants,
    form.numberOfPeople,
    form.destination,
    form.returnDate,
    form.departureDate,
  ]);

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
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Bước xác nhận & thanh toán
      try {
        // 1. Tạo invoice du lịch quốc tế
        const travelInvoicePayload = {
          departure_location: "Việt Nam",
          destination: form.destination,
          departure_date: formatDateToISOString(form.departureDate),
          return_date: formatDateToISOString(form.returnDate),
          total_duration: form.numberOfDays,
          group_size: participants.length || form.numberOfPeople,
          insurance_program: insuranceProgram,
          total_amount: totalFee,
          product_id: 6,
          participants: participants.map((p) => ({
            full_name: p.fullName,
            gender:
              p.gender === "male"
                ? "Nam"
                : p.gender === "female"
                ? "Nữ"
                : "Khác",
            birth_date: formatDateToISOString(p.dob),
            identity_number: p.idNumber,
          })),
        };
        console.log(
          "Payload gửi lên /create_travel_invoice:",
          travelInvoicePayload
        );
        const invoiceRes = await axios.post(
          `${API_URL}/api/insurance_travel/create_travel_invoice`,
          travelInvoicePayload
        );
        const invoice_id = invoiceRes.data.invoice_id;
        const form_id = invoiceRes.data.form_id;

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
          }
        );
        const customer_id = customerRes.data.customer_id;

        // 3. Gán customer_id vào hóa đơn
        await axios.post(
          `${API_URL}/api/insurance_travel/update_invoice_customer`,
          {
            invoice_id,
            customer_id,
          }
        );
        alert("Đặt mua bảo hiểm thành công!");
        // Lưu đơn hàng vào localStorage
        const cartItem = {
          id: "TRAVEL",
          name: "Bảo hiểm du lịch quốc tế",
          description: `Chương trình ${insuranceProgram}, ${form.numberOfPeople} người, ${form.numberOfDays} ngày, điểm đến: ${form.destination}`,
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
        alert(
          "Có lỗi xảy ra khi đặt mua bảo hiểm: " +
            (error?.response?.data?.message || error.message)
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 pt-[84px] py-12">
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

              {/* Connector */}
              <div
                className={`flex-auto border-t-2 mt-8 ${
                  step > 3 ? "border-red-600" : "border-gray-300"
                }`}
              ></div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 z-10 ${
                    step >= 4 ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    step >= 4 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  Thanh toán
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
                  {/* Form Step 1 */}
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold text-left pr-4">
                      Điểm khởi hành
                    </label>
                    <input
                      type="text"
                      value="Việt Nam"
                      disabled
                      className="w-2/3 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
                      Điểm đến <span className="">*</span>
                    </label>
                    <div className="w-2/3">
                      <select
                        name="destination"
                        onChange={handleChange}
                        value={form.destination}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Vui lòng chọn</option>
                        {regions.map((region) => (
                          <option key={region.value} value={region.value}>
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold text-left pr-4">
                      Ngày đi <span className="">*</span>
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      onChange={handleChange}
                      value={form.departureDate}
                      className="w-2/3 p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
                      Ngày về <span className="">*</span>
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      onChange={handleChange}
                      value={form.returnDate}
                      className="w-2/3 p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
                      Số ngày du lịch
                    </label>
                    <div className="w-2/3">
                      <input
                        type="number"
                        name="numberOfDays"
                        value={form.numberOfDays}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Hệ thống tự động tính
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
                      Số người trong đoàn <span className="">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="number"
                        name="numberOfPeople"
                        onChange={handleChange}
                        value={form.numberOfPeople}
                        min="1"
                        max="20"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Nhập số người tham gia bảo hiểm (tối đa 20 người)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-top gap-8">
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
                      Loại tiền tệ <span className="">*</span>
                    </label>
                    <div className="w-2/3">
                      <select
                        name="currency"
                        onChange={handleChange}
                        value={form.currency}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="vnd">VND</option>
                        <option value="usd">USD</option>
                      </select>
                      <p className="text-sm text-gray-600 mt-1 italic">
                        Lưu ý: Theo quy định của Bộ tài chính, từ ngày 1/6/2015
                        Tổng Công ty Bảo hiểm BIDV chỉ sử dụng đơn vị tiền tệ là
                        VND đối với quyền lợi và phí Bảo hiểm Du lịch quốc tế.
                        Trường hợp Quý khách xin visa mà Đại sứ quán yêu cầu
                        phải mua mức quyền lợi tối thiểu bằng ngoại tệ (USD hoặc
                        EUR), chúng tôi sẽ hướng dẫn Quý khách chọn chương trình
                        bảo hiểm phù hợp ở bước tính phí kế tiếp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lưu ý vùng lãnh thổ */}
                <div className="mt-8 text-left">
                  <div className="flex items-center mb-2 text-left">
                    <span className="text-xl text-red-600 mr-2">🔔</span>
                    <span className="text-lg font-bold text-red-600 text-left">
                      ĐIỂM ĐẾN GỒM CÁC VÙNG, LÃNH THỔ SAU
                    </span>
                  </div>
                  <div className="pl-8 space-y-1 text-left">
                    <div>
                      <span className="font-bold text-gray-800 text-left">
                        ASEAN:
                      </span>{" "}
                      Các nước thuộc khu vực ASEAN
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-left">
                        CHÂU Á:
                      </span>{" "}
                      Các nước Châu Á (loại trừ Nhật Bản, Úc, New Zealand)
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-left">
                        TOÀN CẦU:
                      </span>{" "}
                      Các nước còn lại (bao gồm Nhật Bản, Úc, New Zealand)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                {/* Summary chuyển thành bảng */}
                <div className="bg-gray-100 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-red-600">
                    Tính phí bảo hiểm du lịch quốc tế
                  </h2>
                  <table className="w-full">
                    <tbody>
                      {[
                        ["Điểm khởi hành", "Việt Nam"],
                        [
                          "Điểm đến",
                          regions
                            .find((r) => r.value === form.destination)
                            ?.label.split(":")[0] || "--",
                        ],
                        [
                          "Ngày đi",
                          form.departureDate
                            ? new Date(form.departureDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "--",
                        ],
                        [
                          "Ngày về",
                          form.returnDate
                            ? new Date(form.returnDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "--",
                        ],
                        ["Tổng thời gian", form.numberOfDays + " ngày"],
                        ["Số người trong đoàn", form.numberOfPeople + " người"],
                      ].map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-200"}
                        >
                          <td className="py-2 px-4 font-semibold text-left w-1/3">
                            {row[0]}
                          </td>
                          <td className="py-2 px-4 text-left">{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Insurance Program */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 text-red-600">
                    Chương trình bảo hiểm
                  </h2>
                  <div className="space-y-8">
                    {Object.entries(insurancePrograms).map(([key, program]) => (
                      <div key={key}>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="insuranceProgram"
                            value={key}
                            checked={insuranceProgram === key}
                            onChange={(e) =>
                              setInsuranceProgram(
                                e.target.value as InsuranceProgramKey
                              )
                            }
                            className="h-6 w-6 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-xl font-bold text-gray-800">
                            CHƯƠNG TRÌNH {key}
                          </span>
                        </label>
                        <div className="mt-3 border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-3 text-center bg-red-600 text-white font-bold">
                            <div className="p-3">Quyền lợi tối đa (VND)</div>
                            <div className="p-3 border-l border-red-500">
                              USD (Tham khảo)
                            </div>
                            <div className="p-3 border-l border-red-500">
                              EUR (Tham khảo)
                            </div>
                          </div>
                          <div className="grid grid-cols-3 text-center bg-gray-100">
                            <div className="p-4 font-semibold text-lg">
                              {program.benefits_vnd.toLocaleString("vi-VN")}
                            </div>
                            <div className="p-4 font-semibold text-lg border-l border-gray-200">
                              ≈ $ {program.benefits_usd.toLocaleString("en-US")}
                            </div>
                            <div className="p-4 font-semibold text-lg border-l border-gray-200">
                              ≈ € {program.benefits_eur.toLocaleString("en-US")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                {/* Participants */}
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

                {/* Thông tin Bên mua bảo hiểm */}
                <div className="bg-[#F4F6F8] p-6 rounded-lg">
                  <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
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
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                            Mã số thuế <span className="text-red-600">*</span>
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
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                            Tên công ty/ Tổ chức{" "}
                            <span className="text-red-600">*</span>
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
                        <div className="flex items-center gap-8">
                          <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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
                          CMND/CCCD <span className="text-red-600">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            name="identityCard"
                            value={buyerInfo.identityCard}
                            onChange={handleBuyerInfoChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                          value={buyerInfo.fullName}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                          value={buyerInfo.address}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                          value={buyerInfo.email}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                          value={buyerInfo.phone}
                          onChange={handleBuyerInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {/* Thời hạn bảo hiểm */}
                    <div className="flex items-center gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
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

            {step === 4 && (
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
                {step === totalSteps ? "Xác nhận & Thanh toán" : "Tiếp tục"}
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

export default TravelInsuranceOrderPage;
