import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled component definitions
const SettingsWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  align-items: center;
  justify-content: center;
`;

const Row = styled.div`
  grid-column: span 2;
  background-color: var(--bg-light);
  padding: 10px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 10px;
`;


const Label = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
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

const Input = styled.input`
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: var(--bg-light);
  color: var(--text-light);
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--button-bg);
  color: var(--text-light);
  cursor: pointer;

  &:hover {
    background-color: var(--highlight);
  }
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
  const [packets, setPackets] = useState("");
  const [scanTime, setScanTime] = useState("");
  const [initialState, setInitialState] = useState({ packets: "", scanTime: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const storedPackets = localStorage.getItem("packets") || "100";
    const storedScanTime = localStorage.getItem("scanTime") || "15";

    setPackets(storedPackets);
    setScanTime(storedScanTime);
    setInitialState({ packets: storedPackets, scanTime: storedScanTime });

    localStorage.setItem("packets", storedPackets);
    localStorage.setItem("scanTime", storedScanTime);

    const savedTheme = localStorage.getItem("theme") || "";
    document.body.className = savedTheme;

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
          localStorage.setItem("email", data.email);
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
    localStorage.setItem("theme", className);
  };

  const hasChanges = packets !== initialState.packets || scanTime !== initialState.scanTime;

  const handleApply = async () => {
    const confirm = await window.confirm("Apply new settings?");
    if (!confirm) return;
  
    const validatedPackets = Math.max(parseInt(packets) || 0, 10);
    const validatedScanTime = Math.max(parseInt(scanTime) || 0, 3);
  
    setPackets(validatedPackets.toString());
    setScanTime(validatedScanTime.toString());
  
    localStorage.setItem("packets", validatedPackets.toString());
    localStorage.setItem("scanTime", validatedScanTime.toString());
    setInitialState({
      packets: validatedPackets.toString(),
      scanTime: validatedScanTime.toString(),
    });
  };

  return (
    <SettingsWrapper>
      <h2>Settings</h2>
      <SettingsGrid>
        <Row>
          <Label>E-mail</Label>
          <Content>{email || "Loading..."}</Content>
        </Row>

        <Row>
          <Label>Themes</Label>
          <Content>
            {themes.map((theme) => (
              <ThemeItem key={theme.name} onClick={() => changeTheme(theme.className)}>
                {theme.name}
              </ThemeItem>
            ))}
          </Content>
        </Row>

        <Row>
          <Label>Number of Packets</Label>
          <Content>
          <Input
            type="number"
            min="10"
            value={packets}
            onChange={(e) => setPackets(e.target.value)}
          />
          </Content>
        </Row>

        <Row>
          <Label>Scan Time</Label>
          <Content>
          <Input
            type="number"
            min="3"
            value={scanTime}
            onChange={(e) => setScanTime(e.target.value)}
          />
          </Content>
        </Row>

        {hasChanges && (
          <Row>
            <Label>Actions</Label>
            <Content>
              <Button onClick={handleApply}>Apply</Button>
            </Content>
          </Row>
        )}
      </SettingsGrid>
    </SettingsWrapper>
  );
};

export default Settings;
