import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CustomerSupport from "../../components/CustomerSupport";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface GeneralInfo {
  insuranceObject: "new" | "renewal";
  gcnBksNumber?: string;
  numberOfVehicles: number;
}

interface MotorcycleVehicleInfo {
  ownerType: string;
  identityCard?: string;
  purpose: string;
  vehicleType: string;
  engineCapacity?: string;
  ownerName: string;
  registrationAddress: string;
  hasPlate: boolean;
  licensePlate?: string;
  chassisNumber: string;
  engineNumber: string;
  insuranceStartDate: string;
  insuranceTerm: number;
  accidentCoverageSum: number;
  insuredPersons: number;
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
}

// Validation helper functions
const validateGeneralInfo = (info: GeneralInfo) => {
  const errors: { [key: string]: string } = {};

  if (!info.insuranceObject) {
    errors.insuranceObject = "Vui lòng chọn đối tượng bảo hiểm";
  }

  if (info.insuranceObject === "renewal" && !info.gcnBksNumber?.trim()) {
    errors.gcnBksNumber = "Vui lòng nhập số GCNBH/BKS";
  }

  if (!info.numberOfVehicles || info.numberOfVehicles < 1) {
    errors.numberOfVehicles = "Vui lòng chọn số lượng xe và phải lớn hơn 0";
  } else if (info.numberOfVehicles > 10) {
    errors.numberOfVehicles = "Số lượng xe không được vượt quá 10";
  }

  return errors;
};

const validateVehicleInfo = (info: MotorcycleVehicleInfo) => {
  const errors: { [key: string]: string } = {};

  if (!info.engineCapacity) {
    errors.engineCapacity = "Vui lòng chọn dung tích xi lanh";
  }

  if (!info.accidentCoverageSum) {
    errors.accidentCoverageSum = "Vui lòng chọn hạn mức tai nạn";
  } else if (info.accidentCoverageSum < 0) {
    errors.accidentCoverageSum = "Hạn mức tai nạn không thể âm";
  }

  if (!info.ownerName?.trim()) {
    errors.ownerName = "Vui lòng nhập tên chủ xe";
  }

  if (!info.registrationAddress?.trim()) {
    errors.registrationAddress = "Vui lòng nhập địa chỉ đăng ký xe";
  }

  if (info.hasPlate && !info.licensePlate?.trim()) {
    errors.licensePlate = "Vui lòng nhập biển kiểm soát";
  } else if (
    info.hasPlate &&
    !/^[0-9A-Z-]+$/i.test(info.licensePlate?.trim() || "")
  ) {
    errors.licensePlate = "Biển kiểm soát không hợp lệ";
  }

  if (!info.chassisNumber?.trim()) {
    errors.chassisNumber = "Vui lòng nhập số khung";
  } else if (!/^[A-Z0-9-]+$/i.test(info.chassisNumber.trim())) {
    errors.chassisNumber =
      "Số khung chỉ được chứa chữ cái, số và dấu gạch ngang";
  }

  if (!info.engineNumber?.trim()) {
    errors.engineNumber = "Vui lòng nhập số máy";
  } else if (!/^[A-Z0-9-]+$/i.test(info.engineNumber.trim())) {
    errors.engineNumber = "Số máy chỉ được chứa chữ cái, số và dấu gạch ngang";
  }

  const today = dayjs().startOf("day");
  const startDate = dayjs(info.insuranceStartDate);
  const maxDate = dayjs().add(30, "days").startOf("day");

  if (!info.insuranceStartDate) {
    errors.insuranceStartDate = "Vui lòng chọn ngày bắt đầu bảo hiểm";
  } else if (startDate.isBefore(today)) {
    errors.insuranceStartDate = "Ngày bắt đầu bảo hiểm không thể trong quá khứ";
  } else if (startDate.isAfter(maxDate)) {
    errors.insuranceStartDate =
      "Ngày bắt đầu bảo hiểm không thể quá 30 ngày kể từ hôm nay";
  }

  return errors;
};

