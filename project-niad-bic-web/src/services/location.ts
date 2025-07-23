import { api } from "@/lib/api";

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export const getProvinces = async (): Promise<Province[]> => {
  const response = await api.get("/provinces");
  return response.data;
};

export const getDistricts = async (
  provinceCode: string
): Promise<District[]> => {
  const response = await api.get(`/districts?provinceCode=${provinceCode}`);
  return response.data;
};
