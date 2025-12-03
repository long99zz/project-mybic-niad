import React from "react";
import { useParams } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import CarCivilLiabilityOrderPage from "../CarCivilLiabilityOrderPage";
import MotorcycleCivilLiabilityOrderPage from "../MotorcycleCivilLiabilityOrderPage";
import CancerInsuranceOrderPage from "../CancerInsuranceOrderPage";
import PersonalAccidentHealthInsuranceOrderPage from "../PersonalAccidentHealthInsuranceOrderPage";
import TravelInsuranceOrderPage from "../TravelInsuranceOrderPage";
import TravelDomesticInsuranceOrderPage from "../TravelDomesticInsuranceOrderPage";
import TravelAccidentInsuranceOrderPage from "../TravelAccidentInsuranceOrderPage";
import ElectricityAccidentInsuranceOrderPage from "../ElectricityAccidentInsuranceOrderPage";
import ExtendedAccidentInsuranceOrderPage from "../ExtendedAccidentInsuranceOrderPage";
import GPAOrderPage from "../GPAOrderPage";
import HomeInsuranceOrderPage from "../HomeInsuranceOrderPage";
import CyberInsuranceOrderPage from "../CyberInsuranceOrderPage";

export default function InsuranceOrderRouter() {
  const { productId, productType, category } = useParams();

  // Check if car insurance (ô tô)
  const isCarInsurance = () => {
    return (
      (category === "bao-hiem-o-to" &&
        (productId === "tnds-bat-buoc" || productId === "vat-chat-xe")) ||
      productId === "bao-hiem-o-to" ||
      productType === "bao-hiem-o-to"
    );
  };

  // Check if motorcycle insurance (xe máy)
  const isMotorcycleInsurance = () => {
    return (
      (category === "bao-hiem-xe-may" && productId === "tnds-bat-buoc") ||
      productId === "bao-hiem-xe-may" ||
      productType === "bao-hiem-xe-may" ||
      productType === "tnds-xe-may" ||
      productId === "bao-hiem-tnds-xe-may"
    );
  };

  // Check if personal accident & health insurance (BIC Tâm An)
  const isPersonalAccidentHealth = () => {
    return (
      (category === "bao-hiem-suc-khoe" && productId === "bic-tam-an") ||
      productId === "bao-hiem-suc-khoe-tam-an" ||
      productType === "bao-hiem-suc-khoe-tam-an"
    );
  };

  // Check if cancer insurance (BIC Phúc Tâm An)
  const isCancerInsurance = () => {
    return (
      (category === "bao-hiem-suc-khoe" && productId === "bic-phuc-tam-an") ||
      productId === "bao-hiem-benh-ung-thu-phuc-tam-an" ||
      productType === "bao-hiem-benh-ung-thu-phuc-tam-an"
    );
  };

  // Check if travel insurance (du lịch quốc tế)
  const isTravelInsurance = () => {
    return (
      (category === "bao-hiem-du-lich" && productId === "quoc-te") ||
      productId === "bao-hiem-du-lich-quoc-te" ||
      productType === "bao-hiem-du-lich-quoc-te"
    );
  };

  // Check if domestic travel insurance (du lịch trong nước)
  const isTravelDomesticInsurance = () => {
    return (
      (category === "bao-hiem-du-lich" && productId === "trong-nuoc") ||
      productId === "bao-hiem-du-lich-trong-nuoc" ||
      productType === "bao-hiem-du-lich-trong-nuoc"
    );
  };

  // Check if travel accident insurance (tai nạn khách du lịch)
  const isTravelAccidentInsurance = () => {
    return (
      (category === "bao-hiem-du-lich" &&
        productId === "tai-nan-khach-du-lich") ||
      productId === "bao-hiem-tai-nan-khach-du-lich" ||
      productType === "bao-hiem-tai-nan-khach-du-lich"
    );
  };

  // Check if GPA (bảo hiểm tai nạn 24/24)
  const isGPAInsurance = () => {
    return (
      (category === "bao-hiem-tai-nan" && productId === "24-24") ||
      productId === "bao-hiem-tai-nan-24-24" ||
      productType === "bao-hiem-tai-nan-24-24" ||
      productId === "24-24" ||
      productType === "24-24" ||
      productId === "gpa" ||
      productType === "gpa"
    );
  };

  // Check if electricity accident insurance
  const isElectricityAccidentInsurance = () => {
    return (
      (category === "bao-hiem-tai-nan" &&
        productId === "bao-hiem-tai-nan-nguoi-su-dung-dien") ||
      productId === "bao-hiem-tai-nan-nguoi-su-dung-dien" ||
      productType === "bao-hiem-tai-nan-nguoi-su-dung-dien"
    );
  };

  // Check if extended accident insurance
  const isExtendedAccidentInsurance = () => {
    return (
      (category === "bao-hiem-tai-nan" &&
        productId === "bao-hiem-tai-nan-mo-rong") ||
      productId === "bao-hiem-tai-nan-mo-rong" ||
      productType === "bao-hiem-tai-nan-mo-rong"
    );
  };

  // Check if home insurance (bảo hiểm nhà tư nhân)
  const isHomeInsurance = () => {
    return (
      (category === "bao-hiem-nha-tu-nhan" &&
        (productId === "toan-dien" ||
          productId === "bao-hiem-toan-dien-nha-tu-nhan")) ||
      productId === "bao-hiem-nha-tu-nhan" ||
      productId === "bao-hiem-toan-dien-nha-tu-nhan" ||
      productType === "bao-hiem-nha-tu-nhan" ||
      productType === "bao-hiem-toan-dien-nha-tu-nhan"
    );
  };

  // Check if cyber insurance (bảo hiểm an ninh mạng)
  const isCyberInsurance = () => {
    return (
      category === "bao-hiem-an-ninh-mang" ||
      productId === "bao-hiem-an-ninh-mang" ||
      productType === "bao-hiem-an-ninh-mang"
    );
  };

  // Render đúng component
  if (
    isCyberInsurance() ||
    (!productId &&
      !productType &&
      !category &&
      typeof window !== "undefined" &&
      window.location.pathname.includes("bao-hiem-an-ninh-mang"))
  ) {
    return <ProtectedRoute><CyberInsuranceOrderPage /></ProtectedRoute>;
  }
  if (isGPAInsurance()) return <ProtectedRoute><GPAOrderPage /></ProtectedRoute>;
  if (isTravelInsurance()) return <ProtectedRoute><TravelInsuranceOrderPage /></ProtectedRoute>;
  if (isTravelDomesticInsurance()) return <ProtectedRoute><TravelDomesticInsuranceOrderPage /></ProtectedRoute>;
  if (isTravelAccidentInsurance()) return <ProtectedRoute><TravelAccidentInsuranceOrderPage /></ProtectedRoute>;
  if (isPersonalAccidentHealth())
    return <ProtectedRoute><PersonalAccidentHealthInsuranceOrderPage /></ProtectedRoute>;
  if (isCancerInsurance()) return <ProtectedRoute><CancerInsuranceOrderPage /></ProtectedRoute>;
  if (isElectricityAccidentInsurance())
    return <ProtectedRoute><ElectricityAccidentInsuranceOrderPage /></ProtectedRoute>;
  if (isExtendedAccidentInsurance())
    return <ProtectedRoute><ExtendedAccidentInsuranceOrderPage /></ProtectedRoute>;
  if (isMotorcycleInsurance()) return <ProtectedRoute><MotorcycleCivilLiabilityOrderPage /></ProtectedRoute>;
  if (isCarInsurance()) return <ProtectedRoute><CarCivilLiabilityOrderPage /></ProtectedRoute>;
  if (isHomeInsurance()) return <ProtectedRoute><HomeInsuranceOrderPage /></ProtectedRoute>;

  // Mặc định trả về trang ô tô
  return <ProtectedRoute><CarCivilLiabilityOrderPage /></ProtectedRoute>;
}
