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
  InputNumber,
} from "antd";
import CustomerSupport from "@/components/CustomerSupport";

const { Option } = Select;

interface CarMaterialInsuranceFormProps {
  onSubmit: (values: any) => void;
}

export const CarMaterialInsuranceForm: React.FC<
  CarMaterialInsuranceFormProps
> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Thông tin đặt bảo hiểm vật chất ô tô" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerType"
                label="Loại chủ xe"
                rules={[
                  { required: true, message: "Vui lòng chọn loại chủ xe" },
                ]}
              >
                <Radio.Group>
                  <Radio value="personal">Cá nhân</Radio>
                  <Radio value="organization">Tổ chức</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="identityNumber"
                label="Số CMND/CCCD/MST"
                rules={[
                  { required: true, message: "Vui lòng nhập số CMND/CCCD/MST" },
                ]}
              >
                <Input placeholder="Nhập số CMND/CCCD/MST" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usagePurpose"
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
                name="vehicleType"
                label="Loại xe"
                rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
              >
                <Select placeholder="Chọn loại xe">
                  <Option value="sedan">Sedan</Option>
                  <Option value="suv">SUV</Option>
                  <Option value="hatchback">Hatchback</Option>
                  <Option value="crossover">Crossover</Option>
                  <Option value="pickup">Pickup</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="seats"
                label="Số chỗ ngồi"
                rules={[
                  { required: true, message: "Vui lòng nhập số chỗ ngồi" },
                ]}
              >
                <InputNumber min={2} max={45} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loadCapacity"
                label="Tải trọng (kg)"
                rules={[{ required: true, message: "Vui lòng nhập tải trọng" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerName"
                label="Tên chủ xe"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chủ xe" },
                ]}
              >
                <Input placeholder="Nhập tên chủ xe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="registrationAddress"
                label="Địa chỉ đăng ký"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ đăng ký" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ đăng ký" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hasPlate"
                label="Đã có biển số"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái biển số",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Chưa có</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="plateNumber"
                label="Biển số xe"
                rules={[
                  { required: true, message: "Vui lòng nhập biển số xe" },
                ]}
              >
                <Input placeholder="Nhập biển số xe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chassisNumber"
                label="Số khung"
                rules={[{ required: true, message: "Vui lòng nhập số khung" }]}
              >
                <Input placeholder="Nhập số khung" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="engineNumber"
                label="Số máy"
                rules={[{ required: true, message: "Vui lòng nhập số máy" }]}
              >
                <Input placeholder="Nhập số máy" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="insuranceStart"
                label="Ngày bắt đầu bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="insuranceDuration"
                label="Thời hạn bảo hiểm"
                rules={[{ required: true, message: "Vui lòng chọn thời hạn" }]}
              >
                <Select placeholder="Chọn thời hạn">
                  <Option value={1}>1 năm</Option>
                  <Option value={2}>2 năm</Option>
                  <Option value={3}>3 năm</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="insuranceAmount"
                label="Số tiền bảo hiểm"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền bảo hiểm" },
                ]}
              >
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deductible"
                label="Mức khấu trừ"
                rules={[
                  { required: true, message: "Vui lòng nhập mức khấu trừ" },
                ]}
              >
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  className="w-full"
                />
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
