import { create } from "zustand";
import { OrderData } from "@/services/insurance";

interface OrderState {
  orderData: OrderData | null;
  setOrderData: (data: OrderData) => void;
  resetOrderData: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orderData: null,
  setOrderData: (data) => set({ orderData: data }),
  resetOrderData: () => set({ orderData: null }),
}));
