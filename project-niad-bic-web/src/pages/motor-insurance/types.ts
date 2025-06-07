import { FormInstance } from "antd";
import { ReactNode } from "react";

export interface MotorcycleInfo {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  engineNumber: string;
  frameNumber: string;
  usage: string;
}

export interface InsuredInfo {
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export interface PackageInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  coverage: {
    thirdPartyLiability: number;
    personalAccident: number;
  };
}

export interface AddOnInfo {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface MotorcycleOrderFormData {
  motorcycleInfo: MotorcycleInfo;
  insuredInfo: InsuredInfo;
  selectedPackage: PackageInfo;
  selectedAddOns: AddOnInfo[];
}

export interface StepProps {
  form: FormInstance;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  children?: ReactNode;
}

export interface PackageSelectionProps extends StepProps {
  onPackageSelect: (packageInfo: PackageInfo) => void;
  selectedPackage?: PackageInfo;
}

export interface AddOnSelectionProps extends StepProps {
  onAddOnSelect: (addOns: AddOnInfo[]) => void;
  selectedAddOns: AddOnInfo[];
}

export interface ConfirmationProps extends StepProps {
  orderData: MotorcycleOrderFormData;
  onConfirm: () => void;
}
