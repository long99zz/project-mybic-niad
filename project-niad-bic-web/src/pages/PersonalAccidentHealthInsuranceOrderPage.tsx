import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ClipboardList, UserCircle2, CreditCard } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface InsuredPerson {
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
  identityCard: string;
  relationship: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  insuredPackage:
    | "fundamental"
    | "basic"
    | "silver"
    | "gold"
    | "advance"
    | "premium"
    | "";
  insuranceTerm: 1 | 2 | 3;
  premium: number;
  dentalExtension: boolean;
  maternityExtension: boolean;
  receiveAddress?: string;
  note?: string;
}

interface CustomerInfo {
  type: "individual" | "organization";
  fullName: string;
  email: string;
  phone: string;
  address: string;
  identityCard?: string;
  dateOfBirth?: string;
  invoice: boolean;
  companyName?: string;
  taxCode?: string;
  companyAddress?: string;
  receiveMethod: "email" | "paper";
  receiveAddress?: string;
  note?: string;
  insuranceTerm?: number;
  insuranceStartDate?: string;
}

interface HealthDeclared {
  height: number;
  weight: number;
  bloodPressure: string;
  medicalConditions: boolean;
  surgeryHistory: boolean;
  familyHistory: boolean;
  medicalTreatment: boolean;
}

interface InsurancePackage {
  id: "fundamental" | "basic" | "silver" | "gold" | "advance" | "premium";
  name: string;
}

interface AccountInfo {
  type: "individual" | "organization";
  fullName: string;
  email: string;
  phone: string;
  address: string;
  identityCard?: string;
  dateOfBirth?: string;
  invoice: boolean;
  companyName?: string;
  taxCode?: string;
  companyAddress?: string;
  receiveMethod: "email" | "paper";
  receiveAddress?: string;
  note?: string;
  insuranceTerm?: number;
  insuranceStartDate?: string;
}

const INSURANCE_PACKAGES: InsurancePackage[] = [
  { id: "fundamental", name: "Cơ bản" },
  { id: "basic", name: "Đồng" },
  { id: "silver", name: "Bạc" },
  { id: "gold", name: "Vàng" },
  { id: "advance", name: "Bạch kim" },
  { id: "premium", name: "Kim Cương" },
];

const PREMIUM_DATA = {
  base: {
    fundamental: [3330000, 2460000, 2430000, 2625000, 3090000],
    basic: [4380000, 3030000, 2980000, 3280000, 3780000],
    silver: [5385000, 3870000, 3810000, 4225000, 4880000],
    gold: [7010000, 4820000, 4760000, 5400000, 6280000],
    advance: [10180000, 6880000, 6780000, 7730000, 9080000],
    premium: [12790000, 8440000, 8290000, 9515000, 11340000],
  },
  maternity: {
    advance: 2415000,
    premium: 3622500,
  },
  dental: {
    fundamental: [null, null, null, null, null],
    basic: [840000, 560000, 420000, 420000, 500000],
    silver: [840000, 560000, 420000, 420000, 500000],
    gold: [1650000, 1000000, 950000, 950000, 1050000],
    advance: [2200000, 1500000, 1300000, 1300000, 1400000],
    premium: [3300000, 2250000, 1950000, 1950000, 2100000],
  },
  ageGroups: [
    { min: 1, max: 6 },
    { min: 7, max: 18 },
    { min: 19, max: 45 },
    { min: 46, max: 55 },
    { min: 56, max: 65 },
  ],
};

