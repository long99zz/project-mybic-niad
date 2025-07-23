import { ClipboardList, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Form, Select } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface MotorcycleVehicleInfo {
  ownerType: "personal" | "organization";
  identityCard?: string;
  engineCapacity: "under_50" | "over_50";
  ownerName: string;
  registrationAddress: string;
  hasPlate: boolean;
  chassisNumber: string;
  engineNumber: string;
  insuranceStartDate: string;
  insuranceTerm: number;
  tndsAmount?: number;
  tndsFeeDisplay?: number;
  productId: number;
}

interface CustomerInfo {
  type: string;
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
  receiveMethod: string;
  receiveAddress?: string;
  note?: string;
}

export default function MotorcycleCivilLiabilityOrderPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 2;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);
  const [insuranceType, setInsuranceType] = useState("new");
  const [licensePlateNumber, setLicensePlateNumber] = useState("");
  const [vehicleCount, setVehicleCount] = useState<number>(1);

  const [vehicleInfo, setVehicleInfo] = useState<MotorcycleVehicleInfo>({
    ownerType: "personal",
    engineCapacity: "under_50",
    ownerName: "",
    registrationAddress: "",
    hasPlate: true,
    chassisNumber: "",
    engineNumber: "",
    insuranceStartDate: dayjs().format("YYYY-MM-DD"),
    insuranceTerm: 1,
    tndsAmount: 0,
    tndsFeeDisplay: 0,
    productId: 3,
  });

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
  });

  const [tndsFeeDisplay, setTndsFeeDisplay] = useState(0);
  const [accidentCoverage, setAccidentCoverage] = useState(0);
  const [licensePlatePart1, setLicensePlatePart1] = useState("");
  const [licensePlatePart2, setLicensePlatePart2] = useState("");

  useEffect(() => {
    let calculatedTnds = 0;
    const engineCapacity = vehicleInfo.engineCapacity;

    if (engineCapacity === "under_50") {
      calculatedTnds = 60000; // Mô tô 2 bánh dưới 50cc
    } else if (engineCapacity === "over_50") {
      calculatedTnds = 66000; // Mô tô 2 bánh từ 50cc trở lên
    }

    // Thêm phí bảo hiểm tai nạn cho người ngồi trên xe
    // Công thức: (Hạn mức * 0.1% * 2)
    const accidentFee = accidentCoverage * 0.001 * 2;
    calculatedTnds = calculatedTnds + accidentFee;

    // Calculate term fee
    calculatedTnds = calculatedTnds * vehicleInfo.insuranceTerm;

    // Calculate for multiple vehicles
    calculatedTnds = calculatedTnds * vehicleCount;

    // Add VAT
    calculatedTnds = calculatedTnds * 1.1;

    setTndsFeeDisplay(calculatedTnds);
  }, [
    vehicleInfo.engineCapacity,
    vehicleInfo.insuranceTerm,
    vehicleCount,
    accidentCoverage,
  ]);

  useEffect(() => {
    // Mặc định hạn mức tai nạn là 10,000,000 nếu chưa chọn
    if (accidentCoverage === 0) {
      setAccidentCoverage(10000000);
    }
  }, [accidentCoverage]);

  const handleVehicleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setVehicleInfo((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextStep = async () => {
    console.log("handleNextStep called");
    console.log("Current step:", currentStep);
    console.log("Vehicle info:", vehicleInfo);
    console.log("Customer info:", customerInfo);
    setShowError(false);
    let currentStepErrors: { [key: string]: string } = {};

    try {
      if (currentStep === 1) {
        // Validation cho bước 1
        if (!insuranceType) {
          currentStepErrors.insuranceType =
            "Vui lòng chọn loại hợp đồng bảo hiểm";
        }
        if (insuranceType === "renewal" && !licensePlateNumber) {
          currentStepErrors.licensePlateNumber = "Vui lòng nhập số GCNBH/BKS";
        }
        if (!vehicleCount || vehicleCount < 1) {
          currentStepErrors.vehicleCount =
            "Vui lòng chọn số lượng xe và phải lớn hơn 0";
        }
        if (!vehicleInfo.engineCapacity) {
          currentStepErrors.engineCapacity =
            "Vui lòng chọn dung tích xi lanh xe";
        }
      } else if (currentStep === 2) {
        // Validation cho thông tin xe
        if (!vehicleInfo.ownerType) {
          currentStepErrors.ownerType = "Vui lòng chọn loại chủ sở hữu xe";
        }
        if (!vehicleInfo.ownerName?.trim()) {
          currentStepErrors.ownerName = "Vui lòng nhập tên chủ xe";
        }
        if (!vehicleInfo.registrationAddress?.trim()) {
          currentStepErrors.registrationAddress =
            "Vui lòng nhập địa chỉ đăng ký xe";
        }
        if (
          vehicleInfo.hasPlate &&
          (!licensePlatePart1.trim() || !licensePlatePart2.trim())
        ) {
          currentStepErrors.licensePlate = "Vui lòng nhập đầy đủ biển số xe";
        }
        if (!vehicleInfo.chassisNumber?.trim()) {
          currentStepErrors.chassisNumber = "Vui lòng nhập số khung xe";
        }
        if (!vehicleInfo.engineNumber?.trim()) {
          currentStepErrors.engineNumber = "Vui lòng nhập số máy xe";
        }
        if (!vehicleInfo.insuranceStartDate) {
          currentStepErrors.insuranceStartDate =
            "Vui lòng chọn ngày bắt đầu bảo hiểm";
        }
        if (!vehicleInfo.insuranceTerm) {
          currentStepErrors.insuranceTerm = "Vui lòng chọn thời hạn bảo hiểm";
        }
        if (!accidentCoverage || accidentCoverage === 0) {
          currentStepErrors.accidentCoverage = "Vui lòng chọn hạn mức tai nạn";
        }

        // Validation cho thông tin khách hàng
        if (!customerInfo.type) {
          currentStepErrors.type = "Vui lòng chọn loại người mua";
        }
        if (!customerInfo.fullName?.trim()) {
          currentStepErrors.fullName = "Vui lòng nhập họ và tên";
        }
        if (!customerInfo.address?.trim()) {
          currentStepErrors.address = "Vui lòng nhập địa chỉ";
        }
        if (!customerInfo.email?.trim()) {
          currentStepErrors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          currentStepErrors.email = "Email không hợp lệ";
        }
        if (!customerInfo.phone?.trim()) {
          currentStepErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (
          !/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\D/g, ""))
        ) {
          currentStepErrors.phone = "Số điện thoại không hợp lệ";
        }
        if (
          customerInfo.type === "individual" &&
          !customerInfo.identityCard?.trim()
        ) {
          currentStepErrors.identityCard = "Vui lòng nhập CMND/CCCD";
        } else if (
          customerInfo.identityCard &&
          !/^[0-9]{9,12}$/.test(customerInfo.identityCard.replace(/\D/g, ""))
        ) {
          currentStepErrors.identityCard = "CMND/CCCD không hợp lệ";
        }
      }

      if (Object.keys(currentStepErrors).length > 0) {
        setErrors(currentStepErrors);
        setShowError(true);
        return;
      }

      if (currentStep === totalSteps) {
        await handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
        setShowError(false);
        setErrors({});
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error validating form:", error);
      setShowError(true);
      setErrors({
        submit: "Có lỗi xảy ra khi xử lý form. Vui lòng thử lại sau.",
      });
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
      setShowError(false);
      setErrors({});

      // 1. Tạo hóa đơn (Invoice)
      const invoiceResponse = await axios.post(
        `${API_URL}/api/insurance_motorbike_owner/create_invoice`,
        {
          // Remove insurance_quantity and contract_type from here
          // They will be sent in confirm_purchase
        }
      );
      const invoiceId = invoiceResponse.data.invoice_id;

      // 2. Tạo form bảo hiểm xe máy (MotorbikeInsuranceForm)
      const motorbikeFormPayload = {
        engine_capacity:
          vehicleInfo.engineCapacity === "under_50" ? 49.0 : 125.0,
        accident_coverage: parseFloat(accidentCoverage.toFixed(2)),
        insurance_duration: vehicleInfo.insuranceTerm,
        owner_name: vehicleInfo.ownerName,
        registration_address: vehicleInfo.registrationAddress,
        license_plate_status: vehicleInfo.hasPlate,
        license_plate: vehicleInfo.hasPlate
          ? `${licensePlatePart1}-${licensePlatePart2}`
          : "",
        chassis_number: vehicleInfo.chassisNumber,
        engine_number: vehicleInfo.engineNumber,
        insurance_start: dayjs(vehicleInfo.insuranceStartDate).toISOString(),
        insurance_fee: tndsFeeDisplay,
      };

      console.log(
        "Debug: Raw insuranceStartDate from state:",
        vehicleInfo.insuranceStartDate
      );
      console.log(
        "Payload for create_motorbike_insurance_form:",
        motorbikeFormPayload
      );

      const formResponse = await axios.post(
        `${API_URL}/api/insurance_motorbike_owner/create_motorbike_insurance_form`,
        motorbikeFormPayload
      );
      const formId = formResponse.data.form_id;

      // 3. Tạo thông tin khách hàng (CustomerRegistration)
      const customerResponse = await axios.post(
        `${API_URL}/api/insurance_motorbike_owner/create_customer_registration`,
        {
          customer_type:
            customerInfo.type === "individual" ? "Cá nhân" : "Tổ chức",
          identity_number: customerInfo.identityCard || "",
          full_name: customerInfo.fullName,
          address: customerInfo.address,
          email: customerInfo.email,
          phone_number: customerInfo.phone,
          invoice_request: customerInfo.invoice,
          notes: "Khách đăng ký bảo hiểm xe máy",
        }
      );
      const customerId = customerResponse.data.customer_id;

      // Calculate insurance_end based on insuranceStartDate and insuranceTerm
      console.log(
        "Debug: Raw insuranceStartDate from state (for end date calc):",
        vehicleInfo.insuranceStartDate
      );
      const insuranceEndDate = dayjs(vehicleInfo.insuranceStartDate)
        .add(vehicleInfo.insuranceTerm, "year")
        .toISOString();

      // 4. Xác nhận mua hàng (ConfirmPurchase)
      console.log(
        "Debug: Raw insuranceStartDate from state (for confirm purchase):",
        vehicleInfo.insuranceStartDate
      );
      await axios.post(
        `${API_URL}/api/insurance_motorbike_owner/confirm_purchase`,
        {
          invoice_id: invoiceId,
          customer_id: customerId,
          form_id: formId,
          product_id: vehicleInfo.productId,
          insurance_start: dayjs(vehicleInfo.insuranceStartDate).toISOString(),
          insurance_end: insuranceEndDate,
          insurance_amount: tndsFeeDisplay * vehicleCount,
          insurance_quantity: vehicleCount,
          contract_type: insuranceType === "new" ? "Mới" : "Tái tục",
        }
      );

      // Chuyển hướng đến trang giỏ hàng sau khi hoàn tất
      navigate("/gio-hang.html");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setShowError(true);

      // Xử lý lỗi chi tiết
      if (error.response) {
        const { data, status } = error.response;
        switch (status) {
          case 400:
            setErrors({
              submit: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
            });
            break;
          case 401:
            setErrors({
              submit: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            });
            break;
          case 403:
            setErrors({
              submit: "Bạn không có quyền thực hiện thao tác này.",
            });
            break;
          case 404:
            setErrors({
              submit: "Không tìm thấy tài nguyên yêu cầu.",
            });
            break;
          case 500:
            setErrors({
              submit: "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
            });
            break;
          default:
            setErrors({
              submit: data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.",
            });
        }
      } else if (error.request) {
        setErrors({
          submit:
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
        });
      } else {
        setErrors({
          submit: "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin chung
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
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
              </div>
            </div>

            {insuranceType === "renewal" && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Số GCNBH/BKS
                  <span className="text-red-600">*</span>
                </label>
                <div className="w-[28rem]">
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

            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Số lượng xe
                <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <Select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(Number(e))}
                >
                  <option value="">-- Chọn số lượng --</option>
                  <option value="1">1 xe</option>
                  <option value="2">2 xe</option>
                  <option value="3">3 xe</option>
                  <option value="4">4 xe</option>
                  <option value="5">5 xe</option>
                </Select>
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
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => {
              console.log("Current step before:", currentStep);
              handleNextStep();
              console.log("Current step after:", currentStep);
            }}
            className="px-8 py-3 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors font-medium"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    );
  };

  const renderStep2Content = () => {
    return (
      <div style={{ maxWidth: "1000px" }} className="mx-auto">
        <div className="bg-[#F4F6F8] p-6 rounded-lg">
          <h3 className="text-3xl font-semibold text-left mb-6 text-red-600">
            Thông tin xe chi tiết và Thông tin tài khoản
          </h3>
          <div className="space-y-6">
            {/* Dung tích xi lanh xe */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Dung tích xi lanh xe
                <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <select
                  name="engineCapacity"
                  value={vehicleInfo.engineCapacity}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- Chọn dung tích --</option>
                  <option value="under_50">Dưới 50cc</option>
                  <option value="over_50">Từ 50cc trở lên</option>
                </select>
                {showError && errors.engineCapacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.engineCapacity}
                  </p>
                )}
              </div>
            </div>
            {/* Owner Type */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Đối tượng chủ sở hữu
                <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <select
                  name="ownerType"
                  value={vehicleInfo.ownerType}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- Chọn đối tượng --</option>
                  <option value="personal">Cá nhân</option>
                  <option value="organization">Tổ chức</option>
                </select>
                {showError && errors.ownerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownerType}
                  </p>
                )}
              </div>
            </div>

            {/* Owner Name */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Tên chủ xe <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="ownerName"
                  value={vehicleInfo.ownerName}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.ownerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ownerName}
                  </p>
                )}
              </div>
            </div>

            {/* Registration Address */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Địa chỉ đăng ký xe <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="registrationAddress"
                  value={vehicleInfo.registrationAddress}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.registrationAddress && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.registrationAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Has Plate */}
            <div className="flex items-center gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Tình trạng biển số
              </label>
              <div className="flex-1">
                <label className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    name="hasPlate"
                    checked={vehicleInfo.hasPlate === true}
                    onChange={() =>
                      setVehicleInfo((prev) => ({ ...prev, hasPlate: true }))
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Đã có biển số</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasPlate"
                    checked={vehicleInfo.hasPlate === false}
                    onChange={() =>
                      setVehicleInfo((prev) => ({ ...prev, hasPlate: false }))
                    }
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Chưa có biển số</span>
                </label>
              </div>
            </div>

            {/* License Plate */}
            {vehicleInfo.hasPlate && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Biển kiểm soát <span className="text-red-600">*</span>
                </label>
                <div className="w-[28rem] flex gap-2 items-center">
                  <input
                    type="text"
                    value={licensePlatePart1}
                    onChange={(e) => setLicensePlatePart1(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-center"
                    placeholder="29H1"
                  />
                  <span className="text-xl font-bold">-</span>
                  <input
                    type="text"
                    value={licensePlatePart2}
                    onChange={(e) => setLicensePlatePart2(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="12345"
                  />
                </div>
                {showError && errors.licensePlate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.licensePlate}
                  </p>
                )}
              </div>
            )}

            {/* Chassis Number */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Số khung xe <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="chassisNumber"
                  value={vehicleInfo.chassisNumber}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.chassisNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chassisNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Engine Number */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Số máy xe <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="engineNumber"
                  value={vehicleInfo.engineNumber}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.engineNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.engineNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Insurance Start Date */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Ngày bắt đầu bảo hiểm <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="date"
                  name="insuranceStartDate"
                  value={vehicleInfo.insuranceStartDate}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.insuranceStartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.insuranceStartDate}
                  </p>
                )}
              </div>
            </div>

            {/* Insurance Term */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Thời hạn bảo hiểm
                <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <select
                  name="insuranceTerm"
                  value={vehicleInfo.insuranceTerm}
                  onChange={handleVehicleInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="1">1 năm</option>
                  <option value="2">2 năm</option>
                  <option value="3">3 năm</option>
                </select>
                {showError && errors.insuranceTerm && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.insuranceTerm}
                  </p>
                )}
              </div>
            </div>

            {/* Hạn mức tai nạn người ngồi trên xe */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Hạn mức tai nạn người ngồi trên xe
                <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <select
                  name="accidentCoverage"
                  value={accidentCoverage}
                  onChange={(e) => setAccidentCoverage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="0">-- Chọn loại hạn mức --</option>
                  <option value="0">Không</option>
                  <option value="5000000">5.000.000 VNĐ/người/vụ</option>
                  <option value="10000000">10.000.000 VNĐ/người/vụ</option>
                </select>
                {showError && errors.accidentCoverage && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.accidentCoverage}
                  </p>
                )}
              </div>
            </div>

            <h3 className="text-3xl font-semibold text-left mb-6 text-red-600 mt-12">
              Thông tin tài khoản
            </h3>
            {/* Customer Type */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Đối tượng người mua <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <select
                  name="type"
                  value={customerInfo.type}
                  onChange={handleCustomerInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="individual">Cá nhân</option>
                  <option value="organization">Tổ chức</option>
                </select>
                {showError && errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>
            </div>

            {/* CMND/CCCD */}
            {customerInfo.type === "individual" && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  CMND/CCCD <span className="text-red-600">*</span>
                </label>
                <div className="w-[28rem]">
                  <input
                    type="text"
                    name="identityCard"
                    value={customerInfo.identityCard}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {showError && errors.identityCard && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.identityCard}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mã số thuế */}
            {customerInfo.type === "organization" && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Mã số thuế
                </label>
                <div className="w-[28rem]">
                  <input
                    type="text"
                    name="taxCode"
                    value={customerInfo.taxCode}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {showError && errors.taxCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.taxCode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Họ và tên */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="fullName"
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
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Địa chỉ <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="text"
                  name="address"
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
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Email nhận thông báo <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      email: e.target.value,
                    })
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
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Số điện thoại di động <span className="text-red-600">*</span>
              </label>
              <div className="w-[28rem]">
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {showError && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Invoice Request */}
            <div className="flex items-center gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Yêu cầu xuất hóa đơn VAT
              </label>
              <div className="w-[28rem]">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="invoice"
                    checked={customerInfo.invoice}
                    onChange={handleCustomerInfoChange}
                    className="form-checkbox h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Có</span>
                </label>
              </div>
            </div>

            {/* Company Name (if invoice requested) */}
            {customerInfo.invoice && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Tên công ty
                </label>
                <div className="w-[28rem]">
                  <input
                    type="text"
                    name="companyName"
                    value={customerInfo.companyName}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {showError && errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Company Address (if invoice requested) */}
            {customerInfo.invoice && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Địa chỉ công ty
                </label>
                <div className="w-[28rem]">
                  <input
                    type="text"
                    name="companyAddress"
                    value={customerInfo.companyAddress}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {showError && errors.companyAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyAddress}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Receive Method */}
            <div className="flex items-center gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Hình thức nhận GCNBH
              </label>
              <div className="w-[28rem]">
                <label className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    name="receiveMethod"
                    value="email"
                    checked={customerInfo.receiveMethod === "email"}
                    onChange={handleCustomerInfoChange}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Qua email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="receiveMethod"
                    value="address"
                    checked={customerInfo.receiveMethod === "address"}
                    onChange={handleCustomerInfoChange}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2">Qua địa chỉ</span>
                </label>
              </div>
            </div>

            {/* Receive Address (if by address) */}
            {customerInfo.receiveMethod === "address" && (
              <div className="flex items-start gap-8">
                <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                  Địa chỉ nhận GCNBH <span className="text-red-600">*</span>
                </label>
                <div className="w-[28rem]">
                  <input
                    type="text"
                    name="receiveAddress"
                    value={customerInfo.receiveAddress}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {showError && errors.receiveAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.receiveAddress}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="flex items-start gap-8">
              <label className="w-[300px] text-lg font-medium text-gray-700 flex justify-start">
                Ghi chú (nếu có)
              </label>
              <div className="w-[28rem]">
                <textarea
                  name="note"
                  value={customerInfo.note}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      note: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  rows={3}
                ></textarea>
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
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-md text-white transition-colors font-medium ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
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
          src="/products/banner1.png"
          alt="Banner bảo hiểm xe máy"
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
                Thông tin xe
              </span>
            </div>

            <div className="w-32 h-[2px] bg-gray-300 mx-4"></div>

            {/* Icon Thông tin tài khoản */}
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
                Thông tin tài khoản
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
          {currentStep === 1 ? renderStep1Content() : renderStep2Content()}
        </div>
      </div>
      <CustomerSupport />
      <Footer />
    </div>
  );
}
