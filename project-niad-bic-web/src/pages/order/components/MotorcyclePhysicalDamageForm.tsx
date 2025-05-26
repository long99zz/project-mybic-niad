import React from "react";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface MotorcyclePhysicalDamageFormProps {
  onSubmit: (values: any) => void;
}

export const MotorcyclePhysicalDamageForm: React.FC<
  MotorcyclePhysicalDamageFormProps
> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm vật chất xe máy" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Hãng xe"
                rules={[{ required: true, message: "Vui lòng chọn hãng xe" }]}
              >
                <Select placeholder="Chọn hãng xe">
                  <Option value="honda">Honda</Option>
                  <Option value="yamaha">Yamaha</Option>
                  <Option value="suzuki">Suzuki</Option>
                  <Option value="sym">SYM</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="Dòng xe"
                rules={[{ required: true, message: "Vui lòng chọn dòng xe" }]}
              >
                <Select placeholder="Chọn dòng xe">
                  {/* Options sẽ được load động dựa vào hãng xe */}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="year"
                label="Năm sản xuất"
                rules={[
                  { required: true, message: "Vui lòng chọn năm sản xuất" },
                ]}
              >
                <Select placeholder="Chọn năm sản xuất">
                  {Array.from(
                    { length: 20 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Giá trị xe"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị xe" },
                ]}
              >
                <Input type="number" placeholder="Nhập giá trị xe (VNĐ)" />
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
