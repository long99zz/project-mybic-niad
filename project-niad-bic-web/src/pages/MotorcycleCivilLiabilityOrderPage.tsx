import { ClipboardList, UserCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Radio,
  InputNumber,
  Steps,
  Checkbox,
  Space,
} from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerSupport from "../components/CustomerSupport";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Option } = Select;
const { Step } = Steps;

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
  engineCapacity?: number;
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

export default function MotorcycleCivilLiabilityOrderPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    insuranceObject: "new",
    numberOfVehicles: 1,
  });

  const [vehicleInfo, setVehicleInfo] = useState<MotorcycleVehicleInfo>({
    ownerType: "",
    purpose: "",
    vehicleType: "",
    engineCapacity: undefined,
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
    const vehicleType = vehicleInfo.vehicleType;
    const engineCapacity = vehicleInfo.engineCapacity;

    if (vehicleType === "Mô tô 2 bánh") {
      if (engineCapacity !== undefined && engineCapacity !== null) {
        if (engineCapacity < 50) {
          calculatedTnds = 55000;
        } else {
          calculatedTnds = 60000;
        }
      } else {
        calculatedTnds = 0;
      }
    } else if (vehicleType === "Mô tô 3 bánh") {
      calculatedTnds = 290000;
    } else if (vehicleType === "Xe gắn máy") {
      if (engineCapacity !== undefined && engineCapacity !== null) {
        if (engineCapacity === 0) {
          calculatedTnds = 55000;
        } else {
          calculatedTnds = 290000;
        }
      } else {
        calculatedTnds = 0;
      }
    } else if (vehicleType === "Xe máy điện") {
      calculatedTnds = 55000;
    }

    calculatedTnds = calculatedTnds * vehicleInfo.insuranceTerm;

    calculatedTnds = calculatedTnds * 1.1;

    const calculatedAccident =
      (vehicleInfo.accidentCoverageSum || 0) *
      (vehicleInfo.insuredPersons || 1) *
      0.001;

    const total = calculatedTnds + calculatedAccident;

    setTndsFeeDisplay(calculatedTnds);
    setAccidentFeeDisplay(calculatedAccident);
    setTotalFeeDisplay(total);
  }, [
    vehicleInfo.vehicleType,
    vehicleInfo.engineCapacity,
    vehicleInfo.accidentCoverageSum,
    vehicleInfo.insuredPersons,
    vehicleInfo.insuranceTerm,
  ]);

  const handleGeneralInfoChange = (changedValues: any, allValues: any) => {
    console.log("General Info Changed:", changedValues, allValues);
    setGeneralInfo((prev) => ({ ...prev, ...allValues }));
  };

  const handleVehicleInfoChange = (changedValues: any, allValues: any) => {
    console.log("Vehicle Info Changed:", changedValues, allValues);
    setVehicleInfo((prev) => ({ ...prev, ...allValues }));
  };

  const handleCustomerInfoChange = (changedValues: any, allValues: any) => {
    console.log("Customer Info Changed:", changedValues, allValues);
    setCustomerInfo((prev) => ({ ...prev, ...allValues }));
  };

  const handleNextStep = async () => {
    setShowError(false);
    let currentStepErrors: { [key: string]: string } = {};

    try {
      if (currentStep === 1) {
        await form.validateFields(Object.keys(generalInfo));
      } else if (currentStep === 2) {
        await form.validateFields(Object.keys(vehicleInfo));
      } else if (currentStep === 3) {
        await form.validateFields(Object.keys(customerInfo));
      }

      setErrors({});
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === totalSteps) {
        const orderDataToSend = {
          generalInfo,
          vehicleInfo,
          customerInfo,
          totalFeeDisplay,
        };
        console.log("Final Order Data to Send:", orderDataToSend);
        submitOrder(orderDataToSend);
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
    console.log("Submitting order data:", orderData);

    try {
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
            engine_capacity: orderData.vehicleInfo.engineCapacity || 0,
            accident_coverage: orderData.vehicleInfo.accidentCoverageSum || 0,
            insurance_duration: orderData.vehicleInfo.insuranceTerm * 12,
            owner_name: orderData.vehicleInfo.ownerName,
            registration_address: orderData.vehicleInfo.registrationAddress,
            license_plate_status: orderData.vehicleInfo.hasPlate,
            license_plate: orderData.vehicleInfo.licensePlate || "",
            chassis_number: orderData.vehicleInfo.chassisNumber,
            engine_number: orderData.vehicleInfo.engineNumber,
            insurance_start: dayjs(
              orderData.vehicleInfo.insuranceStartDate
            ).format("YYYY-MM-DD"),
            insurance_fee: orderData.totalFeeDisplay,
          }),
        }
      );
      const formData = await formResponse.json();
      const formId = formData.form_id;
      console.log("Motorbike Insurance Form created with ID:", formId);

      const customerResponse = await fetch(
        `${API_URL}/api/insurance_motorbike_owner/create_customer_registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_type:
              orderData.customerInfo.type === "individual"
                ? "Cá nhân"
                : "Tổ chức",
            identity_number: orderData.customerInfo.identityCard || "",
            full_name: orderData.customerInfo.fullName,
            address: orderData.customerInfo.address,
            email: orderData.customerInfo.email,
            phone_number: orderData.customerInfo.phone,
            invoice_request: orderData.customerInfo.invoice,
            notes: "Motorbike Civil Liability Insurance Order",
          }),
        }
      );
      const customerData = await customerResponse.json();
      const customerId = customerData.customer_id;
      console.log("Customer Registration created with ID:", customerId);

      const confirmResponse = await fetch(
        `${API_URL}/api/insurance_motorbike_owner/confirm_purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: invoiceId,
            customer_id: customerId,
            form_id: formId,
          }),
        }
      );
      const confirmData = await confirmResponse.json();
      console.log("Purchase confirmed:", confirmData);

      navigate("/payment-success");
    } catch (error) {
      console.error("Error in order submission:", error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card title="Thông tin chung" className="w-full max-w-2xl mx-auto">
            <Form
              form={form}
              layout="vertical"
              initialValues={generalInfo}
              onValuesChange={handleGeneralInfoChange}
            >
              <Form.Item
                name="insuranceObject"
                label="Đối tượng được bảo hiểm"
                rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}
              >
                <Radio.Group>
                  <Radio value="new">Hợp đồng mới</Radio>
                  <Radio value="renewal">Hợp đồng tái tục</Radio>
                </Radio.Group>
              </Form.Item>

              {generalInfo.insuranceObject === "renewal" && (
                <Form.Item
                  name="gcnBksNumber"
                  label="Số GCNBH/BKS"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số GCNBH/BKS",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số GCNBH/BKS" />
                </Form.Item>
              )}

              <Form.Item
                name="numberOfVehicles"
                label="Số xe mua bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn số lượng xe" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số lượng xe phải lớn hơn 0",
                  },
                ]}
                getValueFromEvent={(e) => e}
              >
                <InputNumber
                  min={1}
                  placeholder="Nhập số lượng xe"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>
          </Card>
        );
      case 2:
        return (
          <Card
            title="Thông tin chi tiết xe & bảo hiểm"
            className="w-full max-w-2xl mx-auto"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={vehicleInfo}
              onValuesChange={handleVehicleInfoChange}
            >
              <Form.Item
                name="ownerType"
                label="Loại chủ xe"
                rules={[
                  { required: true, message: "Vui lòng chọn loại chủ xe" },
                ]}
              >
                <Radio.Group>
                  <Radio value="individual">Cá nhân</Radio>
                  <Radio value="organization">Tổ chức</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="identityCard"
                label={
                  vehicleInfo.ownerType === "organization"
                    ? "Mã số thuế"
                    : "Số CMND/CCCD"
                }
                rules={[
                  {
                    required: true,
                    message: `Vui lòng nhập ${
                      vehicleInfo.ownerType === "organization"
                        ? "Mã số thuế"
                        : "Số CMND/CCCD"
                    }`,
                  },
                ]}
              >
                <Input
                  placeholder={`Nhập ${
                    vehicleInfo.ownerType === "organization"
                      ? "Mã số thuế"
                      : "Số CMND/CCCD"
                  }`}
                />
              </Form.Item>

              <Form.Item
                name="purpose"
                label="Mục đích sử dụng"
                rules={[
                  { required: true, message: "Vui lòng chọn mục đích sử dụng" },
                ]}
              >
                <Select placeholder="Chọn mục đích sử dụng">
                  <Option value="personal">Cá nhân</Option>
                  <Option value="business">Kinh doanh vận tải</Option>
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="vehicleType"
                    label="Loại xe"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại xe" },
                    ]}
                  >
                    <Select placeholder="Chọn loại xe">
                      <Option value="Mô tô 2 bánh">Mô tô 2 bánh</Option>
                      <Option value="Mô tô 3 bánh">Mô tô 3 bánh</Option>
                      <Option value="Xe gắn máy">
                        Xe gắn máy (bao gồm xe máy điện)
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {(vehicleInfo.vehicleType === "Mô tô 2 bánh" ||
                    vehicleInfo.vehicleType === "Xe gắn máy") && (
                    <Form.Item
                      name="engineCapacity"
                      label="Dung tích xi lanh (cc)"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập dung tích xi lanh",
                        },
                        {
                          type: "number",
                          min: 0,
                          message: "Dung tích xi lanh phải là số dương",
                        },
                      ]}
                      getValueFromEvent={(e) => e}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Nhập dung tích xi lanh"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="ownerName"
                    label="Tên chủ xe"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên chủ xe" },
                    ]}
                  >
                    <Input placeholder="Nhập tên chủ xe" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="registrationAddress"
                    label="Địa chỉ đăng ký"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ đăng ký",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập địa chỉ đăng ký" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="hasPlate"
                    label="Trạng thái biển số"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn trạng thái biển số",
                      },
                    ]}
                    valuePropName="checked"
                  >
                    <Radio.Group>
                      <Radio value={true}>Mới</Radio>
                      <Radio value={false}>Chưa có</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {vehicleInfo.hasPlate && (
                    <Form.Item
                      name="licensePlate"
                      label="Biển số xe"
                      rules={[
                        { required: true, message: "Vui lòng nhập biển số xe" },
                      ]}
                    >
                      <Input placeholder="Nhập biển số xe" />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="chassisNumber"
                    label="Số khung"
                    rules={[
                      { required: true, message: "Vui lòng nhập số khung" },
                    ]}
                  >
                    <Input placeholder="Nhập số khung" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="engineNumber"
                    label="Số máy"
                    rules={[
                      { required: true, message: "Vui lòng nhập số máy" },
                    ]}
                  >
                    <Input placeholder="Nhập số máy" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="insuranceStartDate"
                    label="Ngày bắt đầu bảo hiểm"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày bắt đầu bảo hiểm",
                      },
                    ]}
                  >
                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="insuranceTerm"
                    label="Thời hạn bảo hiểm (năm)"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn thời hạn bảo hiểm",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Thời hạn phải ít nhất 1 năm",
                      },
                    ]}
                    getValueFromEvent={(e) => e}
                  >
                    <InputNumber
                      min={1}
                      placeholder="Nhập thời hạn"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Phí bảo hiểm TNDS bắt buộc (gồm VAT)">
                <Input
                  value={tndsFeeDisplay.toLocaleString("vi-VN") + " VNĐ"}
                  readOnly
                />
              </Form.Item>

              <h3 className="text-lg font-semibold mb-4 mt-8">
                Bảo hiểm tai nạn lái phụ xe & người ngồi trên xe
              </h3>

              <Form.Item
                name="accidentCoverageSum"
                label="Số tiền bảo hiểm tai nạn"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn số tiền bảo hiểm tai nạn",
                  },
                ]}
                getValueFromEvent={(e) => e}
              >
                <Select placeholder="Chọn số tiền bảo hiểm">
                  {accidentCoverageOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="insuredPersons"
                label="Số người được bảo hiểm (bao gồm lái xe)"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số người được bảo hiểm",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Số người phải lớn hơn 0",
                  },
                ]}
                getValueFromEvent={(e) => e}
              >
                <InputNumber
                  min={1}
                  placeholder="Nhập số người"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label="Phí bảo hiểm tai nạn (miễn VAT)">
                <Input
                  value={accidentFeeDisplay.toLocaleString("vi-VN") + " VNĐ"}
                  readOnly
                />
              </Form.Item>
            </Form>
          </Card>
        );
      case 3:
        return (
          <Card
            title="Thông tin khách hàng"
            className="w-full max-w-2xl mx-auto"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={customerInfo}
              onValuesChange={handleCustomerInfoChange}
            >
              <Form.Item name="copyFromVehicleOwner" valuePropName="checked">
                <Checkbox
                  onChange={(e) => {
                    if (e.target.checked) {
                      const copiedData = {
                        fullName: vehicleInfo.ownerName,
                        address: vehicleInfo.registrationAddress,
                        identityCard:
                          vehicleInfo.ownerType === customerInfo.type
                            ? vehicleInfo.identityCard
                            : undefined,
                      };
                      form.setFieldsValue(copiedData);
                      setCustomerInfo((prev) => ({
                        ...prev,
                        ...copiedData,
                      }));
                    } else {
                    }
                  }}
                >
                  Sao chép từ thông tin chủ xe
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="type"
                label="Loại đối tượng bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn loại đối tượng" },
                ]}
              >
                <Select placeholder="Chọn loại đối tượng">
                  <Option value="individual">Cá nhân</Option>
                  <Option value="organization">Tổ chức</Option>
                </Select>
              </Form.Item>

              {customerInfo.type && (
                <Form.Item
                  name="identityCard"
                  label={
                    customerInfo.type === "organization"
                      ? "Mã số thuế"
                      : "Số CMND/CCCD"
                  }
                  rules={[
                    {
                      required: true,
                      message: `Vui lòng nhập ${
                        customerInfo.type === "organization"
                          ? "Mã số thuế"
                          : "Số CMND/CCCD"
                      }`,
                    },
                  ]}
                >
                  <Input
                    placeholder={`Nhập ${
                      customerInfo.type === "organization"
                        ? "Mã số thuế"
                        : "Số CMND/CCCD"
                    }`}
                  />
                </Form.Item>
              )}

              {customerInfo.type === "individual" && (
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh" },
                  ]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              )}

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
              </Form.Item>

              <Form.Item name="invoice" valuePropName="checked">
                <Checkbox>Yêu cầu xuất hóa đơn</Checkbox>
              </Form.Item>

              {customerInfo.invoice && (
                <>
                  <h4 className="text-md font-semibold mb-4">
                    Thông tin xuất hóa đơn
                  </h4>
                  <Form.Item
                    name="companyName"
                    label="Tên công ty"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên công ty" },
                    ]}
                  >
                    <Input placeholder="Nhập tên công ty" />
                  </Form.Item>
                  <Form.Item
                    name="taxCode"
                    label="Mã số thuế"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã số thuế" },
                    ]}
                  >
                    <Input placeholder="Nhập mã số thuế" />
                  </Form.Item>
                  <Form.Item
                    name="companyAddress"
                    label="Địa chỉ công ty"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ công ty",
                      },
                    ]}
                  >
                    <Input.TextArea
                      placeholder="Nhập địa chỉ công ty"
                      rows={3}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="receiveMethod"
                label="Hình thức nhận giấy chứng nhận"
                rules={[
                  { required: true, message: "Vui lòng chọn hình thức nhận" },
                ]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="email">Nhận qua Email</Radio>
                    <Radio value="hardcopy">Nhận bản cứng</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {customerInfo.receiveMethod === "hardcopy" && (
                <Form.Item
                  name="receiveAddress"
                  label="Địa chỉ nhận bản cứng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ nhận bản cứng",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nhập địa chỉ nhận bản cứng"
                    rows={3}
                  />
                </Form.Item>
              )}
            </Form>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />

      <h1 className="text-2xl font-bold mb-4 text-center">
        Đặt mua bảo hiểm Trách nhiệm dân sự bắt buộc xe máy
      </h1>

      <Steps current={currentStep - 1} className="mb-8">
        <Steps.Step title="Thông tin chung" icon={<ClipboardList />} />
        <Steps.Step
          title="Thông tin chi tiết xe & bảo hiểm"
          icon={<UserCircle2 />}
        />
        <Steps.Step title="Thông tin khách hàng" icon={<UserCircle2 />} />
      </Steps>

      {renderStepContent()}

      {(currentStep === 2 || currentStep === 3) && (
        <Card
          title="Tổng phí bảo hiểm"
          className="w-full max-w-2xl mx-auto mt-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">
              Phí bảo hiểm TNDS (gồm VAT):
            </span>
            <span className="text-lg font-semibold text-red-600">
              {tndsFeeDisplay.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">
              Phí bảo hiểm tai nạn (miễn VAT):
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
        </Card>
      )}

      <div className="flex justify-between mt-8 w-full max-w-2xl mx-auto">
        {currentStep > 1 && (
          <Button type="default" onClick={handlePrevStep} size="large">
            Quay lại
          </Button>
        )}
        {currentStep < totalSteps ? (
          <Button type="primary" onClick={handleNextStep} size="large">
            Tiếp tục
          </Button>
        ) : (
          <Button type="primary" onClick={handleNextStep} size="large">
            Xác nhận & Thanh toán
          </Button>
        )}
      </div>

      {showError && (
        <div className="text-red-600 mt-4 text-center">
          Vui lòng điền đầy đủ thông tin bắt buộc.
        </div>
      )}

      <Footer />
      <CustomerSupport />
    </div>
  );
}
