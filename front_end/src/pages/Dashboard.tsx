import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import Titlebar from "../components/Titlebar"; // Import Titlebar
import styled from "styled-components";

const DashboardWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const SidebarWrapper = styled.div`
  width: 290px;
  height: 100vh;
  overflow-y: auto;
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow: auto;
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
    <DashboardWrapper>
      <SidebarWrapper>
        <Sidebar setTitle={setTitle} />
      </SidebarWrapper>
      <MainContent>
        <Titlebar title={title} />
        <ContentWrapper>
          {/* Other dashboard content here */}
        </ContentWrapper>
      </MainContent>
    </DashboardWrapper>
  );
};

export default Dashboard;