const validateCustomerInfo = (info: CustomerInfo) => {
  const errors: { [key: string]: string } = {};

  if (!info.type) {
    errors.type = "Vui lòng chọn loại người mua";
  }

  if (info.type === "individual" && !info.identityCard?.trim()) {
    errors.identityCard = "Vui lòng nhập CMND/CCCD";
  } else if (
    info.type === "individual" &&
    !/^\d{9,12}$/.test(info.identityCard?.trim() || "")
  ) {
    errors.identityCard = "CMND/CCCD phải có từ 9 đến 12 chữ số";
  } else if (
    info.type === "individual" &&
    !/^\d{9,12}$/.test(info.identityCard?.trim() || "")
  ) {
    errors.identityCard = "CMND/CCCD phải có từ 9 đến 12 chữ số";
  }

  if (info.type === "organization" && !info.taxCode?.trim()) {
    errors.taxCode = "Vui lòng nhập mã số thuế";
  } else if (
    info.type === "organization" &&
    !/^\d{10}(-\d{3})?$/.test(info.taxCode?.trim() || "")
  ) {
    errors.taxCode = "Mã số thuế không hợp lệ (phải có 10 số hoặc 10 số-3 số)";
  } else if (
    info.type === "organization" &&
    !/^\d{10}(-\d{3})?$/.test(info.taxCode?.trim() || "")
  ) {
    errors.taxCode = "Mã số thuế không hợp lệ (phải có 10 số hoặc 10 số-3 số)";
  }

  if (!info.fullName?.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên";
  } else if (info.fullName.trim().length < 2) {
    errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
  } else if (info.fullName.trim().length < 2) {
    errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
  }

  if (!info.email?.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!info.phone?.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^(0[0-9]{9}|84[0-9]{8})$/.test(info.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc 84)";
  }

  if (!info.address?.trim()) {
    errors.address = "Vui lòng nhập địa chỉ";
  } else if (info.address.trim().length < 10) {
    errors.address = "Địa chỉ phải có ít nhất 10 ký tự";
  }

  if (info.receiveMethod === "post" && !info.receiveAddress?.trim()) {
    errors.receiveAddress = "Vui lòng nhập địa chỉ nhận";
  } else if (
    info.receiveMethod === "post" &&
    info.receiveAddress &&
    info.receiveAddress.trim().length < 10
  ) {
    errors.receiveAddress = "Địa chỉ nhận phải có ít nhất 10 ký tự";
  }

  return errors;
};

export default function MotorcycleInsuranceOrderPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    insuranceObject: "new",
    numberOfVehicles: 1,
  });

  const [vehicleInfo, setVehicleInfo] = useState<MotorcycleVehicleInfo>({
    ownerType: "",
    purpose: "",
    vehicleType: "",
    engineCapacity: "",
    ownerName: "",
    registrationAddress: "",
    hasPlate: true,
    chassisNumber: "",
    engineNumber: "",
    insuranceStartDate: dayjs().format("YYYY-MM-DD"),
    insuranceTerm: 1,
    accidentCoverageSum: 100000000,
    insuredPersons: 1,
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    type: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    invoice: false,
    receiveMethod: "email",
  });

  const [tndsFeeDisplay, setTndsFeeDisplay] = useState(0);
  const [accidentFeeDisplay, setAccidentFeeDisplay] = useState(0);
  const [totalFeeDisplay, setTotalFeeDisplay] = useState(0);

  const accidentCoverageOptions = [
    { value: 10000000, label: "10 triệu đồng/người/vụ" },
    { value: 20000000, label: "20 triệu đồng/người/vụ" },
    { value: 30000000, label: "30 triệu đồng/người/vụ" },
    { value: 50000000, label: "50 triệu đồng/người/vụ" },
    { value: 100000000, label: "100 triệu đồng/người/vụ" },
  ];

  useEffect(() => {
    let calculatedTnds = 0;
    const engineCapacitySelection = vehicleInfo.engineCapacity;

    if (engineCapacitySelection === "under_50") {
      calculatedTnds = 55000;
    } else if (engineCapacitySelection === "over_50") {
      calculatedTnds = 60000;
    }

    calculatedTnds = calculatedTnds * vehicleInfo.insuranceTerm;
    calculatedTnds = calculatedTnds * 1.1; // Add 10% VAT

    const calculatedAccident =
      (vehicleInfo.accidentCoverageSum || 0) *
      (vehicleInfo.insuredPersons || 1) *
      0.001;

    const total = calculatedTnds + calculatedAccident;

    setTndsFeeDisplay(calculatedTnds);
    setAccidentFeeDisplay(calculatedAccident);
    setTotalFeeDisplay(total);
  }, [
    vehicleInfo.engineCapacity,
    vehicleInfo.accidentCoverageSum,
    vehicleInfo.insuredPersons,
    vehicleInfo.insuranceTerm,
  ]);

  const handleGeneralInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setGeneralInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVehicleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    if (name === "hasPlate") {
      setVehicleInfo((prev) => ({ ...prev, [name]: checked }));
    } else {
      setVehicleInfo((prev) => ({ ...prev, [name]: value }));
    }
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
    setShowError(false);
    let currentStepErrors: { [key: string]: string } = {};

    // Reset errors
    setErrors({});

    try {
      if (currentStep === 1) {
        // Step 1 validation - General Info
        currentStepErrors = validateGeneralInfo(generalInfo);
      } else if (currentStep === 2) {
        // Step 2 validation - Vehicle Info
        currentStepErrors = validateVehicleInfo(vehicleInfo);

        // Additional validation for customer info in step 2
        const customerErrors = validateCustomerInfo(customerInfo);
        currentStepErrors = { ...currentStepErrors, ...customerErrors };
      } else if (currentStep === 3) {
        // No specific validation for step 3 yet, as it's a confirmation step.
      }

      if (Object.keys(currentStepErrors).length > 0) {
        setErrors(currentStepErrors);
        setShowError(true);
        // Scroll to first error
        const firstError = document.querySelector(".text-red-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Clear errors if validation passed
      setErrors({});

      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Scroll to top when changing steps
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (currentStep === totalSteps) {
        // Final submission
        const orderDataToSend = {
          generalInfo,
          vehicleInfo,
          customerInfo,
          totalFeeDisplay,
        };
        console.log("Final Order Data to Send:", orderDataToSend);
        await submitOrder(orderDataToSend);
      }
    } catch (validationErrors) {
      console.log("Validation Failed:", validationErrors);
      setShowError(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowError(false);
      setErrors({});
    }
  };

  const submitOrder = async (orderData: any) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setShowError(false);
      setErrors({});

      const invoiceResponse = await fetch(
        `${API_URL}/api/insurance_motorbike_owner/create_invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            insurance_quantity: orderData.generalInfo.numberOfVehicles,
            contract_type:
              orderData.generalInfo.insuranceObject === "new"
                ? "Mới"
                : "Tái tục",
          }),
        }
      );

      if (!invoiceResponse.ok) {
        throw new Error("Failed to create invoice");
      }

      const invoiceData = await invoiceResponse.json();
      const invoiceId = invoiceData.invoice_id;
      console.log("Invoice created with ID:", invoiceId);

      const formResponse = await fetch(
        `${API_URL}/api/insurance_motorbike_owner/create_motorbike_insurance_form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: invoiceId,
            engine_capacity:
              orderData.vehicleInfo.engineCapacity === "under_50" ? 49 : 125, // Map 'under_50' to 49 and 'over_50' to 125 as placeholder. Original had specific values.
            accident_coverage: orderData.vehicleInfo.accidentCoverageSum || 0,
            insurance_duration: orderData.vehicleInfo.insuranceTerm * 12, // convert years to months
            owner_name: orderData.vehicleInfo.ownerName,
            registration_address: orderData.vehicleInfo.registrationAddress,
            license_plate_status: orderData.vehicleInfo.hasPlate
              ? "Đã có biển số"
              : "Chưa có biển số",
            license_plate: orderData.vehicleInfo.licensePlate || "",
            chassis_number: orderData.vehicleInfo.chassisNumber,
            engine_number: orderData.vehicleInfo.engineNumber,
            insurance_start: orderData.vehicleInfo.insuranceStartDate,
            insurance_fee: orderData.totalFeeDisplay,
          }),
        }
      );
      const formData = await formResponse.json();
      console.log("Motorbike insurance form created:", formData);

      const customerResponse = await fetch(
        `${API_URL}/api/insurance_motorbike_owner/create_customer_registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: invoiceId,
            customer_type: orderData.customerInfo.type,
            full_name: orderData.customerInfo.fullName,
            email: orderData.customerInfo.email,
            phone_number: orderData.customerInfo.phone,
            address: orderData.customerInfo.address,
            identity_card: orderData.customerInfo.identityCard || "",
            tax_code: orderData.customerInfo.taxCode || "",
            invoice_required: orderData.customerInfo.invoice,
            receive_method: orderData.customerInfo.receiveMethod,
          }),
        }
      );
      const customerData = await customerResponse.json();
      console.log("Customer registration created:", customerData);

      navigate(
        `/xac-nhan-thanh-toan?invoiceId=${invoiceId}&productType=motorcycle`
      );
    } catch (error) {
      console.error("Error submitting order:", error);
      setErrors({
        submit:
          "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
      });
      setShowError(true);

      // Scroll error into view
      const errorElement = document.querySelector(".text-red-500");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Thông tin chung</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng được bảo hiểm
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="insuranceObject"
                      value="new"
                      checked={generalInfo.insuranceObject === "new"}
                      onChange={handleGeneralInfoChange}
                      className="form-radio h-4 w-4 text-red-600"
                      autoFocus={currentStep === 1}
                    />
                    <span className="ml-2">Hợp đồng mới</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="insuranceObject"
                      value="renewal"
                      checked={generalInfo.insuranceObject === "renewal"}
                      onChange={handleGeneralInfoChange}
                      className="form-radio h-4 w-4 text-red-600"
                    />
                    <span className="ml-2">Hợp đồng tái tục</span>
                  </label>
                </div>
                {showError && errors.insuranceObject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.insuranceObject}
                  </p>
                )}
              </div>

              {generalInfo.insuranceObject === "renewal" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số GCNBH/BKS
                  </label>
                  <input
                    type="text"
                    name="gcnBksNumber"
                    value={generalInfo.gcnBksNumber || ""}
                    onChange={handleGeneralInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Nhập số GCNBH/BKS"
                  />
                  {showError && errors.gcnBksNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gcnBksNumber}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số xe mua bảo hiểm
                </label>
                <input
                  type="number"
                  name="numberOfVehicles"
                  value={generalInfo.numberOfVehicles}
                  onChange={handleGeneralInfoChange}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Nhập số lượng xe"
                />
                {showError && errors.numberOfVehicles && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.numberOfVehicles}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Thông tin xe và Phí bảo hiểm
            </h2>

            <div className="mb-10 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Thông tin xe 1
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label
                    htmlFor="engineCapacity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Dung tích xi lanh <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="engineCapacity"
                    name="engineCapacity"
                    value={vehicleInfo.engineCapacity || ""}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    autoFocus={currentStep === 2}
                  >
                    <option value="">Chọn loại xe</option>
                    <option value="under_50">Dưới 50cc/xe máy điện</option>
                    <option value="over_50">Từ 50cc trở lên</option>
                  </select>
                  {showError && errors.engineCapacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.engineCapacity}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="accidentCoverageSum"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Hạn mức tai nạn người ngồi trên xe{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="accidentCoverageSum"
                    name="accidentCoverageSum"
                    value={vehicleInfo.accidentCoverageSum}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="">Chọn loại hạn mức</option>
                    {accidentCoverageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {showError && errors.accidentCoverageSum && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.accidentCoverageSum}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="insuranceTerm"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Thời hạn bảo hiểm <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="insuranceTerm"
                    name="insuranceTerm"
                    value={vehicleInfo.insuranceTerm}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="">Chọn thời hạn</option>
                    <option value={1}>1 năm</option>
                    <option value={2}>2 năm</option>
                    <option value={3}>3 năm</option>
                  </select>
                  {showError && errors.insuranceTerm && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.insuranceTerm}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="ownerName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tên chủ xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={vehicleInfo.ownerName}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập tên chủ xe"
                  />
                  {showError && errors.ownerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ownerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="registrationAddress"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Địa chỉ đăng ký xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="registrationAddress"
                    name="registrationAddress"
                    value={vehicleInfo.registrationAddress}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập địa chỉ đăng ký"
                  />
                  {showError && errors.registrationAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.registrationAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng biển số <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasPlate"
                        checked={vehicleInfo.hasPlate}
                        onChange={(e) =>
                          setVehicleInfo({
                            ...vehicleInfo,
                            hasPlate: e.target.checked,
                          })
                        }
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">Đã có biển số</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasPlate"
                        checked={!vehicleInfo.hasPlate}
                        onChange={(e) =>
                          setVehicleInfo({
                            ...vehicleInfo,
                            hasPlate: !e.target.checked,
                          })
                        }
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">
                        Chưa có biển số
                      </span>
                    </label>
                  </div>
                  {showError && errors.hasPlate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.hasPlate}
                    </p>
                  )}
                </div>

                {vehicleInfo.hasPlate && (
                  <div>
                    <label
                      htmlFor="licensePlate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Biển kiểm soát <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={vehicleInfo.licensePlate || ""}
                      onChange={handleVehicleInfoChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Nhập biển kiểm soát"
                    />
                    {showError && errors.licensePlate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.licensePlate}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="chassisNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số khung <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="chassisNumber"
                    name="chassisNumber"
                    value={vehicleInfo.chassisNumber}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập số khung"
                  />
                  {showError && errors.chassisNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.chassisNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="engineNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số máy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="engineNumber"
                    name="engineNumber"
                    value={vehicleInfo.engineNumber}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập số máy"
                  />
                  {showError && errors.engineNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.engineNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="insuranceStartDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày bắt đầu bảo hiểm{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="insuranceStartDate"
                    name="insuranceStartDate"
                    value={vehicleInfo.insuranceStartDate}
                    onChange={handleVehicleInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                  {showError && errors.insuranceStartDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.insuranceStartDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-10 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Thông tin người mua bảo hiểm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại người mua <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="individual"
                        checked={customerInfo.type === "individual"}
                        onChange={handleCustomerInfoChange}
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">Cá nhân</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="organization"
                        checked={customerInfo.type === "organization"}
                        onChange={handleCustomerInfoChange}
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">Tổ chức</span>
                    </label>
                  </div>
                  {showError && errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                {customerInfo.type === "individual" && (
                  <div>
                    <label
                      htmlFor="identityCard"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="identityCard"
                      name="identityCard"
                      value={customerInfo.identityCard || ""}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Nhập CMND/CCCD"
                    />
                    {showError && errors.identityCard && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.identityCard}
                      </p>
                    )}
                  </div>
                )}

                {customerInfo.type === "organization" && (
                  <div>
                    <label
                      htmlFor="taxCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mã số thuế <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="taxCode"
                      name="taxCode"
                      value={customerInfo.taxCode || ""}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Nhập mã số thuế"
                    />
                    {showError && errors.taxCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.taxCode}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập họ và tên"
                  />
                  {showError && errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập email"
                  />
                  {showError && errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập số điện thoại"
                  />
                  {showError && errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Nhập địa chỉ"
                  />
                  {showError && errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {customerInfo.type === "individual" && (
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={customerInfo.dateOfBirth || ""}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                )}

                {customerInfo.type === "organization" && (
                  <>
                    <div>
                      <label
                        htmlFor="companyName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Tên công ty
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={customerInfo.companyName || ""}
                        onChange={handleCustomerInfoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        placeholder="Nhập tên công ty"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="companyAddress"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Địa chỉ công ty
                      </label>
                      <input
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        value={customerInfo.companyAddress || ""}
                        onChange={handleCustomerInfoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        placeholder="Nhập địa chỉ công ty"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mb-10 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Phương thức nhận Giấy chứng nhận bảo hiểm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phương thức <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="receiveMethod"
                        value="email"
                        checked={customerInfo.receiveMethod === "email"}
                        onChange={handleCustomerInfoChange}
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">Qua Email</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="receiveMethod"
                        value="post"
                        checked={customerInfo.receiveMethod === "post"}
                        onChange={handleCustomerInfoChange}
                        className="form-radio h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-800">Qua Bưu điện</span>
                    </label>
                  </div>
                </div>
                {customerInfo.receiveMethod === "post" && (
                  <div>
                    <label
                      htmlFor="receiveAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Địa chỉ nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="receiveAddress"
                      name="receiveAddress"
                      value={customerInfo.receiveAddress || ""}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Nhập địa chỉ nhận"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">
                Thanh toán
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-medium text-gray-800">
                  <span>Phí bảo hiểm TNDS:</span>
                  <span className="text-red-600">
                    {tndsFeeDisplay.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-medium text-gray-800">
                  <span>Phí bảo hiểm tai nạn:</span>
                  <span className="text-red-600">
                    {accidentFeeDisplay.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4 mt-4">
                  <span>Tổng phí thanh toán:</span>
                  <span className="text-red-600">
                    {totalFeeDisplay.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Xác nhận thông tin
            </h2>
            <p className="text-gray-700 mb-6">
              Vui lòng kiểm tra lại thông tin trước khi xác nhận đơn hàng.
            </p>
            <div className="space-y-4 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Thông tin chung
              </h3>
              <p>
                <span className="font-medium">Đối tượng bảo hiểm:</span>{" "}
                {generalInfo.insuranceObject === "new"
                  ? "Hợp đồng mới"
                  : "Hợp đồng tái tục"}
              </p>
              {generalInfo.gcnBksNumber && (
                <p>
                  <span className="font-medium">Số GCNBH/BKS:</span>{" "}
                  {generalInfo.gcnBksNumber}
                </p>
              )}
              <p>
                <span className="font-medium">Số lượng xe:</span>{" "}
                {generalInfo.numberOfVehicles}
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Thông tin xe
              </h3>
              <p>
                <span className="font-medium">Dung tích xi lanh:</span>{" "}
                {vehicleInfo.engineCapacity === "under_50"
                  ? "Dưới 50cc/xe máy điện"
                  : "Từ 50cc trở lên"}
              </p>
              <p>
                <span className="font-medium">Hạn mức tai nạn:</span>{" "}
                {vehicleInfo.accidentCoverageSum.toLocaleString("vi-VN")} VNĐ
              </p>
              <p>
                <span className="font-medium">Thời hạn bảo hiểm:</span>{" "}
                {vehicleInfo.insuranceTerm} năm
              </p>
              <p>
                <span className="font-medium">Tên chủ xe:</span>{" "}
                {vehicleInfo.ownerName}
              </p>
              <p>
                <span className="font-medium">Địa chỉ đăng ký xe:</span>{" "}
                {vehicleInfo.registrationAddress}
              </p>
              <p>
                <span className="font-medium">Tình trạng biển số:</span>{" "}
                {vehicleInfo.hasPlate ? "Đã có biển số" : "Chưa có biển số"}
              </p>
              {vehicleInfo.hasPlate && (
                <p>
                  <span className="font-medium">Biển kiểm soát:</span>{" "}
                  {vehicleInfo.licensePlate}
                </p>
              )}
              <p>
                <span className="font-medium">Số khung:</span>{" "}
                {vehicleInfo.chassisNumber}
              </p>
              <p>
                <span className="font-medium">Số máy:</span>{" "}
                {vehicleInfo.engineNumber}
              </p>
              <p>
                <span className="font-medium">Ngày bắt đầu bảo hiểm:</span>{" "}
                {dayjs(vehicleInfo.insuranceStartDate).format("DD/MM/YYYY")}
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Thông tin người mua bảo hiểm
              </h3>
              <p>
                <span className="font-medium">Loại người mua:</span>{" "}
                {customerInfo.type === "individual" ? "Cá nhân" : "Tổ chức"}
              </p>
              {customerInfo.identityCard && (
                <p>
                  <span className="font-medium">CMND/CCCD:</span>{" "}
                  {customerInfo.identityCard}
                </p>
              )}
              {customerInfo.taxCode && (
                <p>
                  <span className="font-medium">Mã số thuế:</span>{" "}
                  {customerInfo.taxCode}
                </p>
              )}
              <p>
                <span className="font-medium">Họ và tên:</span>{" "}
                {customerInfo.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {customerInfo.email}
              </p>
              <p>
                <span className="font-medium">Số điện thoại:</span>{" "}
                {customerInfo.phone}
              </p>
              <p>
                <span className="font-medium">Địa chỉ:</span>{" "}
                {customerInfo.address}
              </p>
              {customerInfo.dateOfBirth && (
                <p>
                  <span className="font-medium">Ngày sinh:</span>{" "}
                  {dayjs(customerInfo.dateOfBirth).format("DD/MM/YYYY")}
                </p>
              )}
              {customerInfo.companyName && (
                <p>
                  <span className="font-medium">Tên công ty:</span>{" "}
                  {customerInfo.companyName}
                </p>
              )}
              {customerInfo.companyAddress && (
                <p>
                  <span className="font-medium">Địa chỉ công ty:</span>{" "}
                  {customerInfo.companyAddress}
                </p>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Phương thức nhận Giấy chứng nhận bảo hiểm
              </h3>
              <p>
                <span className="font-medium">Phương thức:</span>{" "}
                {customerInfo.receiveMethod === "email"
                  ? "Qua Email"
                  : "Qua Bưu điện"}
              </p>
              {customerInfo.receiveAddress && (
                <p>
                  <span className="font-medium">Địa chỉ nhận:</span>{" "}
                  {customerInfo.receiveAddress}
                </p>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Thanh toán
              </h3>
              <p>
                <span className="font-medium">Phí bảo hiểm TNDS:</span>{" "}
                {tndsFeeDisplay.toLocaleString("vi-VN")} VNĐ
              </p>
              <p>
                <span className="font-medium">Phí bảo hiểm tai nạn:</span>{" "}
                {accidentFeeDisplay.toLocaleString("vi-VN")} VNĐ
              </p>
              <p>
                <span className="font-medium">Tổng phí thanh toán:</span>{" "}
                <span className="text-red-600 font-bold">
                  {totalFeeDisplay.toLocaleString("vi-VN")} VNĐ
                </span>
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="pt-[81px] pb-[100px]">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Đặt mua bảo hiểm Trách nhiệm dân sự bắt buộc xe máy
        </h1>

        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-red-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div
              className={`w-24 h-1 ${
                currentStep >= 2 ? "bg-red-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-red-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div
              className={`w-24 h-1 ${
                currentStep >= 3 ? "bg-red-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-red-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {showError && errors.submit && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}

        {renderStepContent()}

        {(currentStep === 2 || currentStep === 3) && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4">Tổng phí bảo hiểm</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  Phí bảo hiểm TNDS (gồm VNĐ):
                </span>
                <span className="text-lg font-semibold text-red-600">
                  {tndsFeeDisplay.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  Phí bảo hiểm tai nạn (miễn VNĐ):
                </span>
                <span className="text-lg font-semibold text-red-600">
                  {accidentFeeDisplay.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 mt-4">
                <span className="text-xl font-bold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-red-600">
                  {totalFeeDisplay.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sticky navigation buttons */}
        {currentStep !== totalSteps && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
            <div className="container mx-auto flex justify-end space-x-4 max-w-2xl">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Quay lại
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {currentStep === totalSteps - 1
                  ? "Xem lại và xác nhận"
                  : "Tiếp tục"}
              </button>
            </div>
          </div>
        )}

        {/* Submit buttons for final step */}
        {currentStep === totalSteps && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
            <div className="container mx-auto flex justify-end space-x-4 max-w-2xl">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  const orderData = {
                    generalInfo,
                    vehicleInfo,
                    customerInfo,
                    totalFeeDisplay,
                  };
                  submitOrder(orderData);
                }}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt mua"}
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerSupport />
      <Footer />
    </div>
  );
}
