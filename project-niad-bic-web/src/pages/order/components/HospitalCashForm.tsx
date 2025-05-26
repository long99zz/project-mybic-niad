import React from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Radio,
} from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface HospitalCashFormProps {
  onSubmit: (values: any) => void;
}

export const HospitalCashForm: React.FC<HospitalCashFormProps> = ({
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm nằm viện" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Radio.Group>
                  <Radio value="male">Nam</Radio>
                  <Radio value="female">Nữ</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idNumber"
                label="Số CMND/CCCD"
                rules={[
                  { required: true, message: "Vui lòng nhập số CMND/CCCD" },
                ]}
              >
                <Input placeholder="Nhập số CMND/CCCD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dailyAmount"
                label="Số tiền/ngày nằm viện"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn số tiền/ngày nằm viện",
                  },
                ]}
              >
                <Select placeholder="Chọn số tiền/ngày nằm viện">
                  <Option value="500000">500.000 VNĐ</Option>
                  <Option value="1000000">1.000.000 VNĐ</Option>
                  <Option value="2000000">2.000.000 VNĐ</Option>
                  <Option value="3000000">3.000.000 VNĐ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxDays"
                label="Số ngày tối đa"
                rules={[
                  { required: true, message: "Vui lòng chọn số ngày tối đa" },
                ]}
              >
                <Select placeholder="Chọn số ngày tối đa">
                  <Option value="30">30 ngày</Option>
                  <Option value="60">60 ngày</Option>
                  <Option value="90">90 ngày</Option>
                  <Option value="120">120 ngày</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <CustomerSupport />
    </div>
  );
};
