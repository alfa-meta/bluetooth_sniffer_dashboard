import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SidebarContainer = styled.div`
  width: 250px;
  height: 95vh;
  background: var(--bg-light);
  color: var(--text-light);
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  box-shadow: 2px 0 5px var(--box-shadow);
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <SidebarContainer>
      <ContentWrapper>
        <h2>Deanonimyser Dashboard</h2>
        {databases.map((db, index) => (
          <DatabaseItem key={index} onClick={() => setTitle(db)}>{db}</DatabaseItem>
        ))}
      </ContentWrapper>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
