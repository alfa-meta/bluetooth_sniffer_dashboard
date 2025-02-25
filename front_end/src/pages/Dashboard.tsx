import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import styled from "styled-components";

const DashboardWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
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
        <Sidebar /> {/* Include Sidebar */}
        <ContentWrapper>
          <h1>Bluetooth Deanonimyser Dashboard</h1>
        </ContentWrapper>
      </DashboardWrapper>
    </div>
  );
};

export default Dashboard;
