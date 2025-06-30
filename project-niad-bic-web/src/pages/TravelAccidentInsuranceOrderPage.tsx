import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { Bell, UploadCloud } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const regions = [
  { value: "vietnam", label: "Vùng 1 - Việt Nam" },
  { value: "asean", label: "Vùng 2 - Đông Nam Á (Trừ Việt Nam)" },
  { value: "asia", label: "Vùng 3 - Châu Á, Thái Bình Dương (Trừ Việt Nam)" },
  { value: "global", label: "Vùng 4 - Toàn thế giới (Trừ Việt Nam)" },
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

// Bảng phí bảo hiểm chuẩn hóa từ ảnh
const travelCareFeeTable = {
  vietnam: {
    basic: {
      individual: [60000, 90000, 110000, 150000, 40000],
      family: [120000, 180000, 220000, 300000, 80000],
    },
    standard: {
      individual: [null, null, null, null, null],
      family: [null, null, null, null, null],
    },
    advanced: {
      individual: [null, null, null, null, null],
      family: [null, null, null, null, null],
    },
    comprehensive: {
      individual: [null, null, null, null, null],
      family: [null, null, null, null, null],
    },
    toandien: {
      individual: [144600, 211200, 254000, 344000, 89000],
      family: [289200, 422400, 508000, 688000, 178000],
    },
    nangcao: {
      individual: [170000, 240000, 290000, 390000, 100000],
      family: [340000, 480000, 580000, 780000, 200000],
    },
  },
  asean: {
    basic: {
      individual: [60000, 90000, 110000, 150000, 40000],
      family: [120000, 180000, 220000, 300000, 80000],
    },
    toandien: {
      individual: [110800, 144400, 189200, 221400, 78000],
      family: [221600, 288800, 378400, 442800, 156000],
    },
    nangcao: {
      individual: [120000, 160000, 220000, 260000, 80000],
      family: [240000, 320000, 440000, 520000, 160000],
    },
  },
  asia: {
    basic: {
      individual: [60000, 90000, 110000, 150000, 40000],
      family: [120000, 180000, 220000, 300000, 80000],
    },
    toandien: {
      individual: [110800, 144400, 189400, 222000, 79000],
      family: [221600, 288800, 378800, 444000, 158000],
    },
    nangcao: {
      individual: [120000, 160000, 220000, 260000, 100000],
      family: [240000, 320000, 440000, 600000, 200000],
    },
  },
  global: {
    basic: {
      individual: [144600, 211200, 254000, 344000, 89000],
      family: [289200, 422400, 508000, 688000, 178000],
    },
    toandien: {
      individual: [144600, 211200, 254000, 344000, 89000],
      family: [289200, 422400, 508000, 688000, 178000],
    },
    nangcao: {
      individual: [170000, 240000, 290000, 390000, 100000],
      family: [340000, 480000, 580000, 780000, 200000],
    },
  },
};

// Hàm tra cứu phí
function getTravelCareFee(
  region: keyof typeof travelCareFeeTable,
  program: "basic" | "toandien" | "nangcao",
  packageType: "individual" | "family",
  days: number
): number {
  let idx = 0;
  if (days <= 3) idx = 0;
  else if (days <= 6) idx = 1;
  else if (days <= 10) idx = 2;
  else if (days <= 14) idx = 3;
  else idx = 4; // mỗi tuần hoặc phần tuần kéo dài thêm
  const table = travelCareFeeTable[region]?.[program]?.[packageType];
  if (!table) return 0;
  if (idx < 4) return table[idx] || 0;
  let base = table[3] || 0;
  let extra = table[4] || 0;
  let extraWeeks = Math.ceil((days - 14) / 7);
  return base + extraWeeks * extra;
}

function formatDateToISOString(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split(".")[0] + "Z";
}

function TravelAccidentInsuranceOrderPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destination: "",
    departureDate: "",
    returnDate: "",
    numberOfDays: 0,
    numberOfPeople: 1,
    currency: "vnd",
    insurancePackage: "",
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
  const totalSteps = 3;

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500";
  const handleCustomerInfoChange = (
    field: keyof typeof buyerInfo,
    value: any
  ) => {
    setBuyerInfo((prev) => ({ ...prev, [field]: value }));
  };

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
    // Tính phí bảo hiểm dựa trên bảng phí mới
    const region =
      (form.destination as keyof typeof travelCareFeeTable) || "vietnam";
    let program: "basic" | "toandien" | "nangcao" = "basic";
    switch (insuranceProgram) {
      case "A":
        program = "basic";
        break;
      case "B":
        program = "basic";
        break;
      case "C":
        program = "toandien";
        break;
      case "D":
        program = "toandien";
        break;
      case "E":
        program = "nangcao";
        break;
      default:
        program = "basic";
    }
    const packageType: "individual" | "family" =
      form.insurancePackage === "family" ? "family" : "individual";
    const days = form.numberOfDays;
    const numPeople = Number(form.numberOfPeople) || 1;
    let feePerPackage = getTravelCareFee(region, program, packageType, days);
    let total =
      packageType === "individual" ? feePerPackage * numPeople : feePerPackage;
    setTotalFee(total);
  }, [
    insuranceProgram,
    form.numberOfDays,
    participants,
    form.numberOfPeople,
    form.destination,
    form.returnDate,
    form.departureDate,
    form.insurancePackage,
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
        // 1. Tạo invoice bảo hiểm tai nạn khách du lịch
        const travelInvoicePayload = {
          departure_location: "Việt Nam",
          destination: form.destination,
          departure_date: form.departureDate + "T00:00:00Z",
          return_date: form.returnDate + "T00:00:00Z",
          total_duration: form.numberOfDays,
          group_size: participants.length || form.numberOfPeople,
          insurance_program: insuranceProgram,
          insurance_package: form.insurancePackage,
          total_amount: totalFee,
          product_id: 8,
          participants: participants.map((p) => ({
            full_name: p.fullName,
            gender:
              p.gender === "male"
                ? "Nam"
                : p.gender === "female"
                ? "Nữ"
                : "Khác",
            birth_date: p.dob + "T00:00:00Z",
            identity_number: p.idNumber,
          })),
        };
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
          id: "TRAVEL_ACCIDENT",
          name: "Bảo hiểm tai nạn khách du lịch",
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
      } catch (error) {
        const err = error as any;
        alert(
          "Có lỗi xảy ra khi đặt mua bảo hiểm: " +
            (err?.response?.data?.message || err?.message || "")
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
    ["Điểm khởi hành", "Việt Nam"],
    [
      "Điểm đến",
      regions.find((r) => r.value === form.destination)?.label || "--",
    ],
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
    ["Tổng thời gian", form.numberOfDays + " ngày"],
    [
      "Gói bảo hiểm",
      form.insurancePackage === "family"
        ? "Gói bảo hiểm gia đình"
        : "Gói bảo hiểm cá nhân",
    ],
    ["Số người trong đoàn", form.numberOfPeople + " người"],
    ["Tổng phí (miễn VAT)", totalFee.toLocaleString("vi-VN") + " VNĐ"],
    ["Số tiền chiết khấu", "0 VNĐ"],
  ];

  return (
    <>
      <Navbar />
      <div className="bg-gray-50">
        <div className="container mx-auto pt-[84px] px-4 py-12">
          {/* Progress Bar */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex items-start justify-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-1/3">
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
              <div className="flex flex-col items-center text-center w-1/3">
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
                  Tính phí bảo hiểm du lịch
                </span>
              </div>

              {/* Connector */}
              <div
                className={`flex-auto border-t-2 mt-8 ${
                  step > 2 ? "border-red-600" : "border-gray-300"
                }`}
              ></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-1/3">
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
                  Thông tin tài khoản, giao nhận, thời điểm giao nhận
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
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
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
                    <label className="w-1/3 text-lg font-bold  text-left pr-4">
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
                      Gói bảo hiểm <span className="">*</span>
                    </label>
                    <div className="w-2/3">
                      <select
                        name="insurancePackage"
                        value={form.insurancePackage || ""}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">-- Chọn gói bảo hiểm --</option>
                        <option value="individual">Gói bảo hiểm cá nhân</option>
                        <option value="family">Gói bảo hiểm gia đình</option>
                      </select>
                    </div>
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
                      Số người trong đoàn
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
                      Loại tiền tệ
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
                <div className="mt-8 text-left bg-[#F4F6F8] p-6 rounded-lg">
                  <div className="flex items-center mb-2 text-left">
                    <span className="text-xl text-red-600 mr-2">🔔</span>
                    <span className="text-lg font-bold text-red-600 text-left uppercase">
                      Lưu ý
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="pl-2 space-y-2 text-left">
                    <div className="text-gray-800">
                      <span className="mr-2">›</span>
                      Quý khách mua bảo hiểm du lịch để xin visa chú ý cần hỏi
                      kỹ đại sứ quán về loại tiền tệ và số tiền bảo hiểm cần mua
                      để có thể được cấp Visa. Ví dụ: Xin visa vào Châu Âu thông
                      thường Đại sứ quán yêu cầu mua bảo hiểm du lịch mức tối
                      thiểu 30.000 EUR.
                    </div>
                    <div className="text-gray-800">
                      <span className="mr-2">›</span>
                      <a href="#" className="text-black hover:underline">
                        Xem thêm: Quy tắc bảo hiểm tai nạn khách du lịch
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-6 text-red-600 text-left">
                    Tính phí bảo hiểm du lịch quốc tế
                  </h2>
                  <table className="w-full">
                    <tbody>
                      {feeRows.map((row, idx) => {
                        if (idx === 7) {
                          return (
                            <React.Fragment key="insuranceProgramDropdown">
                              <tr
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-200"
                                }
                              >
                                <td className="py-2 px-4 font-semibold text-left w-1/3">
                                  Chương trình bảo hiểm{" "}
                                  <span className="text-red-500">*</span>
                                </td>
                                <td className="py-2 px-4 text-left">
                                  <select
                                    name="insuranceProgram"
                                    value={insuranceProgram}
                                    onChange={(e) =>
                                      setInsuranceProgram(
                                        e.target.value as InsuranceProgramKey
                                      )
                                    }
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                  >
                                    <option value="">
                                      -- Chọn chương trình --
                                    </option>
                                    <option value="basic">Cơ bản</option>
                                    <option value="standard">Toàn diện</option>
                                    <option value="advanced">Nâng cao</option>
                                  </select>
                                </td>
                              </tr>
                              <tr
                                className={
                                  (idx + 1) % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-200"
                                }
                              >
                                <td className="py-2 px-4 font-semibold text-left w-1/3">
                                  Tổng phí (miễn VAT)
                                </td>
                                <td className="py-2 px-4 text-left">
                                  {totalFee.toLocaleString("vi-VN")} VNĐ
                                </td>
                              </tr>
                              <tr
                                className={
                                  (idx + 2) % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-200"
                                }
                              >
                                <td className="py-2 px-4 font-semibold text-left w-1/3">
                                  Số tiền chiết khấu
                                </td>
                                <td className="py-2 px-4 text-left">0 VNĐ</td>
                              </tr>
                            </React.Fragment>
                          );
                        }
                        if (idx < 7) {
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
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
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
                      <div className="flex items-start gap-8">
                        <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
                          CMND/CCCD<span className="text-red-600">*</span>
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
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start pt-2">
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
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        {buyerInfo.type === "organization"
                          ? "Mã số thuế"
                          : "CMND/CCCD"}
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
                          placeholder={
                            buyerInfo.type === "organization"
                              ? "Nhập mã số thuế"
                              : "Nhập CMND/CCCD"
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-8">
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
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        Địa chỉ<span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="address"
                          value={buyerInfo.address}
                          onChange={handleCustomerInfoChange(
                            "address",
                            (e) => e.target.value
                          )}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        Email nhận thông báo{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="email"
                          name="email"
                          value={buyerInfo.email}
                          onChange={handleCustomerInfoChange(
                            "email",
                            (e) => e.target.value
                          )}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-8">
                      <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                        Số điện thoại di động{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={buyerInfo.phone}
                          onChange={handleCustomerInfoChange(
                            "phone",
                            (e) => e.target.value
                          )}
                          className={inputClassName}
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

export default TravelAccidentInsuranceOrderPage;
