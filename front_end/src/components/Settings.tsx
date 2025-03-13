import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled component for the main settings container
const SettingsWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

// Styled component for the settings grid layout
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  width: 60%;
  max-width: 600px;
  align-items: center;
  justify-content: center;
`;

// Styled component for the labels in the settings grid
const Label = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  padding-right: 10px;
`;

// Styled component for content sections
const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;

// Styled component for theme selection buttons
const ThemeItem = styled.div`
  padding: 10px 20px;
  background: var(--button-bg);
  color: var(--text-light);
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--highlight);
  }
`;

// List of available themes
const themes = [
  { name: "Gruvbox Dark (Default)", className: "" },
  { name: "Monochrome", className: "monochrome" },
  { name: "Analogous", className: "analogous" },
  { name: "Complementary", className: "complementary-light" },
  { name: "Github Light", className: "github-light" },
];

const Settings: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null); // State to store user email
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token"); // Retrieve authentication token from local storage
      if (!token) {
        localStorage.removeItem("token");
        navigate("/"); // Redirect to home page if token is missing
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/protected", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setEmail(data.email); // Set user email if response is successful
        } else {
          console.error("Error fetching user data:", data.message);
          localStorage.removeItem("token");
          navigate("/"); // Redirect on error
        }
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchUserEmail();
  }, [navigate]);

  // Function to change the theme by updating the body's className
  const changeTheme = (className: string) => {
    document.body.className = className;
  };

  return (
    <SettingsWrapper>
      <h2>Settings</h2>
      <SettingsGrid>
        <Label>E-mail</Label>
        <Content>{email || "Loading..."}</Content> {/* Display email or loading text */}
        
        <Label>Themes</Label>
        <Content>
          {/* Render available themes as selectable buttons */}
          {themes.map((theme) => (
            <ThemeItem
              key={theme.name}
              onClick={() => changeTheme(theme.className)}
            >
              {theme.name}
            </ThemeItem>
          ))}
        </Content>
      </SettingsGrid>
    </SettingsWrapper>
  );
};

export default Settings;
