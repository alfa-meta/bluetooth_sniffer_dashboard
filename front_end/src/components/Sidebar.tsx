import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


const horizontalPadding: number  = 18

const SidebarContainer = styled.div<{ isHidden: boolean }>`
  width: ${(props) => (props.isHidden ? "25px" : "250px")};
  height: ${(props) => (props.isHidden ? "100vh" : "100vh")};
  background: var(--bg-light);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: ${horizontalPadding}px;
  padding-right: ${horizontalPadding}px;
  border-right: 1px solid var(--border-color);
  box-shadow: ${(props) => (props.isHidden ? "none" : "2px 0 5px var(--box-shadow)")};
  overflow: hidden;
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
  position: relative;
  align-items: ${(props) => (props.isHidden ? "center" : "flex-start")};
`;

const ToggleButton = styled.button<{ isHidden: boolean }>`
  background: transparent;
  color: var(--text-light);
  border: none;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  
  position: absolute;
  top: 10px;
  right: ${(props) => (props.isHidden ? "5px" : "10px")};
  z-index: 1100;

  &:hover {
    background: transparent;
  }
`;

const ContentWrapper = styled.div<{ isHidden: boolean }>`
  flex-grow: 1;
  width: 100%;
  height: 100%;
  visibility: ${(props) => (props.isHidden ? "hidden" : "visible")};
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;


const SideBarItem = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: var(--bg-dark);
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;

  &:hover {
    background: var(--highlight);
    color: var(--bg-dark);
  }
`;

const LogoutButton = styled.button`
  background: var(--button-bg);
  color: var(--text-light);
  border: none;
  padding: 15px;
  padding-left: 103px;
  padding-right: 102px;
  border-radius: 5px;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  transition: background 0.3s;

  &:hover {
    background: var(--red);
  }
`;

const pages = ["Admin", "Devices", "Settings"];

const Sidebar: React.FC<{ setTitle: (title: string) => void, setSidebarHidden: (hidden: boolean) => void }> = ({ setTitle, setSidebarHidden }) => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);

  const handleToggle = () => {
    setIsHidden(!isHidden);
    setSidebarHidden(!isHidden);  // Pass state up to Dashboard
  };

  return (
    <SidebarContainer isHidden={isHidden}>
      <ToggleButton onClick={handleToggle} isHidden={isHidden}>
        {isHidden ? <FaArrowRight /> : <FaArrowLeft />}
      </ToggleButton>
      <ContentWrapper isHidden={isHidden}>
        <h2>Deanonimyser Dashboard</h2>
        {pages.map((page, index) => (
          <SideBarItem key={index} onClick={() => setTitle(page)}>{page}</SideBarItem>
        ))}
        <LogoutButton onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}>Logout</LogoutButton>
      </ContentWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;
