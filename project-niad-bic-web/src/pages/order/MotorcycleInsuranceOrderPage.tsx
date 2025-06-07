import React, { useState } from 'react';
import { Steps, Button } from 'antd';
import { MotorcycleCivilLiabilityForm } from './components/MotorcycleCivilLiabilityForm';
import CustomerSupport from '@/components/CustomerSupport';

const { Step } = Steps;

interface VehicleInfo {
  ownerType: "personal" | "organization";
  identityCard: string;
  vehicleType: string;
  engineCapacity: number;
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

export default function MotorcycleInsuranceOrderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [product] = useState({
    id: "TNDS-XM",
    name: "Bảo hiểm trách nhiệm dân sự xe máy",
    price: "55.000đ",
    image: "/products/banner1.png",
    category: "bao-hiem-xe-may-11",
  });

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    ownerType: "personal",
    identityCard: "",
    vehicleType: "",
    engineCapacity: 0,
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

  const handleCivilLiabilitySubmit = (values: any) => {
    setVehicleInfo((prev) => ({
      ...prev,
      ...values,
    }));
    setCurrentStep(1);
  };
  const steps = [
    {
      title: 'Thông tin xe máy',
      content: <MotorcycleCivilLiabilityForm onSubmit={handleCivilLiabilitySubmit} />,
    },
    {
      title: 'Xác nhận',
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Thông tin đơn bảo hiểm</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Chủ xe: {vehicleInfo.ownerName}</p>
              <p>CMND/CCCD: {vehicleInfo.identityCard}</p>
              <p>Địa chỉ: {vehicleInfo.registrationAddress}</p>
            </div>
            <div>
              <p className="font-medium">Thông tin xe máy:</p>
              <p>Loại xe: {vehicleInfo.vehicleType}</p>
              <p>Biển số: {vehicleInfo.licensePlate}</p>
              <p>Số máy: {vehicleInfo.engineNumber}</p>
              <p>Số khung: {vehicleInfo.chassisNumber}</p>
            </div>
            <div>
              <p className="font-medium">Thông tin bảo hiểm:</p>
              <p>Ngày bắt đầu: {vehicleInfo.insuranceStartDate}</p>
              <p>Thời hạn: {vehicleInfo.insuranceTerm} năm</p>
              <p>Phí bảo hiểm: {vehicleInfo.insuranceAmount?.toLocaleString('vi-VN')} VNĐ</p>
            </div>
          </div>
        </div>
      ),
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner sản phẩm */}
      <div className="w-full pt-[81px]">
        <img
          src="/products/banner1.png"
          alt="Bảo hiểm TNDS xe máy"
          className="w-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 0
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`ml-2 ${
                currentStep >= 0 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Thông tin xe
            </div>
          </div>

          <div className="w-20 h-[2px] bg-gray-300" />

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`ml-2 ${
                currentStep >= 1 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Xác nhận
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {steps[currentStep].content}
        </div>
      </div>

      <CustomerSupport />
    </div>
  );
}
