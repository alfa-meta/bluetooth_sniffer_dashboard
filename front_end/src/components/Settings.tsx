import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SettingsWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  width: 60%;
  max-width: 600px;
  align-items: center;
  justify-content: center;
`;

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

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;

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

const Button = styled.button`
  padding: 10px 15px;
  background: var(--button-bg);
  color: var(--text-light);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--highlight);
  }
`;

const Input = styled.input`
  padding: 8px;
  width: 100%;
  border: 1px solid var(--text-dark);
  border-radius: 5px;
`;

const themes = [
  { name: "Gruvbox Dark (Default)", className: "" },
  { name: "Monochrome", className: "monochrome" },
  { name: "Analogous", className: "analogous" },
  { name: "Complementary", className: "complementary-light" },
  { name: "Github Light", className: "github-light" },
];

const Settings: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token");
        navigate("/");
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
          setEmail(data.email);
        } else {
          console.error("Error fetching user data:", data.message);
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchUserEmail();
  }, [navigate]);

  const changeTheme = (className: string) => {
    document.body.className = className;
  };

  return (
    <SettingsWrapper>
      <h2>Settings</h2>
      <SettingsGrid>
        <Label>E-mail</Label>
        <Content>{email || "Loading..."}</Content>

        <Label>Change Password</Label>
        <Content>
          <Button>Change Password</Button>
        </Content>

        <Label>Database Location</Label>
        <Content>
          <Input type="text" placeholder="Enter database path" />
        </Content>
        <Label>Themes</Label>
        <Content>
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
