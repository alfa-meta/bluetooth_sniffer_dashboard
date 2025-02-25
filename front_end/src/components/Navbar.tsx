import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const NavbarContainer = styled.div`
  height: 60px;
  background: #282c34;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
`;

const Button = styled.button`
  background: #ffcc00;
  color: black;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background: #ffdd44;
  }
`;

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear authentication token
    navigate("/"); // Redirect to login page
  };

  return (
    <NavbarContainer>
      <Button onClick={handleLogout}>Logout</Button>
    </NavbarContainer>
  );
};

export default Navbar;
