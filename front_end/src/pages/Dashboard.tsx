import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import Titlebar from "../components/Titlebar";
import Admin from "../components/Admin"; // Corrected import
import Devices from "../components/Devices";
import Settings from "../components/Settings";
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
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Bluetooth Deanonimyser Dashboard");
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <DashboardWrapper>
      <SidebarWrapper style={{ width: isSidebarHidden ? "55px" : "290px" }}>
        <Sidebar setTitle={setTitle} setSidebarHidden={setIsSidebarHidden} />
      </SidebarWrapper>
      <MainContent style={{ marginLeft: isSidebarHidden ? "5px" : "5px" }}>
        <Titlebar title={title} />
        <ContentWrapper>
          {title === "Devices" ? <Devices />: title === "Settings" ? <Settings /> : title === "Admin" ? <Admin /> : <p>Dashboard</p>}
        </ContentWrapper>
      </MainContent>
    </DashboardWrapper>
  );
};


export default Dashboard;
