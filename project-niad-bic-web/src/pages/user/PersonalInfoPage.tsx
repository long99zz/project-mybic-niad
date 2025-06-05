import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "lucide-react";
import { toast } from "react-toastify";

const PersonalInfoPage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    houseNumber: "",
    province: "",
    city: "",
    district: "",
    subDistrict: "",
    citizenId: "",
    gender: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        houseNumber: user.houseNumber || "",
        province: user.province || "",
        city: user.city || "",
        district: user.district || "",
        subDistrict: user.subDistrict || "",
        citizenId: user.citizenId || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
      });
    }
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("Saving data:", formData);
    const result = await updateUser(formData);

    if (result.success) {
      toast.success(result.message);
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Thông tin cá nhân
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* User Info Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {`${formData.last_name} ${formData.first_name}`.trim()}
            </h3>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
        </div>
        {/* Personal Info Form - Applied grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center">
          {/* Last Name */}
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Họ <span className="text-red-600">*</span>
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* First Name */}
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Tên <span className="text-red-600">*</span>
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* Email */}
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Email
          </label>
          <div className="md:col-span-2">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm border-transparent bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Số điện thoại <span className="text-red-600">*</span>
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* Citizen ID */}
          <label
            htmlFor="citizenId"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            CCCD/CMND
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="citizenId"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* Date of Birth */}
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Ngày sinh
          </label>
          <div className="md:col-span-2">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* Gender */}
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Giới tính
          </label>
          <div className="md:col-span-2">
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Province */}
          <label
            htmlFor="province"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Tỉnh/Thành phố
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* District */}
          <label
            htmlFor="district"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Quận/Huyện
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:focus:ring-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* Sub District */}
          <label
            htmlFor="subDistrict"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Phường/Xã
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="subDistrict"
              name="subDistrict"
              value={formData.subDistrict}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>

          {/* House Number */}
          <label
            htmlFor="houseNumber"
            className="block text-sm font-medium text-gray-700 md:text-left"
          >
            Số nhà, tên đường
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              id="houseNumber"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              readOnly={!isEditing}
              className={
                `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ` +
                `${
                  isEditing
                    ? "border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    : "border-transparent bg-gray-100 cursor-not-allowed"
                }`
              }
            />
          </div>
        </div>{" "}
        {/* End of grid */}
        <div className="mt-6 flex justify-end">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Lưu
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
