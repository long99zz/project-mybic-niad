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

interface TravelInsuranceFormProps {
  onSubmit: (values: any) => void;
}

export const TravelInsuranceForm: React.FC<TravelInsuranceFormProps> = ({
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm du lịch" className="mb-4">
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
                name="destination"
                label="Điểm đến"
                rules={[{ required: true, message: "Vui lòng chọn điểm đến" }]}
              >
                <Select placeholder="Chọn điểm đến">
                  <Option value="domestic">Trong nước</Option>
                  <Option value="asia">Châu Á</Option>
                  <Option value="europe">Châu Âu</Option>
                  <Option value="america">Châu Mỹ</Option>
                  <Option value="australia">Châu Úc</Option>
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
                  <Option value="100000000">100 triệu VNĐ</Option>
                  <Option value="200000000">200 triệu VNĐ</Option>
                  <Option value="300000000">300 triệu VNĐ</Option>
                  <Option value="500000000">500 triệu VNĐ</Option>
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
