import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const SidebarContainer = styled.div<{ isHidden: boolean }>`
  width: ${(props) => (props.isHidden ? "5%" : "250px")};
  height: 95vh;
  background: var(--bg-light);
  color: var(--text-light);
  padding: ${(props) => (props.isHidden ? "0" : "20px")};
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  box-shadow: ${(props) => (props.isHidden ? "none" : "2px 0 5px var(--box-shadow)")};
  overflow: hidden;
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
  position: relative;
  align-items: ${(props) => (props.isHidden ? "center" : "flex-start")};
`;

const ToggleButton = styled.button`
  background: var(--button-bg);
  color: var(--text-light);
  border: none;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1100;

  &:hover {
    background: var(--button-hover);
  }
`;

const ContentWrapper = styled.div<{ isHidden: boolean }>`
  flex-grow: 1;
  display: ${(props) => (props.isHidden ? "none" : "block")};
  width: 100%;
`;

const DatabaseItem = styled.div`
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
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: auto;
  transition: background 0.3s;

  &:hover {
    background: var(--button-hover);
  }
`;

const databases = ["Admin", "Database Viewer", "Settings"];

const Sidebar: React.FC<{ setTitle: (title: string) => void }> = ({ setTitle }) => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <SidebarContainer isHidden={isHidden}>
      <ToggleButton onClick={() => setIsHidden(!isHidden)}>
        {isHidden ? <FaArrowRight /> : <FaArrowLeft />}
      </ToggleButton>
      <ContentWrapper isHidden={isHidden}>
        <h2>Deanonimyser Dashboard</h2>
        {databases.map((db, index) => (
          <DatabaseItem key={index} onClick={() => setTitle(db)}>{db}</DatabaseItem>
        ))}
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </ContentWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;