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
import { INSURANCE_FEES } from "@/constants/motorcycleInsurance";

const { Option } = Select;

interface MotorcycleCivilLiabilityFormProps {
  onSubmit: (values: any) => void;
}

export const MotorcycleCivilLiabilityForm: React.FC<
  MotorcycleCivilLiabilityFormProps
> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  // Cập nhật phí bảo hiểm khi loại xe thay đổi
  const handleVehicleTypeChange = (value: keyof typeof INSURANCE_FEES) => {
    form.setFieldsValue({
      insuranceFee: INSURANCE_FEES[value],
    });
  };

  // Cập nhật loại xe và phí khi dung tích thay đổi
  const handleEngineCapacityChange = (value: number | null) => {
    if (value !== null) {
      const vehicleType = value < 50 ? "moto_2_under_50" : "moto_2_over_50";
      form.setFieldsValue({
        vehicleType,
        insuranceFee: INSURANCE_FEES[vehicleType],
      });
    }
  };

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      insuranceFee: INSURANCE_FEES[values.vehicleType],
    });
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card
        title="Thông tin đặt bảo hiểm trách nhiệm dân sự xe máy"
        className="mb-4"
      >
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
                name="identityCard"
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
                name="vehicleType"
                label="Loại xe"
                rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
              >
                <Select
                  placeholder="Chọn loại xe"
                  onChange={handleVehicleTypeChange}
                >
                  <Option value="moto_2_under_50">
                    Mô tô 2 bánh dưới 50cc (55.000đ)
                  </Option>
                  <Option value="moto_2_over_50">
                    Mô tô 2 bánh từ 50cc trở lên (60.000đ)
                  </Option>
                  <Option value="moto_3">Mô tô 3 bánh (290.000đ)</Option>
                  <Option value="electric">Xe máy điện (55.000đ)</Option>
                  <Option value="other">Các loại xe còn lại (290.000đ)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="engineCapacity"
                label="Dung tích xi lanh (cc)"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập dung tích xi lanh",
                  },
                ]}
              >
                {" "}
                <Input
                  type="number"
                  className="w-full"
                  placeholder="VD: 125"
                  onChange={(e) =>
                    handleEngineCapacityChange(Number(e.target.value))
                  }
                />
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
                name="licensePlateStatus"
                label="Trạng thái biển số"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái biển số",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="Mới">Mới</Radio>
                  <Radio value="Cũ">Cũ</Radio>
                  <Radio value="Chưa có">Chưa có</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="licensePlate"
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
                name="insuranceStartDate"
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
                name="insuranceTerm"
                label="Thời hạn bảo hiểm"
                rules={[{ required: true, message: "Vui lòng chọn thời hạn" }]}
                initialValue={1}
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
              <Form.Item name="insuranceFee" label="Phí bảo hiểm (VNĐ)">
                <InputNumber
                  className="w-full"
                  readOnly
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accidentCoverage"
                label="Mức bồi thường tai nạn (VNĐ)"
                initialValue={100000000}
              >
                <InputNumber
                  className="w-full"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Tiếp tục{" "}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <CustomerSupport />
    </div>
  );
};
