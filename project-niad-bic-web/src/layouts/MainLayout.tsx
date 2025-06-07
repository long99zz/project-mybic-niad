import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "car-insurance",
      label: "Bảo hiểm ô tô",
      children: [
        {
          key: "car-insurance/civil-liability",
          label: "Bảo hiểm TNDS ô tô",
          onClick: () => navigate("/car-insurance/civil-liability"),
        },
      ],
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="NIAD Insurance"
              />
            </div>
            <Menu mode="horizontal" items={menuItems} className="border-0" />
          </div>
        </div>
      </Header>

      <Content className="bg-gray-50">
        <Outlet />
      </Content>

      <Footer className="text-center bg-white">
        NIAD Insurance ©{new Date().getFullYear()} Created by NIAD
      </Footer>
    </Layout>
  );
};

export default MainLayout;
