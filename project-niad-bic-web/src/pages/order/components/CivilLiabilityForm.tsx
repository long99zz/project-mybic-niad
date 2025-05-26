import React from "react";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface CivilLiabilityFormProps {
  onSubmit: (values: any) => void;
}

export const CivilLiabilityForm: React.FC<CivilLiabilityFormProps> = ({
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm trách nhiệm dân sự" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carType"
                label="Loại xe"
                rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
              >
                <Select placeholder="Chọn loại xe">
                  <Option value="car">Ô tô con</Option>
                  <Option value="truck">Ô tô tải</Option>
                  <Option value="bus">Ô tô khách</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="seatCount"
                label="Số chỗ ngồi"
                rules={[
                  { required: true, message: "Vui lòng nhập số chỗ ngồi" },
                ]}
              >
                <Input type="number" placeholder="Nhập số chỗ ngồi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="coverageAmount"
                label="Số tiền bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn số tiền bảo hiểm" },
                ]}
              >
                <Select placeholder="Chọn số tiền bảo hiểm">
                  <Option value="100000000">100 triệu VNĐ</Option>
                  <Option value="200000000">200 triệu VNĐ</Option>
                  <Option value="300000000">300 triệu VNĐ</Option>
                  <Option value="500000000">500 triệu VNĐ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="usage"
                label="Mục đích sử dụng"
                rules={[
                  { required: true, message: "Vui lòng chọn mục đích sử dụng" },
                ]}
              >
                <Select placeholder="Chọn mục đích sử dụng">
                  <Option value="personal">Cá nhân</Option>
                  <Option value="business">Kinh doanh</Option>
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
