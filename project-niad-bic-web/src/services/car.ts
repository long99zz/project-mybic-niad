import { api } from "@/lib/api";

export interface CarBrand {
  code: string;
  name: string;
}

export interface CarModel {
  code: string;
  name: string;
  brandCode: string;
}

export const getCarBrands = async (): Promise<CarBrand[]> => {
  const response = await api.get("/car-brands");
  return response.data;
};

export const getCarModels = async (brandCode: string): Promise<CarModel[]> => {
  const response = await api.get(`/car-models?brandCode=${brandCode}`);
  return response.data;
};
