import React, { useState } from "react";
import { Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { MotorcycleCivilLiabilityForm } from "../order/components/MotorcycleCivilLiabilityForm";
import MotorcycleCustomerPaymentForm from "./components/MotorcycleCustomerPaymentForm";
import {
  createMotorbikeInsuranceForm,
  createCustomerRegistration,
  processPayment,
} from "../../services/motorInsurance";

const { Step } = Steps;

const MotorcycleCivilLiabilityOrderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<any>({});
  const navigate = useNavigate();

  const handleSubmitOrder = async (finalData: any) => {
    try {
      // 1. Tạo hóa đơn
      const invoiceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/insurance_motorbike_owner/create_invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            insurance_quantity: 1,
            contract_type: "Mới",
          }),
        }
      );
      const invoiceData = await invoiceResponse.json();
      const invoiceId = invoiceData.invoice_id;

      // 2. Tạo form bảo hiểm
      const formResponse = await createMotorbikeInsuranceForm({
        engine_capacity: finalData.engineCapacity || 0,
        accident_coverage: finalData.accidentCoverage || 0,
        insurance_duration: finalData.insuranceTerm * 12,
        owner_name: finalData.ownerName,
        registration_address: finalData.registrationAddress,
        license_plate_status: finalData.hasPlate,
        license_plate: finalData.licensePlate || "",
        chassis_number: finalData.chassisNumber,
        engine_number: finalData.engineNumber,
        insurance_start: finalData.insuranceStartDate,
        insurance_fee: finalData.totalFee,
      });
      const formId = formResponse.form_id;

      // 3. Tạo thông tin khách hàng
      const customerResponse = await createCustomerRegistration({
        customer_type:
          finalData.customerType === "individual" ? "Cá nhân" : "Tổ chức",
        identity_number: finalData.identityCard || "",
        full_name: finalData.fullName,
        address: finalData.address,
        email: finalData.email,
        phone_number: finalData.phone,
        invoice_request: finalData.invoice,
        notes: "Motorbike Civil Liability Insurance Order",
      });
      const customerId = customerResponse.customer_id;

      // 4. Xác nhận mua hàng
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/insurance_motorbike_owner/confirm_purchase`,
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

      navigate("/payment-success");
    } catch (error) {
      console.error("Error in order submission:", error);
    }
  };

  const steps = [
    {
      title: "Thông tin xe & Hợp đồng",
      content: (
        <MotorcycleCivilLiabilityForm
          onSubmit={(values) => {
            setOrderData({ ...orderData, ...values });
            setCurrentStep(1);
          }}
        />
      ),
    },
    {
      title: "Thông tin khách hàng & Thanh toán",
      content: (
        <MotorcycleCustomerPaymentForm
          initialData={orderData}
          onSubmit={handleSubmitOrder}
          onPrevious={() => setCurrentStep(0)}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Đặt bảo hiểm TNDS xe máy
        </h1>

        <Steps current={currentStep} className="mb-8">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {steps[currentStep].content}
        </div>
      </div>
    </div>
  );
};

export default MotorcycleCivilLiabilityOrderPage;