export default function PersonalAccidentHealthInsuranceOrderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);
  const totalSteps = 4;

  const [insuranceType, setInsuranceType] = useState("new");
  const [insuredCount, setInsuredCount] = useState(1);
  const [insuredPersons, setInsuredPersons] = useState<InsuredPerson[]>([
    {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      identityCard: "",
      relationship: "",
      occupation: "",
      phone: "",
      email: "",
      address: "",
      insuredPackage: "",
      insuranceTerm: 1,
      premium: 0,
      dentalExtension: false,
      maternityExtension: false,
    },
  ]);

  const todayStr = new Date().toISOString().split("T")[0];

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    type: "individual",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    identityCard: "",
    dateOfBirth: "",
    invoice: false,
    companyName: "",
    taxCode: "",
    companyAddress: "",
    receiveMethod: "email",
    receiveAddress: "",
    note: "",
    insuranceTerm: 1,
    insuranceStartDate: todayStr,
  });

  const [showHealthDeclaration, setShowHealthDeclaration] = useState<boolean[]>(
    [false]
  );
  const [healthAnswers, setHealthAnswers] = useState<{
    [index: number]: boolean[];
  }>({});
  const [healthDetail, setHealthDetail] = useState<{ [index: number]: string }>(
    {}
  );

  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    type: "individual",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    invoice: false,
    receiveMethod: "email",
    insuranceStartDate: todayStr,
  });

  const handleInsuredPersonChange = (
    index: number,
    field: keyof InsuredPerson,
    value: any
  ) => {
    const newInsuredPersons = [...insuredPersons];
    (newInsuredPersons[index] as any)[field] = value;
    setInsuredPersons(newInsuredPersons);
  };

  useEffect(() => {
    const newInsuredPersons = Array.from({ length: insuredCount }, (_, i) => {
      return (
        insuredPersons[i] || {
          fullName: "",
          dateOfBirth: "",
          gender: "",
          identityCard: "",
          relationship: "",
          occupation: "",
          phone: "",
          email: "",
          address: "",
          insuredPackage: "",
          insuranceTerm: 1,
          premium: 0,
          dentalExtension: false,
          maternityExtension: false,
        }
      );
    });
    setInsuredPersons(newInsuredPersons);
  }, [insuredCount]);

  useEffect(() => {
    const updatedPersons = insuredPersons.map((person) => {
      const premium = calculatePremium(
        person.dateOfBirth,
        person.insuredPackage,
        person.dentalExtension,
        person.maternityExtension
      );
      return { ...person, premium };
    });

    if (JSON.stringify(updatedPersons) !== JSON.stringify(insuredPersons)) {
      setInsuredPersons(updatedPersons);
    }
  }, [insuredPersons]);

  useEffect(() => {
    setShowHealthDeclaration(Array(insuredCount).fill(false));
  }, [insuredCount]);

  const calculatePremium = (
    dateOfBirth: string,
    packageId:
      | "fundamental"
      | "basic"
      | "silver"
      | "gold"
      | "advance"
      | "premium"
      | "",
    dentalExtension: boolean,
    maternityExtension: boolean
  ) => {
    if (!dateOfBirth || !packageId) return 0;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const finalAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    const ageGroupIndex = PREMIUM_DATA.ageGroups.findIndex(
      (group) => finalAge >= group.min && finalAge <= group.max
    );

    if (ageGroupIndex === -1) {
      return 0; // Age is outside the allowed range
    }

    let totalPremium = 0;

    // Base Premium
    const basePremium = PREMIUM_DATA.base[packageId][ageGroupIndex];
    if (basePremium) {
      totalPremium += basePremium;
    }

    // Dental Premium
    if (dentalExtension) {
      const dentalPremium = PREMIUM_DATA.dental[packageId][ageGroupIndex];
      if (dentalPremium !== null) {
        totalPremium += dentalPremium;
      }
    }

    // Maternity Premium
    if (maternityExtension) {
      if (finalAge >= 19 && finalAge <= 45) {
        if (packageId === "advance" || packageId === "premium") {
          totalPremium +=
            PREMIUM_DATA.maternity[packageId as "advance" | "premium"];
        }
      }
    }

    return totalPremium;
  };

  const getTotalPremium = () => {
    return insuredPersons.reduce((sum, person) => sum + person.premium, 0);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.slice(0, 10);
  };

  const formatIdentityCard = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.slice(0, 12);
  };

  const handleNext = async () => {
    setShowError(false);
    let currentStepErrors: { [key: string]: string } = {};

    try {
      if (currentStep === 1) {
        if (insuredCount < 1) {
          currentStepErrors.insuredCount =
            "Vui lòng chọn số người tham gia từ 1 trở lên";
        }
      } else if (currentStep === 2) {
        insuredPersons.forEach((person, index) => {
          if (!person.identityCard) {
            currentStepErrors[`person${index}Id`] =
              "Vui lòng nhập CMND/CCCD/Hộ chiếu";
          }
          if (!person.dateOfBirth) {
            currentStepErrors[`person${index}Birth`] =
              "Vui lòng chọn ngày sinh";
          } else {
            const birthDate = new Date(person.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const finalAge =
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ? age - 1
                : age;

            if (finalAge < 1 || finalAge > 65) {
              currentStepErrors[`person${index}Birth`] =
                "Độ tuổi tham gia bảo hiểm từ 1 đến 65 tuổi";
            }
          }
          if (!person.gender) {
            currentStepErrors[`person${index}Gender`] =
              "Vui lòng chọn Giới tính";
          }
          if (!person.insuredPackage) {
            currentStepErrors[`person${index}Package`] =
              "Vui lòng chọn Chương trình";
          }
        });
      } else if (currentStep === 3) {
        // Validate customer info
        if (customerInfo.type === "individual") {
          if (!customerInfo.identityCard) {
            currentStepErrors.identityCard = "Vui lòng nhập CMND/CCCD";
          }
        } else {
          if (!customerInfo.companyName) {
            currentStepErrors.companyName = "Vui lòng nhập tên công ty";
          }
          if (!customerInfo.taxCode) {
            currentStepErrors.taxCode = "Vui lòng nhập mã số thuế";
          }
        }

        if (!customerInfo.fullName) {
          currentStepErrors.fullName = "Vui lòng nhập họ và tên";
        }
        if (!customerInfo.phone) {
          currentStepErrors.phone = "Vui lòng nhập số điện thoại";
        }
        if (!customerInfo.email) {
          currentStepErrors.email = "Vui lòng nhập email";
        }
        if (!customerInfo.address) {
          currentStepErrors.address = "Vui lòng nhập địa chỉ";
        }
      } else if (currentStep === 4) {
        // Validate account info
        if (!accountInfo.fullName) {
          currentStepErrors.fullName = "Vui lòng nhập họ và tên";
        }
        if (!accountInfo.phone) {
          currentStepErrors.phone = "Vui lòng nhập số điện thoại";
        }
        if (!accountInfo.email) {
          currentStepErrors.email = "Vui lòng nhập email";
        }
        if (!accountInfo.address) {
          currentStepErrors.address = "Vui lòng nhập địa chỉ";
        }
      }

      if (Object.keys(currentStepErrors).length > 0) {
        setErrors(currentStepErrors);
        setShowError(true);
        return;
      }

      setErrors({});
      window.scrollTo(0, 0);

      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        await handleSubmit();
      }
    } catch (error) {
      console.error("Error validating form:", error);
      setShowError(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowError(false);
      setErrors({});
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // 1. Chuẩn bị payload tạo hóa đơn (invoice)
      const insuranceStart = dayjs(
        customerInfo.insuranceStartDate
      ).toISOString();
      const insuranceEnd = dayjs(customerInfo.insuranceStartDate)
        .add(1, "year")
        .toISOString();
      const invoicePayload = {
        insurance_package: "Bảo hiểm tai nạn con người 24/24",
        insurance_start: insuranceStart,
        insurance_end: insuranceEnd,
        insurance_amount: getTotalPremium(),
        contract_type: insuranceType === "new" ? "Mới" : "Tái tục",
        status: "Chưa thanh toán",
        product_id: 5,
        participants: insuredPersons.map((p) => ({
          full_name: p.fullName,
          gender:
            p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác",
          birth_date: dayjs(p.dateOfBirth).toISOString(),
          identity_number: p.identityCard,
        })),
      };
      console.log(
        "Payload gửi backend:",
        JSON.stringify(invoicePayload, null, 2)
      );
      let invoiceRes;
      try {
        invoiceRes = await axios.post(
          `${API_URL}/api/insurance_accident/create_accident`,
          invoicePayload
        );
        console.log("[DEBUG] Response create_accident:", invoiceRes.data);
      } catch (err) {
        console.error("[ERROR] create_accident:", err);
        if ((err as any).response) {
          console.error(
            "[ERROR] create_accident response:",
            (err as any).response.data
          );
        }
        throw err;
      }
      const invoiceId = invoiceRes.data.invoice_id;

      // 2. Tạo form bảo hiểm cá nhân (PersonalInsuranceForm)
      let formId = null;
      try {
        const personalFormPayload = {
          full_name: insuredPersons[0].fullName,
          cmnd_img: "", // Nếu có upload ảnh thì truyền, còn không để rỗng
          identity_number: insuredPersons[0].identityCard,
          birth_date: dayjs(insuredPersons[0].dateOfBirth).toISOString(),
          gender:
            insuredPersons[0].gender === "male"
              ? "Nam"
              : insuredPersons[0].gender === "female"
              ? "Nữ"
              : "Khác",
          insurance_program: "Bảo hiểm tai nạn con người 24/24",
          dental_extension: false, // Nếu có tuỳ chọn thì lấy từ form, mặc định false
          maternity_extension: false, // Nếu có tuỳ chọn thì lấy từ form, mặc định false
          insurance_start: insuranceStart,
          insurance_duration: 12, // 1 năm = 12 tháng
          insurance_fee: getTotalPremium(),
        };
        const formRes = await axios.post(
          `${API_URL}/api/insurance_accident/create_personal_form`,
          personalFormPayload
        );
        formId = formRes.data.form_id;
        console.log("[DEBUG] Response create_personal_form:", formRes.data);
      } catch (err) {
        console.error("[ERROR] create_personal_form:", err);
        if ((err as any).response) {
          console.error(
            "[ERROR] create_personal_form response:",
            (err as any).response.data
          );
        }
        throw err;
      }

      // 3. Tạo customer
      const customerPayload = {
        customer_type:
          customerInfo.type === "individual" ? "Cá nhân" : "Tổ chức",
        identity_number: customerInfo.identityCard,
        full_name: customerInfo.fullName,
        address: customerInfo.address,
        email: customerInfo.email,
        phone_number: customerInfo.phone,
        invoice_request: customerInfo.invoice,
        notes: customerInfo.note || "",
      };
      console.log(
        "[DEBUG] Payload gửi lên create_customer_registration:",
        customerPayload
      );
      let customerRes;
      try {
        customerRes = await axios.post(
          `${API_URL}/api/insurance_accident/create_customer_registration`,
          customerPayload
        );
        console.log(
          "[DEBUG] Response create_customer_registration:",
          customerRes.data
        );
      } catch (err) {
        console.error("[ERROR] create_customer_registration:", err);
        if ((err as any).response) {
          console.error(
            "[ERROR] create_customer_registration response:",
            (err as any).response.data
          );
        }
        throw err;
      }
      const customerId = customerRes.data.customer_id;

      // 4. Xác nhận mua hàng (gán customer cho invoice)
      const confirmPayload = {
        invoice_id: invoiceId,
        customer_id: customerId,
        form_id: formId,
        product_id: 5,
      };
      console.log("[DEBUG] Payload gửi lên confirm_purchase:", confirmPayload);
      try {
        const confirmRes = await axios.post(
          `${API_URL}/api/insurance_accident/confirm_purchase`,
          confirmPayload
        );
        console.log("[DEBUG] Response confirm_purchase:", confirmRes.data);
      } catch (err) {
        console.error("[ERROR] confirm_purchase:", err);
        if ((err as any).response) {
          console.error(
            "[ERROR] confirm_purchase response:",
            (err as any).response.data
          );
        }
        throw err;
      }

      // 5. Chuyển hướng sang trang xác nhận/thanh toán
      navigate("/gio-hang.html");
    } catch (error) {
      setShowError(true);
      setIsSubmitting(false);
      alert(
        "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ. Xem chi tiết lỗi ở Console."
      );
    }
  };

  const renderStep1Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-8 rounded-lg shadow-md">
          <h3 className="text-3xl font-semibold text-left mb-8 text-red-600">
            Thông tin
          </h3>
          <div className="space-y-6">
            {/* Gói bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[250px] flex justify-start pt-3">
                Gói bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none bg-gray-100"
                  value="BIC Tâm An"
                  disabled
                />
              </div>
            </div>

            {/* Đối tượng được bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[250px] flex justify-start pt-3">
                Đối tượng được bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                >
                  <option value="new">Hợp đồng mới</option>
                  <option value="renewal">Hợp đồng tái tục</option>
                </select>
                <div className="text-gray-500 text-sm mt-2 text-left">
                  Hợp đồng tái tục: Là Hợp đồng bảo hiểm thỏa mãn các điều kiện
                  sau:
                  <br />
                  - Người được bảo hiểm không thay đổi;
                  <br />
                  - Hợp đồng bảo hiểm trước đó có thời hạn bảo hiểm là 01 năm;
                  <br />- Ngày bắt đầu bảo hiểm của Hợp đồng bảo hiểm tái tục
                  phải là tiếp theo liên kề ngày kết thúc thời hạn bảo hiểm của
                  Hợp đồng bảo hiểm trước đó.
                </div>
              </div>
            </div>

            {/* Số người tham gia BH */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[250px] flex justify-start pt-3">
                Số người tham gia BH <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  value={insuredCount}
                  onChange={(e) => setInsuredCount(Number(e.target.value))}
                >
                  <option value="">-- Chọn số người --</option>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} người
                    </option>
                  ))}
                </select>
                <div className="text-gray-500 text-sm mt-2 text-left">
                  (Trẻ em từ 1-6 tuổi phải mua kèm bố hoặc mẹ. Chương trình bảo
                  hiểm của con chỉ được áp dụng mức tương đương hoặc thấp hơn
                  chương trình của bố/mẹ)
                </div>
                {showError && errors.insuredCount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.insuredCount}
                  </p>
                )}
              </div>
            </div>

            {/* Thời hạn bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[250px] flex justify-start pt-3">
                Thời hạn bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    value={dayjs().add(1, "day").format("DD-MM-YYYY")}
                    readOnly
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                </div>
                <div className="text-gray-500 text-sm mt-2 text-left">
                  01 năm kể từ ngày trên và sau thời điểm thanh toán phí
                </div>
              </div>
            </div>

            {/* Chú ý */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="text-red-600 font-semibold mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                CHÚ Ý NẾU QUÝ KHÁCH MUA LẦN ĐẦU TIÊN
              </div>
              <ul className="text-gray-700 text-sm list-disc pl-6 space-y-1 text-left">
                <li>
                  Thời gian chờ đối với khám chữa bệnh thông thường (gồm cả khám
                  răng) là 30 ngày
                </li>
                <li>
                  Thời gian chờ đối với bệnh mãn tính, bệnh có sẵn là 06 tháng
                  hoặc 01 năm tùy theo từng nhóm bệnh, chi tiết trong quy tắc
                  bảo hiểm
                </li>
                <li>
                  Thời gian chờ đối với các vấn đề liên quan đến thai sản: Sinh
                  thường hoặc sinh mổ là 01 năm; Biến chứng thai sản 280 ngày;
                  Thai ngoài tử cung 90 ngày
                </li>
              </ul>
              <div className="text-gray-600 text-xs mt-2 text-left">
                (<strong>Thời gian chờ</strong>: Tại thời điểm Quý khách yêu cầu
                cấp đơn bảo hiểm, BIC sẽ kiểm tra xem hợp đồng bảo hiểm của Quý
                khách đã mua đủ thời gian chờ chưa, nếu chưa đủ BIC sẽ thông báo
                từ chối bảo hiểm)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-8 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    );
  };

  const renderStep2Content = () => {
    return (
      <div style={{ maxWidth: "1200px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-8 rounded-lg shadow-md">
          <h3 className="text-3xl font-semibold text-left mb-8 text-red-600">
            Thông tin người tham gia bảo hiểm
          </h3>
          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-11 gap-0 bg-red-600 text-white font-semibold text-sm p-3 rounded-t-md">
                <div className="col-span-1 text-center border-r border-white">
                  STT
                </div>
                <div className="col-span-2 text-center border-r border-white">
                  Số CMND/Hộ chiếu
                </div>
                <div className="col-span-2 text-center border-r border-white">
                  Ngày sinh
                </div>
                <div className="col-span-1 text-center border-r border-white">
                  Giới tính
                </div>
                <div className="col-span-2 text-center border-r border-white">
                  Chương trình
                </div>
                <div className="col-span-1 text-center border-r border-white">
                  Mở rộng nha khoa
                </div>
                <div className="col-span-1 text-center border-r border-white">
                  Mở rộng thai sản
                </div>
                <div className="col-span-1 text-center">Phí BH (miễn VAT)</div>
              </div>
              {/* Body */}
              <div className="bg-white rounded-b-md">
                {insuredPersons.map((person, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-11 gap-0 items-center p-2 border-b last:border-b-0"
                  >
                    <div className="col-span-1 text-center border-r">
                      {index + 1}
                    </div>
                    <div className="col-span-1 flex justify-center border-r">
                      <button className="p-2 hover:bg-gray-100 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="col-span-2 border-r">
                      <input
                        type="text"
                        placeholder="CMND/CCCD"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={person.identityCard}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "identityCard",
                            e.target.value
                          )
                        }
                      />
                      {showError && errors[`person${index}Id`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`person${index}Id`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 border-r">
                      <input
                        type="date"
                        placeholder="dd/mm/yyyy"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={person.dateOfBirth}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                      />
                      {showError && errors[`person${index}Birth`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`person${index}Birth`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 border-r">
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={person.gender}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "gender",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                      {showError && errors[`person${index}Gender`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`person${index}Gender`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 border-r">
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={person.insuredPackage}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "insuredPackage",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Chương trình</option>
                        {INSURANCE_PACKAGES.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </option>
                        ))}
                      </select>
                      {showError && errors[`person${index}Package`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`person${index}Package`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 border-r">
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={String(person.dentalExtension)}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "dentalExtension",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="false">Không</option>
                        <option value="true">Có</option>
                      </select>
                    </div>
                    <div className="col-span-1 border-r">
                      <select
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        value={String(person.maternityExtension)}
                        onChange={(e) =>
                          handleInsuredPersonChange(
                            index,
                            "maternityExtension",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="false">Không</option>
                        <option value="true">Có</option>
                      </select>
                    </div>
                    <div className="col-span-1 text-center font-semibold text-red-600">
                      {person.premium.toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Total Fee */}
          <div className="mt-8 text-left space-y-2">
            <p className="text-lg">
              Tổng phí (miễn VAT):{" "}
              <span className="text-red-600">
                {getTotalPremium().toLocaleString("vi-VN")} VNĐ
              </span>
            </p>
            <p className="text-lg">
              Số tiền chiết khấu:{" "}
              <span className="text-red-600">
                {Math.round(getTotalPremium() * 0.15).toLocaleString("vi-VN")}{" "}
                VNĐ
              </span>
            </p>
            <hr className="my-2" />
            <p className="text-xl font-bold">
              Tổng phí thực thu (miễn VAT):{" "}
              <span className="text-red-600">
                {(
                  getTotalPremium() - Math.round(getTotalPremium() * 0.15)
                ).toLocaleString("vi-VN")}{" "}
                VNĐ
              </span>
            </p>
          </div>
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-8 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyHealthYes = Object.values(healthAnswers).some(
    (answers) => answers && answers.some((ans) => ans === true)
  );

  const handleShowHealthDeclaration = (index: number) => {
    const newShow = [...showHealthDeclaration];
    newShow[index] = !newShow[index];
    setShowHealthDeclaration(newShow);
  };

  const handleHealthAnswer = (
    personIdx: number,
    qIdx: number,
    value: boolean
  ) => {
    setHealthAnswers((prev) => {
      const newAns = prev[personIdx]
        ? [...prev[personIdx]]
        : Array(6).fill(false);
      newAns[qIdx] = value;
      return { ...prev, [personIdx]: newAns };
    });
  };

  const handleHealthDetail = (personIdx: number, value: string) => {
    setHealthDetail((prev) => ({ ...prev, [personIdx]: value }));
  };

  const renderStep3Content = () => (
    <div style={{ maxWidth: "1200px" }} className="mx-auto">
      <div className="bg-[#F4F6F8] p-8 rounded-lg shadow-md">
        <h3 className="text-3xl font-semibold text-left mb-8 text-red-600">
          Xác nhận & Thanh toán
        </h3>
        <div className="overflow-x-auto mb-8">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-0 bg-red-600 text-white font-semibold text-sm p-3 rounded-t-md">
              <div className="col-span-1 text-center border-r border-white">
                STT
              </div>
              <div className="col-span-2 text-center border-r border-white">
                Họ tên
              </div>
              <div className="col-span-1 text-center border-r border-white">
                Giới tính
              </div>
              <div className="col-span-1 text-center border-r border-white">
                Ngày sinh
              </div>
              <div className="col-span-1 text-center border-r border-white">
                Phí BH (miễn VAT)
              </div>
              <div className="col-span-1 text-center">
                Khai báo tiền sử bệnh
              </div>
            </div>
            <div className="bg-white rounded-b-md">
              {insuredPersons.map((person, idx) => [
                <div
                  key={"row-" + idx}
                  className="grid grid-cols-7 gap-0 items-center p-2 border-b last:border-b-0"
                >
                  <div className="col-span-1 text-center border-r">
                    {idx + 1}
                  </div>
                  <div className="col-span-2 text-center border-r">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={person.fullName}
                      placeholder="Họ tên"
                      onChange={(e) =>
                        handleInsuredPersonChange(
                          idx,
                          "fullName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1 text-center border-r">
                    {person.gender === "male"
                      ? "Nam"
                      : person.gender === "female"
                      ? "Nữ"
                      : ""}
                  </div>
                  <div className="col-span-1 text-center border-r">
                    {person.dateOfBirth
                      ? dayjs(person.dateOfBirth).format("DD/MM/YYYY")
                      : ""}
                  </div>
                  <div className="col-span-1 text-center border-r">
                    {person.premium.toLocaleString("vi-VN")}VNĐ
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      className="text-red-600 underline hover:text-red-800"
                      onClick={() => handleShowHealthDeclaration(idx)}
                    >
                      Khai báo
                    </button>
                    {!showHealthDeclaration[idx] && !healthAnswers[idx] && (
                      <div className="text-xs text-red-500 mt-1">
                        (Vui lòng khai báo thông tin)
                      </div>
                    )}
                  </div>
                </div>,
                showHealthDeclaration[idx] && (
                  <table
                    key={"declare-" + idx}
                    className="w-full border-t border-gray-200 mb-4"
                  >
                    <tbody>
                      {[
                        "Bạn hoặc bất kỳ thành viên nào trong gia đình hoặc người được bảo hiểm nào mắc bệnh bẩm sinh, khuyết tật hay thương tật nào không",
                        "Trong 5 năm qua, bạn hay bất kỳ người được bảo hiểm nào phải điều trị, nằm viện, hay phẫu thuật trong một bệnh viện, viện điều dưỡng, phòng khám hoặc các tổ chức y tế khác? Hoặc ở trong tình trạng cần phải điều trị trong bệnh viện trong vòng 12 tháng tới?",
                        "Trong 5 năm qua, bạn hay bất kỳ thành viên nào trong gia đình hoặc người được bảo hiểm nào mắc hoặc điều trị một hay nhiều trong các chứng bệnh sau: bệnh lao, tiểu đường, thấp khớp, viêm gan, rối loạn nội hấp, phổi bệnh tim, giãn tĩnh mạch, rối loạn đường ruột, bệnh gout, mắt, thần kinh sinh dục tiết niệu hoặc các bệnh lây qua đường tình dục, ung thư hoặc u bướu, chấn thương, thần kinh, tâm thần, xương khớp, dạ dày, da, chứng thoát vị hoặc bệnh phụ khoa?",
                        "Người được bảo hiểm có tham gia hợp đồng bảo hiểm sức khỏe tại BIC hoặc tại Công ty bảo hiểm khác trong vòng 5 năm gần đây không?",
                        "Người được bảo hiểm đã từng yêu cầu bồi thường bảo hiểm y tế, tai nạn con người tại BIC chưa?",
                        "Người được bảo hiểm đã bao giờ bị một công ty bảo hiểm từ chối nhận bảo hiểm hoặc từ chối tái tục hợp đồng bảo hiểm sức khỏe hoặc được chấp nhận nhưng có các điều khoản bổ sung đặc biệt đi kèm chưa?",
                      ].map((q, qIdx) => (
                        <tr key={qIdx}>
                          <td className="w-8 text-center align-top font-bold border-b border-gray-200">
                            {qIdx + 1}.
                          </td>
                          <td className="align-top text-left border-b border-gray-200">
                            {q}
                          </td>
                          <td className="w-40 text-center border-b border-gray-200">
                            <label className="mr-2">
                              <input
                                type="radio"
                                name={`health-q${qIdx}-person${idx}`}
                                checked={healthAnswers[idx]?.[qIdx] === true}
                                onChange={() =>
                                  handleHealthAnswer(idx, qIdx, true)
                                }
                              />{" "}
                              Có
                            </label>
                            <label>
                              <input
                                type="radio"
                                name={`health-q${qIdx}-person${idx}`}
                                checked={healthAnswers[idx]?.[qIdx] === false}
                                onChange={() =>
                                  handleHealthAnswer(idx, qIdx, false)
                                }
                              />{" "}
                              Không
                            </label>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="pt-2">
                          Nếu câu hỏi nào ở trên trả lời là Có, xin hãy nêu chi
                          tiết:
                          <br />
                          <textarea
                            className="w-full border border-gray-300 rounded mt-1 p-2"
                            rows={2}
                            value={healthDetail[idx] || ""}
                            onChange={(e) =>
                              handleHealthDetail(idx, e.target.value)
                            }
                            disabled={!hasAnyHealthYes}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ),
              ])}
            </div>
          </div>
        </div>
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
                  value={customerInfo.type}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      type: e.target.value as "individual" | "organization",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-base"
                >
                  <option value="individual">Cá nhân</option>
                  <option value="organization">Tổ chức</option>
                </select>
              </div>
            </div>
            {/* CMND/CCCD */}
            {customerInfo.type === "organization" ? (
              <>
                <div className="flex items-center gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Mã số thuế <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customerInfo.taxCode || ""}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          taxCode: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                      placeholder="Nhập mã số thuế"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Tên công ty/ Tổ chức <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customerInfo.companyName || ""}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                      placeholder="Nhập tên công ty/ tổ chức"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    CMND/CCCD <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customerInfo.identityCard || ""}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          identityCard: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                      placeholder="Nhập CMND/CCCD"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>
              </>
            )}
            {/* Địa chỉ */}
            <div className="flex items-center gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Địa chỉ <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
            {/* Email */}
            <div className="flex items-center gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Email nhận thông báo <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                  placeholder="Nhập email"
                />
              </div>
            </div>
            {/* Số điện thoại */}
            <div className="flex items-center gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Số điện thoại di động <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
            {/* Thời hạn bảo hiểm */}
            <div className="flex items-center gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Thời hạn bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  value={customerInfo.insuranceTerm || 1}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      insuranceTerm: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-base"
                >
                  <option value={1}>1 năm</option>
                  <option value={2}>2 năm</option>
                  <option value={3}>3 năm</option>
                </select>
              </div>
            </div>
            {/* Ngày bắt đầu bảo hiểm */}
            <div className="flex items-center gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Ngày bắt đầu bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="date"
                  value={customerInfo.insuranceStartDate || ""}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      insuranceStartDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
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
                    value="no"
                    checked={!customerInfo.invoice}
                    onChange={() =>
                      setCustomerInfo((prev) => ({ ...prev, invoice: false }))
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Không nhận hóa đơn</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="invoice"
                    value="yes"
                    checked={customerInfo.invoice}
                    onChange={() =>
                      setCustomerInfo((prev) => ({ ...prev, invoice: true }))
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Có nhận hóa đơn</span>
                </label>
              </div>
            </div>
            {customerInfo.invoice && (
              <p className="text-sm text-gray-600 mt-2">
                Theo quy định của Nhà nước tại Nghị định số 123/2020/NĐ-CP và
                thông tư số 78/2021/TT-BTC, BIC sẽ cung cấp hóa đơn GTGT dưới
                dạng hóa đơn điện tử và gửi đến quý khách qua email đã đăng ký
                khi mua hàng.
              </p>
            )}
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-8 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
            disabled={hasAnyHealthYes}
          >
            Xác nhận & Thanh toán
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4Content = () => (
    <div style={{ maxWidth: "1000px" }} className="mx-auto">
      <div className="bg-[#F4F6F8] p-6 rounded-lg">
        <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
          Thông tin tài khoản
        </h3>
        <div className="space-y-6">
          {/* Sao chép từ thông tin bên mua bảo hiểm */}
          <div className="flex items-start gap-8">
            <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
              Sao chép từ thông tin bên mua bảo hiểm
            </label>
            <div className="flex-1">
              <button
                type="button"
                onClick={() =>
                  setAccountInfo({
                    type:
                      customerInfo.type === "organization"
                        ? "organization"
                        : "individual",
                    fullName: customerInfo.fullName,
                    address: customerInfo.address,
                    identityCard: customerInfo.identityCard,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    dateOfBirth: customerInfo.dateOfBirth,
                    invoice: customerInfo.invoice,
                    companyName: customerInfo.companyName,
                    taxCode: customerInfo.taxCode,
                    companyAddress: customerInfo.companyAddress,
                    receiveMethod:
                      customerInfo.receiveMethod === "paper"
                        ? "paper"
                        : "email",
                    receiveAddress: customerInfo.receiveAddress,
                    note: customerInfo.note,
                    insuranceTerm: customerInfo.insuranceTerm,
                    insuranceStartDate: customerInfo.insuranceStartDate,
                  })
                }
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sao chép từ thông tin bên mua bảo hiểm
              </button>
            </div>
          </div>
          {/* Họ và tên */}
          <div className="flex items-start gap-8">
            <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={accountInfo.fullName}
                onChange={(e) =>
                  setAccountInfo((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          {/* Địa chỉ */}
          <div className="flex items-start gap-8">
            <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
              Địa chỉ <span className="text-red-600">*</span>
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={accountInfo.address}
                onChange={(e) =>
                  setAccountInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          {/* Email nhận thông báo */}
          <div className="flex items-start gap-8">
            <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
              Email nhận thông báo <span className="text-red-600">*</span>
            </label>
            <div className="flex-1">
              <input
                type="email"
                value={accountInfo.email}
                onChange={(e) =>
                  setAccountInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          {/* Số điện thoại di động */}
          <div className="flex items-start gap-8">
            <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
              Số điện thoại di động <span className="text-red-600">*</span>
            </label>
            <div className="flex-1">
              <input
                type="tel"
                value={accountInfo.phone}
                onChange={(e) =>
                  setAccountInfo((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          {/* Hình thức giao nhận */}
          <div className="border-t pt-6 mt-8">
            <h4 className="text-lg font-medium mb-4">Hình thức giao nhận</h4>
            <div className="bg-white p-4 rounded-md">
              <p className="text-gray-600">
                Giấy chứng nhận bảo hiểm điện tử (có giá trị như bản giấy) sẽ
                được gửi đến email Quý khách đăng ký ở trên sau khi chúng tôi
                nhận được phí thanh toán
              </p>
            </div>
          </div>
          {/* Thời điểm giao nhận */}
          <div className="border-t pt-6 mt-8">
            <h4 className="text-lg font-medium mb-4">Thời điểm giao nhận</h4>
            <div className="bg-white p-4 rounded-md">
              <p className="text-gray-600">
                Trong vòng 24 giờ kể từ thời điểm thanh toán phí
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Nút điều hướng */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevStep}
          className="px-8 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[84px] pb-[100px]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Bảo hiểm Tai nạn và Sức khoẻ cá nhân
          </h1>

          {/* Step indicators */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center ${
                  currentStep === 1 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <ClipboardList className="w-6 h-6" />
                <span className="ml-2">Thông tin chung</span>
              </div>
              <div className="w-16 h-px bg-gray-300"></div>
              <div
                className={`flex items-center ${
                  currentStep === 2 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <UserCircle2 className="w-6 h-6" />
                <span className="ml-2">Thông tin người tham gia</span>
              </div>
              <div className="w-16 h-px bg-gray-300"></div>
              <div
                className={`flex items-center ${
                  currentStep === 3 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="ml-2">Xác nhận và Thanh toán</span>
              </div>
              <div className="w-16 h-px bg-gray-300"></div>
              <div
                className={`flex items-center ${
                  currentStep === 4 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="ml-2">Thông tin tài khoản</span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {showError && errors.submit && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Step content */}
          {currentStep === 1 && renderStep1Content()}
          {currentStep === 2 && renderStep2Content()}
          {currentStep === 3 && renderStep3Content()}
          {currentStep === 4 && renderStep4Content()}
        </div>
      </div>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
