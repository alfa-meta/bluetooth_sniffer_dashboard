import React from "react";
import styled from "styled-components";

const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content vertically */
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
  padding-top: 40px;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  width: 60%;
  max-width: 600px;
  align-items: center;
  justify-content: center; /* Center content horizontally */
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
  justify-content: center; /* Center content */
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
  { name: "Triadic", className: "triadic-light" },
];

const Settings: React.FC = () => {
  const changeTheme = (className: string) => {
    document.body.className = className;
  };

  return (
    <SettingsWrapper>
      <SettingsGrid>
        <Label>Themes</Label>
        <Content>
          {themes.map((theme) => (
            <ThemeItem key={theme.name} onClick={() => changeTheme(theme.className)}>
              {theme.name}
            </ThemeItem>
          ))}
        </Content>

        <Label>E-mail</Label>
        <Content>example@mail.com</Content>

        <Label>Change Password</Label>
        <Content><Button>Change Password</Button></Content>

        <Label>Database Location</Label>
        <Content><Input type="text" placeholder="Enter database path" /></Content>
      </SettingsGrid>
    </SettingsWrapper>
  );
};

export default Settings;
