import React from "react";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface MandatoryCivilLiabilityFormProps {
  onSubmit: (values: any) => void;
}

export const MandatoryCivilLiabilityForm: React.FC<
  MandatoryCivilLiabilityFormProps
> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card
        title="Thông tin đặt bảo hiểm trách nhiệm dân sự bắt buộc"
        className="mb-4"
      >
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
            <Col span={12}>
              <Form.Item
                name="region"
                label="Khu vực"
                rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
              >
                <Select placeholder="Chọn khu vực">
                  <Option value="north">Miền Bắc</Option>
                  <Option value="central">Miền Trung</Option>
                  <Option value="south">Miền Nam</Option>
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
