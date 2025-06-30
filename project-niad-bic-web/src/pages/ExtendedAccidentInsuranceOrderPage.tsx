import { ClipboardList, UserCircle2, CreditCard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import axios, { AxiosError } from "axios";
import feeTable from "../data/cancer_fee_table.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ParticipantInfo {
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  identityCard: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  address: string;
  package: "basic" | "premium" | "plus" | "plus4" | "";
  insuranceTerm: 1 | 2 | 3;
  premium: number;
  additionalBenefitOption: "yes" | "no" | "";
  nationality?: string;
  productPackage?: "abc" | "ab" | "";
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
  insuranceTerm: number;
  insuranceStartDate: string;
}

interface InsurancePackage {
  id: "basic" | "premium" | "plus" | "plus4";
  name: string;
  benefits: string[];
  maxPayout: number;
  annualPremium: number;
}

const INSURANCE_PACKAGES: InsurancePackage[] = [
  {
    id: "basic",
    name: "Chương trình 1",
    benefits: [
      "Bảo hiểm ung thư giai đoạn đầu",
      "Bảo hiểm ung thư giai đoạn muộn",
      "Quyền lợi tử vong do ung thư",
    ],
    maxPayout: 200000000, // 200 triệu
    annualPremium: 400000, // 400 nghìn/năm
  },
  {
    id: "premium",
    name: "Chương trình 2",
    benefits: [
      "Bảo hiểm ung thư giai đoạn đầu",
      "Bảo hiểm ung thư giai đoạn muộn",
      "Quyền lợi tử vong do ung thư",
      "Trợ cấp nằm viện",
      "Chi phí điều trị ngoại trú",
    ],
    maxPayout: 500000000, // 500 triệu
    annualPremium: 800000, // 800 nghìn/năm
  },
  {
    id: "plus",
    name: "Chương trình 3",
    benefits: [
      "Bảo hiểm ung thư giai đoạn đầu",
      "Bảo hiểm ung thư giai đoạn muộn",
      "Quyền lợi tử vong do ung thư",
      "Trợ cấp nằm viện",
      "Chi phí điều trị ngoại trú",
      "Quyền lợi điều trị tại nước ngoài",
    ],
    maxPayout: 1000000000, // 1 tỷ
    annualPremium: 1600000, // 1.6 triệu/năm
  },
  {
    id: "plus4",
    name: "Chương trình 4",
    benefits: [
      "Bảo hiểm ung thư giai đoạn đầu",
      "Bảo hiểm ung thư giai đoạn muộn",
      "Quyền lợi tử vong do ung thư",
      "Trợ cấp nằm viện",
      "Chi phí điều trị ngoại trú",
      "Quyền lợi điều trị tại nước ngoài",
      "Quyền lợi y tế cao cấp",
    ],
    maxPayout: 1500000000, // 1.5 tỷ
    annualPremium: 2000000, // 2 triệu/năm
  },
];

const inputClassName =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500";
const selectClassName =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white text-base";

