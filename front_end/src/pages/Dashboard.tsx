import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import styled from "styled-components";

const DashboardWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow: auto;
`;

const SidebarWrapper = styled.div`
  height: 100vh;
  overflow-y: auto;
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <DashboardWrapper>
        <SidebarWrapper>
          <Sidebar /> {/* Include Sidebar */}
        </SidebarWrapper>
        <ContentWrapper>
          <h1>Bluetooth Deanonimyser Dashboard</h1>
        </ContentWrapper>
      </DashboardWrapper>
    </div>
  );
};

export default Dashboard;
