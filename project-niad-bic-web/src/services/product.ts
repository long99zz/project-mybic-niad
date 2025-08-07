import axios from "axios";
const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getProducts = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