export default function CancerInsuranceOrderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);
  const totalSteps = 3; // Changed from 2 to 3 to include payment step

  const [participantCount, setParticipantCount] = useState(1);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([
    {
      fullName: "",
      dateOfBirth: "",
      gender: "male",
      identityCard: "",
      relationship: "",
      phoneNumber: "",
      email: "",
      address: "",
      package: "",
      insuranceTerm: 1,
      premium: 0,
      additionalBenefitOption: "",
    },
  ]);

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
    insuranceStartDate: new Date().toISOString().split("T")[0],
  });

  const calculatePremium = (
    dateOfBirth: string,
    packageId: string,
    term: number,
    gender?: "male" | "female",
    productPackage?: "abc" | "ab" | ""
  ) => {
    if (!dateOfBirth || !packageId) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 16 || age > 65) return 0;

    // Xác định chương trình (1-4)
    let program = 1;
    if (packageId === "basic") program = 1;
    else if (packageId === "premium") program = 2;
    else if (packageId === "plus") program = 3;
    else if (packageId === "plus4") program = 4;

    // Bảng phí 3 điều kiện (A,B,C)
    const feeTableABC = [
      { min: 16, max: 40, values: [87000, 136000, 284000, 539000] },
      { min: 41, max: 50, values: [100000, 165000, 342000, 651000] },
      { min: 51, max: 60, values: [125000, 216000, 454000, 864000] },
      { min: 61, max: 65, values: [160000, 290000, 613000, 1172000] },
    ];
    // Bảng phí A,B
    const feeTableAB = [
      { min: 16, max: 40, values: [59000, 80000, 200000, 399000] },
      { min: 41, max: 50, values: [65000, 95000, 237000, 475000] },
      { min: 51, max: 60, values: [82000, 130000, 324000, 648000] },
      { min: 61, max: 65, values: [105000, 180000, 448000, 897000] },
    ];
    const table = productPackage === "abc" ? feeTableABC : feeTableAB;
    const row = table.find((r) => age >= r.min && age <= r.max);
    if (!row) return 0;
    let fee = row.values[program - 1] || 0;
    // Nhân số năm (nếu có)
    if (term && term > 1) fee = fee * term;
    return fee;
  };

  const getTotalPremium = () => {
    return participants.reduce(
      (sum, participant) => sum + participant.premium,
      0
    );
  };

  const handleNext = async () => {
    console.log("=== handleNext called ===");
    console.log("Current step:", currentStep);
    console.log("Total steps:", totalSteps);
    setShowError(false);
    let currentStepErrors: { [key: string]: string } = {};

    try {
      if (currentStep === 1) {
        console.log("Validating step 1...");
        console.log("Participant count:", participantCount);
        // Validate step 1
        if (participantCount < 1) {
          currentStepErrors.participantCount =
            "Vui lòng chọn số người tham gia từ 1 trở lên";
        }
      } else if (currentStep === 2) {
        console.log("Validating step 2...");
        console.log("Participants:", participants);
        console.log("Customer info:", customerInfo);

        // Validate participant info
        participants.forEach((participant, index) => {
          console.log(`Validating participant ${index}:`, participant);

          // Chỉ validate các trường bắt buộc
          if (!participant.fullName) {
            currentStepErrors[`participant${index}Name`] =
              "Vui lòng nhập họ và tên";
          }
          if (!participant.dateOfBirth) {
            currentStepErrors[`participant${index}Birth`] =
              "Vui lòng chọn ngày sinh";
          }
          if (!participant.identityCard) {
            currentStepErrors[`participant${index}Id`] =
              "Vui lòng nhập CMND/CCCD";
          }
          if (!participant.package) {
            currentStepErrors[`participant${index}Package`] =
              "Vui lòng chọn Chương trình bảo hiểm";
          }

          // Validate age
          const birthDate = new Date(participant.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const finalAge =
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ? age - 1
              : age;

          if (finalAge < 16 || finalAge > 60) {
            currentStepErrors[`participant${index}Birth`] =
              "Độ tuổi tham gia bảo hiểm từ 16 đến 60 tuổi";
          }
        });

        // Validate main customer info
        console.log("Validating customer info...");
        if (!customerInfo.fullName) {
          currentStepErrors.customerName = "Vui lòng nhập họ và tên";
        }
        if (!customerInfo.phone) {
          currentStepErrors.customerPhone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10}$/.test(customerInfo.phone)) {
          currentStepErrors.customerPhone = "Số điện thoại không hợp lệ";
        }
        if (!customerInfo.email) {
          currentStepErrors.customerEmail = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          currentStepErrors.customerEmail = "Email không hợp lệ";
        }
        if (!customerInfo.address) {
          currentStepErrors.customerAddress = "Vui lòng nhập địa chỉ";
        }

        // Organization-specific validations
        if (customerInfo.type === "organization") {
          if (!customerInfo.companyName) {
            currentStepErrors.companyName = "Vui lòng nhập tên công ty";
          }
          if (!customerInfo.taxCode) {
            currentStepErrors.taxCode = "Vui lòng nhập mã số thuế";
          } else if (!/^[0-9]{10}([0-9]{3})?$/.test(customerInfo.taxCode)) {
            currentStepErrors.taxCode = "Mã số thuế không hợp lệ";
          }
          if (!customerInfo.companyAddress) {
            currentStepErrors.companyAddress = "Vui lòng nhập địa chỉ công ty";
          }
        }
      }

      console.log("Validation errors:", currentStepErrors);
      if (Object.keys(currentStepErrors).length > 0) {
        console.log("Found validation errors, setting errors state");
        setErrors(currentStepErrors);
        setShowError(true);
        return;
      }

      console.log("No validation errors, proceeding to next step");
      setErrors({});
      window.scrollTo(0, 0);

      if (currentStep < totalSteps) {
        console.log("Moving to next step:", currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        console.log("Reached final step, calling handleSubmit");
        await handleOrderAccidentExtended();
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      setShowError(true);
    }
  };

  const handlePrevStep = () => {
    console.log("=== handlePrevStep called ===");
    console.log("Current step before:", currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowError(false);
      setErrors({});
      window.scrollTo(0, 0);
      console.log("Moving to previous step:", currentStep - 1);
    } else {
      console.log("Already at first step, cannot go back");
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (numbers.length > 10) {
      return numbers.slice(0, 10);
    }

    return numbers;
  };

  const formatIdentityCard = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");

    // Limit to 12 digits (for CCCD) or 9 digits (for CMND)
    if (numbers.length > 12) {
      return numbers.slice(0, 12);
    }

    return numbers;
  };

  const handleParticipantChange = (
    index: number,
    field: keyof ParticipantInfo,
    value: string | number
  ) => {
    console.log(
      `=== handleParticipantChange called for participant ${index} ===`
    );
    console.log("Field:", field);
    console.log("Value:", value);
    const newParticipants = [...participants];

    // Format input values
    let formattedValue = value;
    if (field === "phoneNumber") {
      formattedValue = formatPhoneNumber(value as string);
    } else if (field === "identityCard") {
      formattedValue = formatIdentityCard(value as string);
    }

    // Update the field
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: formattedValue,
    };

    // Recalculate premium if relevant fields change
    if (
      field === "package" ||
      field === "insuranceTerm" ||
      field === "dateOfBirth" ||
      field === "productPackage"
    ) {
      console.log("Recalculating premium for participant", index);
      const participant = newParticipants[index];
      if (
        participant.dateOfBirth &&
        participant.package &&
        participant.insuranceTerm
      ) {
        const premium = calculatePremium(
          participant.dateOfBirth,
          participant.package,
          participant.insuranceTerm,
          participant.gender,
          participant.productPackage
        );
        console.log("New premium calculated:", premium);
        newParticipants[index].premium = premium;
      }
    }

    console.log("Updated participant:", newParticipants[index]);
    setParticipants(newParticipants);
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: any) => {
    console.log("=== handleCustomerInfoChange called ===");
    console.log("Field:", field);
    console.log("Value:", value);
    let formattedValue = value;

    // Format input values
    if (field === "phone") {
      formattedValue = formatPhoneNumber(value);
    } else if (field === "identityCard") {
      formattedValue = formatIdentityCard(value);
    } else if (field === "taxCode") {
      formattedValue = value.replace(/\D/g, "").slice(0, 13);
    }

    console.log("Formatted value:", formattedValue);
    setCustomerInfo((prev) => {
      const newInfo = {
        ...prev,
        [field]: formattedValue,
      };
      console.log("Updated customer info:", newInfo);
      return newInfo;
    });
  };

  const handleOrderAccidentExtended = async () => {
    try {
      // Chuẩn bị invoice
      const insuranceStart = customerInfo.insuranceStartDate
        ? new Date(customerInfo.insuranceStartDate)
        : new Date();
      const insuranceEnd = new Date(insuranceStart);
      insuranceEnd.setFullYear(
        insuranceEnd.getFullYear() + (customerInfo.insuranceTerm || 1)
      );
      const invoice = {
        customer_id: null, // Có thể cập nhật sau nếu có
        product_id: 11, // ID sản phẩm bảo hiểm tai nạn mở rộng (cần xác nhận lại nếu backend quy định khác)
        user_id: null, // Có thể lấy từ context đăng nhập nếu có
        form_id: null,
        insurance_package:
          participants[0]?.productPackage === "abc" ? "Gói ABC" : "Gói AB",
        insurance_start: insuranceStart.toISOString(),
        insurance_end: insuranceEnd.toISOString(),
        insurance_amount: 0,
        insurance_quantity: participants.length,
        contract_type: "Mới",
        status: "Chưa thanh toán",
      };
      // Chuẩn bị participants
      const participantsPayload = participants.map((p) => ({
        full_name: p.fullName,
        gender:
          p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác",
        birth_date: p.dateOfBirth
          ? new Date(p.dateOfBirth).toISOString()
          : null,
        identity_number: p.identityCard,
        cmnd_img: "",
      }));
      // Gọi API
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/insurance_accident/create_accident`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice, participants: participantsPayload }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi khi tạo hóa đơn!");
      // Lưu đơn hàng vào localStorage và chuyển hướng sang giỏ hàng
      const cartItem = {
        id: "EXTACC",
        name: "Bảo hiểm tai nạn mở rộng",
        description: `${participants.length} người, Gói: ${
          participants[0]?.productPackage === "abc" ? "Gói ABC" : "Gói AB"
        }`,
        price: getTotalPremium(),
        image: "/products/bic-tai-nan-mo-rong.png",
        buyerName: customerInfo.fullName,
        buyerPhone: customerInfo.phone,
        buyerEmail: customerInfo.email,
        isSelected: true,
      };
      localStorage.setItem("cartItem", JSON.stringify(cartItem));
      window.location.href = "/gio-hang.html";
    } catch (err: any) {
      alert("Lỗi: " + (err.message || "Không xác định"));
    }
  };

  const handleParticipantCountChange = (value: number) => {
    setParticipantCount(value);
    if (value > participants.length) {
      // Add new participants
      const newParticipants = [...participants];
      for (let i = participants.length; i < value; i++) {
        newParticipants.push({
          fullName: "",
          dateOfBirth: "",
          gender: "male",
          identityCard: "",
          relationship: "",
          phoneNumber: "",
          email: "",
          address: "",
          package: "basic",
          insuranceTerm: 1,
          premium: 0,
          additionalBenefitOption: "",
        });
      }
      setParticipants(newParticipants);
    } else if (value < participants.length) {
      // Remove excess participants
      setParticipants(participants.slice(0, value));
    }
  };

  const renderStep1Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin
          </h3>
          {/* Bảng quyền lợi bảo hiểm */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-gray-300 bg-white rounded-lg">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th
                    className="p-3 text-center border align-middle"
                    rowSpan={2}
                  >
                    Điều kiện
                  </th>
                  <th
                    className="p-3 text-center border align-middle"
                    rowSpan={2}
                  >
                    Nội dung quyền lợi
                  </th>
                  <th
                    className="p-3 text-center border align-middle"
                    colSpan={4}
                  >
                    Số tiền bảo hiểm/người (VNĐ)
                  </th>
                </tr>
                <tr className="bg-red-600 text-white">
                  <th className="p-3 text-center border">Chương trình 1</th>
                  <th className="p-3 text-center border">Chương trình 2</th>
                  <th className="p-3 text-center border">Chương trình 3</th>
                  <th className="p-3 text-center border">Chương trình 4</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {/* Điều kiện A */}
                <tr>
                  <td className="border p-2 align-middle" rowSpan={1}>
                    <b>A</b>
                  </td>
                  <td className="border p-2 align-middle">
                    Tử vong do ốm đau, bệnh tật
                  </td>
                  <td className="border p-2 text-center align-middle">
                    10,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    20,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    50,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    100,000,000
                  </td>
                </tr>
                {/* Điều kiện B */}
                <tr>
                  <td className="border p-2 align-middle" rowSpan={3}>
                    <b>B</b>
                  </td>
                  <td className="border p-2 align-middle">
                    Tử vong, thương tật thân thể do tai nạn
                  </td>
                  <td className="border p-2 text-center align-middle">
                    20,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    20,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    50,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    100,000,000
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 align-middle">
                    Tử vong do tai nạn
                  </td>
                  <td
                    className="border p-2 text-center align-middle"
                    colSpan={4}
                  >
                    100% STBH
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 align-middle">
                    Thương tật thân thể do tai nạn
                  </td>
                  <td
                    className="border p-2 text-center align-middle"
                    colSpan={4}
                  >
                    Theo bảng tỷ lệ thương tật
                  </td>
                </tr>
                {/* Điều kiện C */}
                <tr>
                  <td className="border p-2 align-middle" rowSpan={3}>
                    <b>C (lựa chọn)</b>
                  </td>
                  <td className="border p-2 align-middle">
                    Trợ cấp nằm viện/phẫu thuật do ốm đau, bệnh tật
                  </td>
                  <td className="border p-2 text-center align-middle">
                    10,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    20,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    30,000,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    50,000,000
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 align-middle">
                    - Trợ cấp cho 1 ngày nằm viện do ốm đau, bệnh tật. Tối đa 60
                    ngày/năm
                  </td>
                  <td className="border p-2 text-center align-middle">
                    30,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    60,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    90,000
                  </td>
                  <td className="border p-2 text-center align-middle">
                    150,000
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 align-middle">
                    - Trợ cấp phẫu thuật do ốm đau, bệnh tật
                  </td>
                  <td
                    className="border p-2 text-center align-middle"
                    colSpan={4}
                  >
                    Theo bảng tỷ lệ phẫu thuật
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Số người tham gia BH */}
          <div className="grid grid-cols-12 items-center mb-4">
            <label className="col-span-4 text-left pr-4 text-lg font-medium text-gray-700">
              Số người tham gia BH <span className="text-red-600">*</span>
            </label>
            <div className="col-span-8">
              <input
                type="number"
                min={1}
                max={100}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-base"
                placeholder="Nhập số người tham gia"
              />
            </div>
          </div>
          {/* Nút tiếp tục và CustomerSupport */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
            >
              Tiếp tục
            </button>
          </div>
          <CustomerSupport />
        </div>
      </div>
    );
  };

  const renderStep2Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin người tham gia bảo hiểm
          </h3>

          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-600 text-white divide-x divide-white">
                  <th className="w-[5%] p-3 text-center text-sm font-semibold border-b">
                    STT
                  </th>
                  <th className="w-[16%] p-3 text-center text-sm font-semibold border-b">
                    Họ tên
                  </th>
                  <th className="w-[12%] p-3 text-center text-sm font-semibold border-b">
                    Ngày sinh
                  </th>
                  <th className="w-[10%] p-3 text-center text-sm font-semibold border-b">
                    Quốc tịch
                  </th>
                  <th className="w-[14%] p-3 text-center text-sm font-semibold border-b">
                    Số CMND/Hộ chiếu
                  </th>
                  <th className="w-[15%] p-3 text-center text-sm font-semibold border-b">
                    Chương trình <span className="text-red-500">*</span>
                  </th>
                  <th className="w-[10%] p-3 text-center text-sm font-semibold border-b">
                    Gói sản phẩm <span className="text-red-500">*</span>
                  </th>
                  <th className="w-[10%] p-3 text-center text-sm font-semibold border-b">
                    Phí BH (miễn VAT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={participant.fullName}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "fullName",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}Name`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Họ tên"
                      />
                      {errors[`participant${index}Name`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}Name`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="date"
                        value={participant.dateOfBirth}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}Birth`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`participant${index}Birth`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}Birth`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={participant.nationality || ""}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "nationality",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}Nationality`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Quốc tịch"
                      />
                      {errors[`participant${index}Nationality`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}Nationality`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={participant.identityCard}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "identityCard",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}Id`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="CMND/CCCD/Hộ chiếu"
                      />
                      {errors[`participant${index}Id`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}Id`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <select
                        value={participant.package}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "package",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}Package`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Chương trình</option>
                        <option value="basic">Chương trình 1</option>
                        <option value="premium">Chương trình 2</option>
                        <option value="plus">Chương trình 3</option>
                        <option value="plus4">Chương trình 4</option>
                      </select>
                      {errors[`participant${index}Package`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}Package`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <select
                        value={participant.productPackage || ""}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "productPackage",
                            e.target.value as "abc" | "ab" | ""
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`participant${index}ProductPackage`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Chọn</option>
                        <option value="abc">Gói ABC</option>
                        <option value="ab">Gói AB</option>
                      </select>
                      {errors[`participant${index}AdditionalBenefit`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`participant${index}AdditionalBenefit`]}
                        </p>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-base">
                        {participant.premium.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thông tin Bên mua bảo hiểm section */}
          <div className="mt-8">
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
                      handleCustomerInfoChange("type", e.target.value)
                    }
                    className={selectClassName}
                  >
                    <option value="individual">Cá nhân</option>
                    <option value="organization">Tổ chức</option>
                  </select>
                </div>
              </div>

              {/* CMND/CCCD */}
              <div className="flex items-center gap-8">
                <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                  {customerInfo.type === "organization"
                    ? "Mã số thuế"
                    : "CMND/CCCD"}
                  <span className="text-red-600">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={customerInfo.identityCard}
                    onChange={(e) =>
                      handleCustomerInfoChange("identityCard", e.target.value)
                    }
                    className={inputClassName}
                    placeholder={
                      customerInfo.type === "organization"
                        ? "Nhập mã số thuế"
                        : "Nhập CMND/CCCD"
                    }
                  />
                </div>
              </div>

              {/* Họ và tên */}
              <div className="flex items-center gap-8">
                <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                  {customerInfo.type === "organization"
                    ? "Tên công ty/ Tổ chức"
                    : "Họ và tên"}
                  <span className="text-red-600">*</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) =>
                      handleCustomerInfoChange("fullName", e.target.value)
                    }
                    className={inputClassName}
                    placeholder={
                      customerInfo.type === "organization"
                        ? "Nhập tên công ty/ tổ chức"
                        : "Nhập họ và tên"
                    }
                  />
                </div>
              </div>

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
                      handleCustomerInfoChange("address", e.target.value)
                    }
                    className={inputClassName}
                    placeholder="Nhập địa chỉ"
                  />
                  {showError && errors.customerAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerAddress}
                    </p>
                  )}
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
                      handleCustomerInfoChange("email", e.target.value)
                    }
                    className={inputClassName}
                    placeholder="Nhập email"
                  />
                  {showError && errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerEmail}
                    </p>
                  )}
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
                      handleCustomerInfoChange("phone", e.target.value)
                    }
                    className={inputClassName}
                    placeholder="Nhập số điện thoại"
                  />
                  {showError && errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerPhone}
                    </p>
                  )}
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
                      handleCustomerInfoChange(
                        "insuranceTerm",
                        Number(e.target.value)
                      )
                    }
                    className={selectClassName}
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
                      handleCustomerInfoChange(
                        "insuranceStartDate",
                        e.target.value
                      )
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box tổng phí bảo hiểm */}
        <div className="p-0 text-left mt-8 mb-8">
          <p className="text-lg">
            Tổng phí (miễn VAT):
            <span className="text-red-600 font-bold ml-2">
              {getTotalPremium().toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
          <p className="text-lg">
            Số tiền chiết khấu:
            <span className="text-red-600 font-bold ml-2">0 VNĐ</span>
          </p>
          <hr className="my-2" />
          <p className="text-xl font-bold">
            Tổng phí thực thu (miễn VAT):
            <span className="text-red-600 ml-2">
              {getTotalPremium().toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
        </div>

        {/* Navigation buttons */}
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
  };

  const renderStep3Content = () => {
    return (
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
                  onClick={() => {
                    setCustomerInfo({
                      ...customerInfo,
                      fullName: customerInfo.fullName,
                      address: customerInfo.address,
                      identityCard: customerInfo.identityCard,
                      email: customerInfo.email,
                      phone: customerInfo.phone,
                    });
                  }}
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
                  value={customerInfo.fullName}
                  onChange={(e) =>
                    handleCustomerInfoChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
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
                  value={customerInfo.address}
                  onChange={(e) =>
                    handleCustomerInfoChange("address", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
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
                  value={customerInfo.email}
                  onChange={(e) =>
                    handleCustomerInfoChange("email", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
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
                  value={customerInfo.phone}
                  onChange={(e) =>
                    handleCustomerInfoChange("phone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
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

            {/* Xuất hóa đơn */}
            <div className="border-t pt-6 mt-8">
              <h4 className="text-lg font-medium mb-4">Xuất hóa đơn</h4>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="invoice"
                    value="no"
                    checked={!customerInfo.invoice}
                    onChange={() => handleCustomerInfoChange("invoice", false)}
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
                    onChange={() => handleCustomerInfoChange("invoice", true)}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Có nhận hóa đơn</span>
                </label>
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner */}
      <div className="w-full pt-[84px]">
        <img
          src="/products/banner-cancer.png"
          alt="Banner bảo hiểm ung thư"
          className="w-full"
        />
      </div>
      <div className="max-w-[1200px] mx-auto p-6 bg-white rounded-lg shadow-md">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center">
            {/* Icon Thông tin chung */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  currentStep <= 1 ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <ClipboardList
                  className={`w-8 h-8 ${
                    currentStep <= 1 ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-m font-bold ${
                  currentStep <= 1 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Thông tin chung
              </span>
            </div>

            <div className="w-32 h-[2px] bg-gray-300 mx-4"></div>

            {/* Icon Thông tin người tham gia */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 2 ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <UserCircle2
                  className={`w-8 h-8 ${
                    currentStep === 2 ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-m font-bold ${
                  currentStep === 2 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Thông tin người tham gia
              </span>
            </div>

            <div className="w-32 h-[2px] bg-gray-300 mx-4"></div>

            {/* Icon Thanh toán */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 3 ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <CreditCard
                  className={`w-8 h-8 ${
                    currentStep === 3 ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-m font-bold ${
                  currentStep === 3 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Thanh toán
              </span>
            </div>
          </div>
        </div>

        {/* General error display */}
        {showError && errors.submit && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Render step content */}
        <div key={currentStep}>
          {currentStep === 1 && renderStep1Content()}
          {currentStep === 2 && renderStep2Content()}
          {currentStep === 3 && renderStep3Content()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
