import React, { useState } from "react";
import { Steps } from "antd";
import { MotorcycleCivilLiabilityForm } from "../order/components/MotorcycleCivilLiabilityForm";
import { useNavigate } from "react-router-dom";
import "./motor-insurance-order.css";

// Define a placeholder for the new component for step 2
const MotorcycleCustomerPaymentForm = React.lazy(
  () => import("./components/MotorcycleCustomerPaymentForm")
);

const { Step } = Steps;

const MotorInsuranceOrder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<any>({});
  const navigate = useNavigate();

  const handleSubmitOrder = async (finalData: any) => {
    console.log("Final Order Data:", finalData);
    // TODO: Implement API calls for order submission and payment
    // navigate('/payment-success'); // Redirect on success
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
        <React.Suspense fallback={<div>Loading...</div>}>
          <MotorcycleCustomerPaymentForm
            initialData={orderData}
            onSubmit={handleSubmitOrder}
            onPrevious={() => setCurrentStep(0)}
          />
        </React.Suspense>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto motorcycle-order-page">
      <Steps current={currentStep} className="mb-8">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[currentStep].content}</div>
    </div>
  );
};

export default MotorInsuranceOrder;
