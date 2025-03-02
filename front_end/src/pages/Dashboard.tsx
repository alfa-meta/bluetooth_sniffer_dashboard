import React, { useEffect, useState } from "react";
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
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  text-align: center;
  margin-top: 20px;
`;

const SidebarWrapper = styled.div`
  height: 100vh;
  overflow-y: auto;
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Bluetooth Deanonimyser Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      <DashboardWrapper>
        <SidebarWrapper>
          <Sidebar setTitle={setTitle} /> {/* Pass setTitle function to Sidebar */}
        </SidebarWrapper>
        <ContentWrapper>
          <Title>{title}</Title>
        </ContentWrapper>
      </DashboardWrapper>
    </div>
  );
};

export default Dashboard;
