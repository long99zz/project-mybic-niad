export interface RegisterFormData {
  userType: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  idNumber: string;
  gender: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  province: string;
  city: string;
  district: string;
  ward: string;
  houseNumber: string;
}

export const validateRegisterForm = (formData: RegisterFormData) => {
  const errors: Record<string, string> = {};

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Validate password
  if (formData.password.length < 8) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
  }

  // Validate confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Mật khẩu không khớp";
  }

  // Validate phone
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(formData.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  // Validate ID number
  if (formData.idNumber && !/^[0-9]{9,12}$/.test(formData.idNumber)) {
    errors.idNumber = "CMND/CCCD không hợp lệ";
  }

  // Validate required fields
  const requiredFields = [
    "lastName",
    "firstName",
    "email",
    "phone",
    "password",
  ];
  requiredFields.forEach((field) => {
    if (!formData[field as keyof RegisterFormData]) {
      errors[field] = "Vui lòng điền thông tin này";
    }
  });

  // Validate date of birth
  if (formData.birthYear && formData.birthMonth && formData.birthDay) {
    const birthDate = new Date(
      parseInt(formData.birthYear),
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (isNaN(birthDate.getTime())) {
      errors.birthDay = "Ngày sinh không hợp lệ";
    } else if (age < 18) {
      errors.birthDay = "Bạn phải đủ 18 tuổi để đăng ký";
    }
  }

  return errors;
};
