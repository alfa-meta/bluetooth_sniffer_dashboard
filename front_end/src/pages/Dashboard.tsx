import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
// import Titlebar from "../components/Titlebar";
import Scanner from "../components/Scanner";
import Logs from "../components/Logs";
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
  overflow: hidden; /* Ensure no scrolling at this level */
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden; /* Changed from auto to hidden to prevent scrolling */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

// Add this new component for content that needs to be visible but not scrollable
const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative; /* Create positioning context for children */
  
  /* This creates a non-scrollable container that shows content within the visible area only */
  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Bluetooth Deanonimyser Dashboard");
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  return (
    <DashboardWrapper>
      <SidebarWrapper style={{ width: isSidebarHidden ? "55px" : "290px" }}>
        <Sidebar setTitle={setTitle} setSidebarHidden={setIsSidebarHidden} />
      </SidebarWrapper>
      <MainContent style={{ marginLeft: isSidebarHidden ? "5px" : "5px" }}>
        {/* <Titlebar title={title} /> */}
        <ContentWrapper>
          <ContentContainer>
          {title === "Scanner" ? (
            <Scanner />
          ) : title === "Logs" ? (
            <Logs />
          ) : title === "Devices" ? (
            <Devices />
          ) : title === "Settings" ? (
            <Settings />
          ) : title === "Admin" ? (
            <Admin />
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <p>Welcome, to the Bluetooth Dashboard!</p>
            </div>
          )}
          </ContentContainer>
        </ContentWrapper>
      </MainContent>
    </DashboardWrapper>
  );
};

export default Dashboard;