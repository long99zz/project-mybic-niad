import React from "react";
import { Form } from "antd";
import type { FormItemProps } from "antd";

export const FormItem: React.FC<FormItemProps> = (props) => {
  return <Form.Item {...props} />;
};
