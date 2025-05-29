import { ClipboardList, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { useNavigate } from "react-router-dom";
import {
  CAR_INSURANCE_DATA,
  calculateTotalInsuranceFee,
} from "../constants/carInsurance";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Định nghĩa các loại dữ liệu
interface ProductInfo {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  image: string;
  category: string;
}

interface CustomerInfo {
  type: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  identityCard: string;
  dateOfBirth: string;
  invoice: boolean;
}

interface VehicleInfo {
  ownerType: string;
  identityCard: string;
  purpose: string;
  vehicleType: string;
  seats: number;
  loadCapacity: number;
  ownerName: string;
  registrationAddress: string;
  hasPlate: boolean;
  plateNumberPrefix: string;
  plateNumberSuffix: string;
  chassisNumber: string;
  engineNumber: string;
  insuranceStartDate: string;
  insuranceTerm: number;
  insuranceAmount: number;
  accidentCoverage: number;
  accidentParticipants: number;
}

export default function OrderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State cho thông tin sản phẩm
  const [product] = useState<ProductInfo>({
    id: "MVL",
    name: "Bảo hiểm vật chất ô tô",
    price: "1.200.000đ",
    numericPrice: 1200000,
    image: "/placeholder.svg?height=200&width=300",
    category: "bao-hiem-o-to-9",
  });

  // State cho bước
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // State cho validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);

  // State cho thông tin bảo hiểm
  const [insuranceType, setInsuranceType] = useState("");
  const [vehicleCount, setVehicleCount] = useState(1);
  const [licensePlateNumber, setLicensePlateNumber] = useState("");

  // State cho hiển thị phí
  const [tndsFeeDisplay, setTndsFeeDisplay] = useState(0);
  const [accidentFeeDisplay, setAccidentFeeDisplay] = useState(0);
  const [totalFeeDisplay, setTotalFeeDisplay] = useState(0);

  // State cho thông tin khách hàng
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    type: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    identityCard: "",
    dateOfBirth: "",
    invoice: false,
  });

  // State cho thông tin xe
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    ownerType: "",
    identityCard: "",
    purpose: "",
    vehicleType: "",
    seats: 0,
    loadCapacity: 0,
    ownerName: "",
    registrationAddress: "",
    hasPlate: true,
    plateNumberPrefix: "29A",
    plateNumberSuffix: "",
    chassisNumber: "",
    engineNumber: "",
    insuranceStartDate: new Date().toISOString().slice(0, 10),
    insuranceTerm: 1,
    insuranceAmount: 480700,
    accidentCoverage: 0,
    accidentParticipants: 0,
  });

  // Danh sách các mức tiền bảo hiểm tai nạn
  const accidentCoverageOptions = [
    { value: 10000000, label: "10 triệu đồng/người/vụ" },
    { value: 20000000, label: "20 triệu đồng/người/vụ" },
    { value: 30000000, label: "30 triệu đồng/người/vụ" },
    { value: 50000000, label: "50 triệu đồng/người/vụ" },
    { value: 100000000, label: "100 triệu đồng/người/vụ" },
  ];

  // Effect để tính toán lại phí khi thông tin xe thay đổi
  useEffect(() => {
    if (vehicleInfo.purpose && vehicleInfo.vehicleType) {
      const calculatedFees = calculateTotalInsuranceFee(
        vehicleInfo.purpose,
        vehicleInfo.vehicleType,
        vehicleInfo.insuranceTerm,
        vehicleInfo.accidentCoverage
      );
      setTndsFeeDisplay(calculatedFees.tndsFee);
      // Tính lại phí bảo hiểm tai nạn theo công thức mới: 0.1% * Số tiền bảo hiểm * Số người
      const calculatedAccidentFee =
        (vehicleInfo.accidentCoverage || 0) * (vehicleInfo.seats || 0) * 0.001;
      setAccidentFeeDisplay(calculatedAccidentFee);
      // Tổng phí = Phí TNDS + Phí tai nạn
      setTotalFeeDisplay(calculatedFees.tndsFee + calculatedAccidentFee);
    } else {
      // Reset fees if essential information is missing
      setTndsFeeDisplay(0);
      setAccidentFeeDisplay(0);
      setTotalFeeDisplay(0);
    }
  }, [vehicleInfo]); // Re-run effect when vehicleInfo changes

  // Xử lý chuyển bước
  const handleNextStep = async () => {
    console.log("Current step:", currentStep);
    console.log("Total steps:", totalSteps);
    console.log("handleNextStep called"); // Log start of function

    let currentStepErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      // Validate step 1
      console.log("Validating step 1..."); // Log validation start
      console.log("insuranceType:", insuranceType);
      console.log("licensePlateNumber:", licensePlateNumber);
      console.log("vehicleCount:", vehicleCount);

      if (!insuranceType) {
        currentStepErrors.insuranceType =
          "Vui lòng chọn đối tượng được bảo hiểm";
      }

      // Chỉ validate Số GCNBH/BKS khi là Hợp đồng tái tục
      if (insuranceType === "renewal" && !licensePlateNumber) {
        currentStepErrors.licensePlateNumber = "Vui lòng nhập số GCNBH/BKS";
      }

      if (!vehicleCount) {
        currentStepErrors.vehicleCount = "Vui lòng chọn số lượng xe";
      }
    } else if (currentStep === 2) {
      // Validate step 2
      console.log("Validating step 2...");
      if (!vehicleInfo.ownerType) {
        currentStepErrors.ownerType = "Vui lòng chọn người mua bảo hiểm";
      }
      if (!vehicleInfo.identityCard) {
        currentStepErrors.identityCard =
          vehicleInfo.ownerType === "business"
            ? "Vui lòng nhập Mã số thuế"
            : "Vui lòng nhập CMND/CCCD";
      }
      if (!vehicleInfo.purpose) {
        currentStepErrors.purpose = "Vui lòng chọn mục đích sử dụng";
      }
      if (!vehicleInfo.vehicleType) {
        currentStepErrors.vehicleType = "Vui lòng chọn loại xe";
      }
      if (!vehicleInfo.seats) {
        currentStepErrors.seats = "Vui lòng nhập số chỗ ngồi";
      }
      if (!vehicleInfo.ownerName) {
        currentStepErrors.ownerName = "Vui lòng nhập tên chủ xe";
      }
      if (!vehicleInfo.registrationAddress) {
        currentStepErrors.registrationAddress =
          "Vui lòng nhập địa chỉ đăng ký xe";
      }
      if (!vehicleInfo.chassisNumber) {
        currentStepErrors.chassisNumber = "Vui lòng nhập số khung";
      }
      if (!vehicleInfo.engineNumber) {
        currentStepErrors.engineNumber = "Vui lòng nhập số máy";
      }
      if (!vehicleInfo.insuranceStartDate) {
        currentStepErrors.insuranceStartDate =
          "Vui lòng chọn thời hạn bảo hiểm từ";
      }
      if (!vehicleInfo.plateNumberSuffix && vehicleInfo.hasPlate) {
        currentStepErrors.plateNumberSuffix = "Vui lòng nhập biển kiểm soát";
      }
    } else if (currentStep === 3) {
      // Validate step 3
      console.log("Validating step 3...");
      if (!customerInfo.fullName) {
        currentStepErrors.fullName = "Vui lòng nhập họ và tên";
      }
      if (!customerInfo.address) {
        currentStepErrors.address = "Vui lòng nhập địa chỉ";
      }
      if (!customerInfo.email) {
        currentStepErrors.email = "Vui lòng nhập email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
        currentStepErrors.email = "Email không hợp lệ";
      }
      if (!customerInfo.phone) {
        currentStepErrors.phone = "Vui lòng nhập số điện thoại";
      } else if (!/^[0-9]{10}$/.test(customerInfo.phone)) {
        currentStepErrors.phone = "Số điện thoại không hợp lệ";
      }
    }

    if (Object.keys(currentStepErrors).length > 0) {
      console.log("Validation errors found:", currentStepErrors);
      setErrors(currentStepErrors);
      setShowError(true);
    } else {
      console.log(`Step ${currentStep} validation passed.`);
      setShowError(false);
      setErrors({});
      window.scrollTo(0, 0);

      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        try {
          // Construct the order data payload
          // Dữ liệu cho CarInsuranceForm
          const carInsuranceFormPayload = {
            user_type:
              vehicleInfo.ownerType === "personal" ? "Cá nhân" : "Tổ chức", // Chuyển đổi sang định dạng backend mong muốn
            identity_number: vehicleInfo.identityCard,
            usage_purpose: vehicleInfo.purpose, // Sử dụng giá trị từ state
            vehicle_type: vehicleInfo.vehicleType, // Sử dụng giá trị từ state
            seat_count: vehicleInfo.seats,
            load_capacity: vehicleInfo.loadCapacity,
            owner_name: vehicleInfo.ownerName,
            registration_address: vehicleInfo.registrationAddress,
            license_plate_status: vehicleInfo.hasPlate ? "Mới" : "Chưa có", // Chuyển đổi sang định dạng backend (giả định Đã có -> Mới)
            license_plate: vehicleInfo.hasPlate
              ? `${vehicleInfo.plateNumberPrefix}-${vehicleInfo.plateNumberSuffix}`
              : "", // Kết hợp biển số
            chassis_number: vehicleInfo.chassisNumber,
            engine_number: vehicleInfo.engineNumber,
            insurance_start: vehicleInfo.insuranceStartDate.slice(0, 10), // Chỉ lấy ngày (YYYY-MM-DD)
            insurance_duration: vehicleInfo.insuranceTerm,
            insurance_fee: totalFeeDisplay, // Sử dụng tổng phí đã tính
            insurance_amount: vehicleInfo.accidentCoverage, // Số tiền bảo hiểm tai nạn
            participant_count: vehicleInfo.seats, // Số người = Số chỗ ngồi
          };

          // Make the API call to create the CarInsuranceForm
          const carFormResponse = await axios.post(
            `${API_URL}/api/insurance_car_owner/create_car_insurance_form`,
            carInsuranceFormPayload
          );

          console.log(
            "CarInsuranceForm created successfully:",
            carFormResponse.data
          );
          const formId = carFormResponse.data.form_id;

          // 2. Create CustomerRegistration
          const customerRegistrationPayload = {
            customer_type:
              customerInfo.type === "personal" ? "Cá nhân" : "Tổ chức",
            identity_number: customerInfo.identityCard,
            full_name: customerInfo.fullName,
            address: customerInfo.address,
            email: customerInfo.email,
            phone_number: customerInfo.phone,
            invoice_request: customerInfo.invoice,
            notes: "",
          };

          const customerResponse = await axios.post(
            `${API_URL}/api/insurance_car_owner/create_customer_registration`,
            customerRegistrationPayload
          );

          console.log(
            "CustomerRegistration created successfully:",
            customerResponse.data
          );
          const customerId = customerResponse.data.customer_id;

          // 3. Create Invoice
          const invoicePayload = {
            product_id: 1, // Cần thay thế bằng ID sản phẩm thực tế nếu có
            contract_type: insuranceType === "new" ? "Mới" : "Tái tục",
            insurance_amount: parseFloat(totalFeeDisplay.toFixed(2)), // Làm tròn đến 2 chữ số thập phân và đảm bảo là số
            insurance_start: vehicleInfo.insuranceStartDate.slice(0, 10), // Lấy định dạng YYYY-MM-DD
            // Tính InsuranceEnd dựa trên insuranceStartDate và insuranceTerm
            // (Cần hàm hoặc logic để tính ngày kết thúc chính xác)
            // Tạm thời giả định 1 năm sau ngày bắt đầu
            insurance_end: new Date(
              new Date(vehicleInfo.insuranceStartDate.slice(0, 10)).setFullYear(
                new Date(
                  vehicleInfo.insuranceStartDate.slice(0, 10)
                ).getFullYear() + vehicleInfo.insuranceTerm
              )
            )
              .toISOString()
              .slice(0, 10),
            insurance_quantity: 1, // Hoặc lấy từ state nếu có nhiều xe trong 1 hóa đơn
            customer_id: customerId,
            form_id: formId,
          };

          const invoiceResponse = await axios.post(
            `${API_URL}/api/insurance_car_owner/create_invoice`,
            invoicePayload
          );

          console.log("Invoice created successfully:", invoiceResponse.data);
          const invoiceId = invoiceResponse.data.invoice_id;

          // 4. Confirm Purchase
          const confirmPurchasePayload = {
            invoice_id: invoiceId,
            customer_id: customerId,
            form_id: formId,
          };

          const confirmResponse = await axios.post(
            `${API_URL}/api/insurance_car_owner/confirm_purchase`,
            confirmPurchasePayload
          );

          console.log("ConfirmPurchase successful:", confirmResponse.data);
          navigate("/gio-hang.html");
        } catch (error) {
          console.error("Error creating order:", error);
          // TODO: Handle error (e.g., show error message to user)
        }
      }
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

  // Content for Step 2
  const renderStep2Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin xe 1
          </h3>

          <div className="space-y-6">
            {/* Người mua bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Người mua bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  value={vehicleInfo.ownerType}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      ownerType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- Chọn --</option>
                  <option value="personal">Cá nhân</option>
                  <option value="business">Tổ chức</option>
                </select>
              </div>
            </div>

            {/* CMND/CCCD */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                {vehicleInfo.ownerType === "business"
                  ? "Mã số thuế"
                  : "CMND/CCCD"}{" "}
                <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={vehicleInfo.identityCard}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      identityCard: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Mục đích sử dụng */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Mục đích sử dụng <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  value={vehicleInfo.purpose}
                  onChange={(e) =>
                    setVehicleInfo({ ...vehicleInfo, purpose: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- Chọn mục đích sử dụng --</option>
                  {CAR_INSURANCE_DATA.map((purpose) => (
                    <option key={purpose.usage} value={purpose.usage}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loại xe */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Loại xe <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  value={vehicleInfo.vehicleType}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      vehicleType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- Chọn loại xe --</option>
                  {CAR_INSURANCE_DATA.find(
                    (data) => data.usage === vehicleInfo.purpose
                  )?.vehicleTypes.map((vehicleType) => (
                    <option key={vehicleType.value} value={vehicleType.value}>
                      {vehicleType.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Số chỗ ngồi và Tải trọng xe */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Số chỗ ngồi <span className="text-red-600">*</span>
              </label>
              <div className="flex-1 grid grid-cols-2 gap-8">
                <input
                  type="number"
                  value={vehicleInfo.seats}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      seats: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="0"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-lg font-medium text-gray-700">
                      Tải trọng xe (tấn) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.loadCapacity}
                      onChange={(e) =>
                        setVehicleInfo({
                          ...vehicleInfo,
                          loadCapacity: Number(e.target.value),
                        })
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-sm text-gray-500 mt-1">
                    Nhập 0 nếu xe chở người
                  </span>
                </div>
              </div>
            </div>

            {/* Tên chủ xe */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Tên chủ xe <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={vehicleInfo.ownerName}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      ownerName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Địa chỉ đăng ký xe */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Địa chỉ đăng ký xe <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={vehicleInfo.registrationAddress}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      registrationAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Tình trạng biển số */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Tình trạng biển số
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="plateStatus"
                    checked={vehicleInfo.hasPlate}
                    onChange={() =>
                      setVehicleInfo({ ...vehicleInfo, hasPlate: true })
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Đã có biển số</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="plateStatus"
                    checked={!vehicleInfo.hasPlate}
                    onChange={() =>
                      setVehicleInfo({ ...vehicleInfo, hasPlate: false })
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Chưa có biển số</span>
                </label>
              </div>
            </div>

            {/* Biển kiểm soát */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Biển kiểm soát <span className="text-red-600">*</span>
              </label>
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="text"
                  value={vehicleInfo.plateNumberPrefix}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      plateNumberPrefix: e.target.value,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="29A"
                />
                <span className="text-xl">-</span>
                <input
                  type="text"
                  value={vehicleInfo.plateNumberSuffix}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      plateNumberSuffix: e.target.value,
                    })
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Số khung */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Số khung <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={vehicleInfo.chassisNumber}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      chassisNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Số máy */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Số máy <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={vehicleInfo.engineNumber}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      engineNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Thời hạn bảo hiểm từ */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Thời hạn bảo hiểm từ <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="date"
                  value={vehicleInfo.insuranceStartDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value; // Lấy giá trị từ input (định dạng YYYY-MM-DD)
                    setVehicleInfo({
                      ...vehicleInfo,
                      insuranceStartDate: selectedDate,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Thời hạn bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Thời hạn bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <select
                  value={vehicleInfo.insuranceTerm}
                  onChange={(e) =>
                    setVehicleInfo({
                      ...vehicleInfo,
                      insuranceTerm: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value={1}>1 năm</option>
                  <option value={2}>2 năm</option>
                  <option value={3}>3 năm</option>
                </select>
              </div>
            </div>

            {/* Phí bảo hiểm */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Phí bảo hiểm (gồm VAT)
              </label>
              <div className="flex-1">
                <p className="text-lg font-medium">
                  {new Intl.NumberFormat("vi-VN").format(
                    vehicleInfo.insuranceAmount
                  )}{" "}
                  VND
                </p>
              </div>
            </div>

            {/* Bảo hiểm tai nạn section */}
            <div className="border-t pt-6 mt-8">
              <h4 className="text-lg font-medium mb-6">
                Bảo hiểm tai nạn lái xe & người ngồi trên xe
              </h4>

              <div className="flex items-start gap-8">
                <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                  Số tiền bảo hiểm <span className="text-red-600">*</span>
                </label>
                <div className="flex-1 flex items-center gap-4">
                  <select
                    value={vehicleInfo.accidentCoverage}
                    onChange={(e) =>
                      setVehicleInfo({
                        ...vehicleInfo,
                        accidentCoverage: Number(e.target.value),
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  >
                    <option value="">Chọn số tiền bảo hiểm</option>
                    {accidentCoverageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={vehicleInfo.seats}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-gray-100"
                    placeholder="0"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 italic">
                  (Bằng số chỗ ngồi trên xe)
                </p>
              </div>

              {/* Quyền lợi bảo hiểm */}
              <div className="mt-6">
                <div className="flex items-start gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Quyền lợi bảo hiểm
                  </label>
                  <div className="flex-1">
                    <p className="font-medium">
                      Chết và thương tật thân thể:
                      <br />
                      Trả đủ:{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        vehicleInfo.accidentCoverage
                      )}{" "}
                      VND/ người/Vụ
                    </p>
                    <p className="mt-2">
                      Theo{" "}
                      <a href="#" className="text-red-600 hover:underline">
                        Bảng tỷ lệ trả tiền thương tật
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Phí bảo hiểm tai nạn */}
              <div className="mt-6">
                <div className="flex items-start gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Phí bảo hiểm
                  </label>
                  <div className="flex-1">
                    <p className="font-medium">
                      {new Intl.NumberFormat("vi-VN").format(
                        accidentFeeDisplay
                      )}{" "}
                      VND
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng phí section */}
        {vehicleInfo.purpose && vehicleInfo.vehicleType && (
          <div className="border-t pt-6 mt-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">
                Tổng phí bảo hiểm TNDS (gồm VAT):
              </span>
              <span className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat("vi-VN").format(tndsFeeDisplay)} VND
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-medium">
                Tổng phí bảo hiểm tai nạn (miễn VAT):
              </span>
              <span className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat("vi-VN").format(accidentFeeDisplay)}
                VND
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-medium">
                Tổng phí bảo hiểm (VAT):
              </span>
              <span className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat("vi-VN").format(totalFeeDisplay)} VND
              </span>
            </div>
          </div>
        )}

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
            onClick={handleNextStep}
            className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    );
  };

  // Content for Step 3
  const renderStep3Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin tài khoản
          </h3>

          <div className="space-y-6">
            {/* Sao chép từ thông tin chủ xe */}
            <div className="flex items-start gap-8">
              <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                Sao chép từ thông tin chủ xe
              </label>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerInfo({
                      ...customerInfo,
                      fullName: vehicleInfo.ownerName,
                      address: vehicleInfo.registrationAddress,
                      identityCard: vehicleInfo.identityCard,
                    });
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sao chép từ thông tin chủ xe 1
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
                    setCustomerInfo({
                      ...customerInfo,
                      fullName: e.target.value,
                    })
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
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    })
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
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
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
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
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
                    onChange={() =>
                      setCustomerInfo({ ...customerInfo, invoice: false })
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
                      setCustomerInfo({ ...customerInfo, invoice: true })
                    }
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
            onClick={handleNextStep}
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
      {/* Banner sản phẩm */}
      <div className="w-full pt-[81px]">
        <img
          src={
            product.id === "MVL"
              ? "/products/banner1.png"
              : "/products/banner1.png"
          }
          alt={product.name}
          className="w-full"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center">
            {/* Icon Thông tin xe */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  currentStep <= 2 ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <ClipboardList
                  className={`w-8 h-8 ${
                    currentStep <= 2 ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-m font-bold ${
                  currentStep <= 2 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Thông tin xe
              </span>
            </div>

            <div className="w-32 h-[2px] bg-gray-300 mx-4"></div>

            {/* Icon Thông tin tài khoản */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 3 ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <UserCircle2
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
                Thông tin tài khoản
              </span>
            </div>
          </div>
        </div>

        {/* Render step content */}
        {currentStep === 1 && (
          <div style={{ maxWidth: "1000px" }} className="mx-auto">
            <div className="bg-[#F4F6F8] p-6 rounded-lg">
              <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
                Số lượng xe
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Đối tượng được bảo hiểm
                  </label>
                  <div className="flex-1">
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="insuranceType"
                          value="new"
                          checked={insuranceType === "new"}
                          onChange={(e) => setInsuranceType(e.target.value)}
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-2">Hợp đồng mới</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="insuranceType"
                          value="renewal"
                          checked={insuranceType === "renewal"}
                          onChange={(e) => setInsuranceType(e.target.value)}
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-2">Hợp đồng tái tục</span>
                      </label>
                    </div>
                    {showError && errors.insuranceType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.insuranceType}
                      </p>
                    )}
                    {insuranceType === "renewal" && (
                      <div className="mt-2">
                        <p className="text-sm italic text-gray-600 text-left">
                          Hợp đồng tái tục: Là Hợp đồng bảo hiểm thỏa mãn các
                          điều kiện sau:
                        </p>
                        <ul className="mt-1 text-sm italic text-gray-600 space-y-1 text-left">
                          <li>- Người được bảo hiểm không thay đổi;</li>
                          <li>
                            - Hợp đồng bảo hiểm trước đó có thời hạn bảo hiểm là
                            01 năm;
                          </li>
                          <li>
                            - Ngày bắt đầu bảo hiểm của Hợp đồng bảo hiểm tái
                            tục phải là tiếp theo liền kề ngày kết thúc thời hạn
                            bảo hiểm của Hợp đồng bảo hiểm trước đó.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {insuranceType === "renewal" && (
                  <div className="flex items-center gap-8">
                    <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                      Số GCNBH/BKS
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={licensePlateNumber}
                        onChange={(e) => setLicensePlateNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Nhập số GCNBH/BKS"
                      />
                      {showError && errors.licensePlateNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.licensePlateNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-8">
                  <label className="text-lg font-medium text-gray-700 min-w-[200px] flex justify-start">
                    Số xe mua bảo hiểm
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                      value={vehicleCount}
                      onChange={(e) => setVehicleCount(Number(e.target.value))}
                    >
                      <option value="">-- Chọn số lượng xe --</option>
                      <option value="1">1</option>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    {showError && errors.vehicleCount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vehicleCount}
                      </p>
                    )}
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
                onClick={handleNextStep}
                className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}
        {currentStep === 2 && renderStep2Content()}
        {currentStep === 3 && renderStep3Content()}
      </div>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
