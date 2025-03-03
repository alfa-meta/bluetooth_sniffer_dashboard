import React from "react";
import styled from "styled-components";

const SettingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
`;

const TopBar = styled.div`
  position: absolute;
  top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
`;

const ThemesContainer = styled.div`
  display: flex;
  gap: 10px;
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


const themes = [
  { name: "Gruvbox Dark (Default)", className: "" },
  { name: "Monochrome", className: "monochrome" },
  { name: "Analogous", className: "analogous" },
  { name: "Complementary", className: "complementary-light" },
  { name: "Triadic", className: "triadic-light" },
];

const Settings: React.FC = () => {
  const changeTheme = (className: string) => {
    document.body.className = className; // Set body class
  };

  return (
    <SettingsWrapper>
      <TopBar>
        <ThemesContainer>
          {themes.map((theme) => (
            <ThemeItem key={theme.name} onClick={() => changeTheme(theme.className)}>
              {theme.name}
            </ThemeItem>
          ))}
        </ThemesContainer>
      </TopBar>
    </SettingsWrapper>
  );
};

export default Settings;
