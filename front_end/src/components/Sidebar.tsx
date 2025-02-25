import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background: #1e1e2f;
  color: white;
  padding: 20px;
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

const databases = ["UsersDB", "OrdersDB", "ProductsDB", "LogsDB"];

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <h2>Databases</h2>
      {databases.map((db, index) => (
        <DatabaseItem key={index}>{db}</DatabaseItem>
      ))}
    </SidebarContainer>
  );
};

export default Sidebar;
