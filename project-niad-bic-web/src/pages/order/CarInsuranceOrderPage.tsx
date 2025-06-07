import React, { useState } from 'react';
import { Steps, Button } from 'antd';
import { CarCivilLiabilityForm } from './components/CarCivilLiabilityForm';
import { MandatoryCivilLiabilityForm } from './components/MandatoryCivilLiabilityForm';
import CustomerSupport from '@/components/CustomerSupport';

const { Step } = Steps;

interface VehicleInfo {
  ownerType: "personal" | "organization";
  identityCard: string;
  purpose: string;
  vehicleType: string;
  seats: number;
  loadCapacity: number;
  ownerName: string;
  registrationAddress: string;
  licensePlateStatus: "Mới" | "Cũ" | "Chưa có";
  licensePlate: string;
  chassisNumber: string;
  engineNumber: string;
  insuranceStartDate: string;
  insuranceTerm: number;
  insuranceAmount: number;
  accidentCoverage: number;
}

export default function CarInsuranceOrderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    ownerType: "personal",
    identityCard: "",
    purpose: "",
    vehicleType: "",
    seats: 0,
    loadCapacity: 0,
    ownerName: "",
    registrationAddress: "",
    licensePlateStatus: "Mới",
    licensePlate: "",
    chassisNumber: "",
    engineNumber: "",
    insuranceStartDate: "",
    insuranceTerm: 1,
    insuranceAmount: 0,
    accidentCoverage: 0
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showError, setShowError] = useState(false);

  const handleCivilLiabilitySubmit = (values: any) => {
    setVehicleInfo((prev) => ({
      ...prev,
      ...values,
    }));
    setCurrentStep(1);
  };

  const handleMandatorySubmit = (values: any) => {
    setVehicleInfo((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: <CarCivilLiabilityForm onSubmit={handleCivilLiabilitySubmit} />,
    },
    {
      title: 'Xác nhận',
      content: <MandatoryCivilLiabilityForm onSubmit={handleMandatorySubmit} />,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Steps current={currentStep} className="mb-8">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div>{steps[currentStep].content}</div>

      <div className="mt-8 flex justify-between">
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            Quay lại
          </Button>
        )}
      </div>

      <CustomerSupport />
    </div>
  );
}
