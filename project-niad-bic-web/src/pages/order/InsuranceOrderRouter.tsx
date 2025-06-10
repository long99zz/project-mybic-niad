import React from "react";
import { useParams } from "react-router-dom";
import CarCivilLiabilityOrderPage from "../CarCivilLiabilityOrderPage";
import MotorcycleCivilLiabilityOrderPage from "../MotorcycleCivilLiabilityOrderPage";

export default function InsuranceOrderRouter() {
  const { productId, productType } = useParams();

  // Kiểm tra nếu là bảo hiểm xe máy
  const isMotorcycleInsurance = () => {
    if (productId?.includes("xe-may") || productType?.includes("xe-may")) {
      return true;
    }
    return false;
  };

  // Render component tương ứng dựa vào loại sản phẩm
  return isMotorcycleInsurance() ? (
    <MotorcycleCivilLiabilityOrderPage />
  ) : (
    <CarCivilLiabilityOrderPage />
  );
}
