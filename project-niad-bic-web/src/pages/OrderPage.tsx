import React, { useEffect, useState } from 'react';
import { calculateTotalInsuranceFee } from '../constants/carInsurance';

interface VehicleInfo {
  purpose: string;
  vehicleType: string;
  insuranceTerm: number;
  accidentCoverage: number;
  seats?: number;
}

interface AccountInfo {
  fullName: string;
  address: string;
  email: string;
  phone: string;
}

export const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quantity' | 'vehicle' | 'account'>('quantity');
  const [vehicleQuantity, setVehicleQuantity] = useState<number>(1);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    purpose: '',
    vehicleType: '',
    insuranceTerm: 12,
    accidentCoverage: 0,
    seats: 1,
    licensePlate: '',
    frameNumber: '',
    engineNumber: ''
  });
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    fullName: '',
    address: '',
    email: '',
    phone: ''
  });

  const [tndsFeeDisplay, setTndsFeeDisplay] = useState<number>(0);
  const [accidentFeeDisplay, setAccidentFeeDisplay] = useState<number>(0);
  const [totalFeeDisplay, setTotalFeeDisplay] = useState<number>(0);

  // Effect để tính toán lại phí khi thông tin xe thay đổi
  useEffect(() => {
    if (vehicleInfo.purpose && vehicleInfo.vehicleType) {
      const calculatedFees = calculateTotalInsuranceFee(
        vehicleInfo.purpose,
        vehicleInfo.vehicleType,
        vehicleInfo.insuranceTerm,
        vehicleInfo.accidentCoverage,
        vehicleInfo.seats || 1 // Thêm số chỗ ngồi vào tham số
      );
      setTndsFeeDisplay(calculatedFees.tndsFee);
      setAccidentFeeDisplay(calculatedFees.passengerAccidentFee);
      setTotalFeeDisplay(calculatedFees.totalFee);
    } else {
      // Reset fees if essential information is missing
      setTndsFeeDisplay(0);
      setAccidentFeeDisplay(0);
      setTotalFeeDisplay(0);
    }
  }, [vehicleInfo]); // Re-run effect when vehicleInfo changes
  const handleInputChange = (field: keyof VehicleInfo, value: string | number) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tính phí bảo hiểm TNDS xe ô tô</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Mục đích sử dụng:</label>
          <select 
            className="w-full p-2 border rounded"
            value={vehicleInfo.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
          >
            <option value="">Chọn mục đích sử dụng</option>
            <option value="private">Không kinh doanh vận tải</option>
            <option value="business">Kinh doanh vận tải</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Loại xe:</label>
          <select 
            className="w-full p-2 border rounded"
            value={vehicleInfo.vehicleType}
            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
          >
            <option value="">Chọn loại xe</option>
            <option value="car_under_7">Xe dưới 7 chỗ</option>
            <option value="car_7_to_15">Xe 7-15 chỗ</option>
            {/* Add other vehicle types as needed */}
          </select>
        </div>

        <div>
          <label className="block mb-2">Số chỗ ngồi:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={vehicleInfo.seats}
            onChange={(e) => handleInputChange('seats', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>

        <div>
          <label className="block mb-2">Thời hạn bảo hiểm (tháng):</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={vehicleInfo.insuranceTerm}
            onChange={(e) => handleInputChange('insuranceTerm', parseInt(e.target.value) || 12)}
            min="1"
            max="12"
          />
        </div>

        <div>
          <label className="block mb-2">Mức bảo hiểm tai nạn (VND):</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={vehicleInfo.accidentCoverage}
            onChange={(e) => handleInputChange('accidentCoverage', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-3">Chi tiết phí bảo hiểm:</h2>
          <div className="space-y-2">
            <p>Phí bảo hiểm TNDS: {tndsFeeDisplay.toLocaleString()} VND</p>
            <p>Phí bảo hiểm tai nạn: {accidentFeeDisplay.toLocaleString()} VND</p>
            <p className="font-bold">Tổng phí bảo hiểm: {totalFeeDisplay.toLocaleString()} VND</p>
          </div>
        </div>
      </div>
    </div>
  );
};