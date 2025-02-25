import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background: #1e1e2f;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
`;

const DatabaseItem = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: #2a2a3d;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background: #3a3a4d;
  }
`;

const LogoutButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: auto; /* Pushes it to the bottom */

  &:hover {
    background: #ff6666;
  }
`;

const databases = ["UsersDB", "OrdersDB", "ProductsDB", "LogsDB"];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <SidebarContainer>
      <ContentWrapper>
        <h2>Databases</h2>
        {databases.map((db, index) => (
          <DatabaseItem key={index}>{db}</DatabaseItem>
        ))}
      </ContentWrapper>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
