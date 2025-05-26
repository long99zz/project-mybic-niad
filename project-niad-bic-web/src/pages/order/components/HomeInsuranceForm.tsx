import React from "react";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface HomeInsuranceFormProps {
  onSubmit: (values: any) => void;
}

export const HomeInsuranceForm: React.FC<HomeInsuranceFormProps> = ({
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm nhà tư nhân" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Địa chỉ nhà"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ nhà" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ nhà" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="houseType"
                label="Loại nhà"
                rules={[{ required: true, message: "Vui lòng chọn loại nhà" }]}
              >
                <Select placeholder="Chọn loại nhà">
                  <Option value="apartment">Căn hộ chung cư</Option>
                  <Option value="house">Nhà riêng</Option>
                  <Option value="villa">Biệt thự</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="constructionYear"
                label="Năm xây dựng"
                rules={[
                  { required: true, message: "Vui lòng chọn năm xây dựng" },
                ]}
              >
                <Select placeholder="Chọn năm xây dựng">
                  {Array.from(
                    { length: 50 },
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
                name="houseValue"
                label="Giá trị nhà"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị nhà" },
                ]}
              >
                <Input type="number" placeholder="Nhập giá trị nhà (VNĐ)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="coverageType"
                label="Loại bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn loại bảo hiểm" },
                ]}
              >
                <Select placeholder="Chọn loại bảo hiểm">
                  <Option value="comprehensive">Toàn diện</Option>
                  <Option value="fire">Cháy nổ</Option>
                  <Option value="natural">Thiên tai</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="coverageAmount"
                label="Số tiền bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn số tiền bảo hiểm" },
                ]}
              >
                <Select placeholder="Chọn số tiền bảo hiểm">
                  <Option value="1000000000">1 tỷ VNĐ</Option>
                  <Option value="2000000000">2 tỷ VNĐ</Option>
                  <Option value="3000000000">3 tỷ VNĐ</Option>
                  <Option value="5000000000">5 tỷ VNĐ</Option>
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
