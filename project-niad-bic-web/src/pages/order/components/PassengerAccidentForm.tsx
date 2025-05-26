import React from "react";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface PassengerAccidentFormProps {
  onSubmit: (values: any) => void;
}

export const PassengerAccidentForm: React.FC<PassengerAccidentFormProps> = ({
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm tai nạn người ngồi" className="mb-4">
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
                name="coveragePerPerson"
                label="Số tiền bảo hiểm/người"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn số tiền bảo hiểm/người",
                  },
                ]}
              >
                <Select placeholder="Chọn số tiền bảo hiểm/người">
                  <Option value="10000000">10 triệu VNĐ</Option>
                  <Option value="20000000">20 triệu VNĐ</Option>
                  <Option value="30000000">30 triệu VNĐ</Option>
                  <Option value="50000000">50 triệu VNĐ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="medicalExpense"
                label="Chi phí y tế"
                rules={[
                  { required: true, message: "Vui lòng chọn chi phí y tế" },
                ]}
              >
                <Select placeholder="Chọn chi phí y tế">
                  <Option value="5000000">5 triệu VNĐ</Option>
                  <Option value="10000000">10 triệu VNĐ</Option>
                  <Option value="20000000">20 triệu VNĐ</Option>
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
