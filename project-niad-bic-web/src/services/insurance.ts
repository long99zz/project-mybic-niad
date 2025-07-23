import { api } from "@/lib/api";

export interface PremiumData {
  materialPremium: number;
  accidentPremium: number;
  totalPremium: number;
  discount: number;
  finalPremium: number;
}

export interface OrderData {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  usage: "personal" | "business";
  brand: string;
  model: string;
  year: number;
  seats: number;
  carValue: number;
  insuranceValue: number;
  registrationDate: string;
  startDate: string;
  endDate: string;
  deductible: number;
  extendedCoverage: string[];
}

export const calculatePremium = async (
  orderData: OrderData
): Promise<PremiumData> => {
  const response = await api.post("/calculate-premium", orderData);
  return response.data;
};
