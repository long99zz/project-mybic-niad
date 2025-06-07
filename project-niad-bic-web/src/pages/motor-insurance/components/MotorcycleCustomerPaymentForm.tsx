import React from "react";
import { Form, Input, Select, Radio, Button, Card } from "antd";

const { Option } = Select;

interface MotorcycleCustomerPaymentFormProps {
  initialData: any;
  onSubmit: (values: any) => void;
  onPrevious: () => void;
}

const MotorcycleCustomerPaymentForm: React.FC<
  MotorcycleCustomerPaymentFormProps
> = ({ initialData, onSubmit, onPrevious }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onSubmit({
      ...initialData,
      ...values,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Thông tin khách hàng & Thanh toán
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialData}
        className="space-y-4"
      >
        <Form.Item
          name="customerType"
          label="Loại khách hàng"
          rules={[{ required: true, message: "Vui lòng chọn loại khách hàng" }]}
        >
          <Radio.Group>
            <Radio value="individual">Cá nhân</Radio>
            <Radio value="organization">Tổ chức</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          name="identityCard"
          label="Số CMND/CCCD"
          rules={[{ required: true, message: "Vui lòng nhập số CMND/CCCD" }]}
        >
          <Input placeholder="Nhập số CMND/CCCD" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item
          name="invoice"
          label="Yêu cầu xuất hóa đơn"
          rules={[
            { required: true, message: "Vui lòng chọn yêu cầu xuất hóa đơn" },
          ]}
        >
          <Radio.Group>
            <Radio value="yes">Có</Radio>
            <Radio value="no">Không</Radio>
          </Radio.Group>
        </Form.Item>

        <div className="flex justify-between mt-6">
          <Button
            type="default"
            onClick={onPrevious}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Xác nhận & Thanh toán
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MotorcycleCustomerPaymentForm;
