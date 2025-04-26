import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useWebSocket } from "../functions/WebSocketContext";
import { handleLogout } from "../functions/AuthFunctions";

interface StatusProps {
  connected: boolean;
}

const ScannerWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--background);
  padding-top: 20px;
  padding-left: 20px;
`;

const ScanButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
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

const Status = styled.p<StatusProps>`
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: ${({ connected }) => (connected ? "green" : "red")};
`;

const TerminalBox = styled.div`
  width: 80%;
  height: 100%;
  max-width: 1000px;
  max-height: 750px;
  margin-top: 20px;
  padding: 10px;
  background: black;
  color: limegreen;
  font-family: monospace;
  font-size: 14px;
  border-radius: 5px;
  overflow-y: auto;
  border: 2px solid #444;
  scrollbar-width: thin;
  scrollbar-color: #555 #222;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #222;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const Scanner: React.FC = () => {
  const { socket, connected, logMessages, scanning, setScanning, setLogMessages } = useWebSocket();
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        navigate("/");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          handleLogout();
          navigate("/");
        }
      } catch (error) {
        handleLogout();
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logMessages]);

  const toggleScanning = () => {
    if (!socket) return;

    if (!scanning) {
      const settings = {
        theme: localStorage.getItem("theme") || "",
        packets: localStorage.getItem("packets") || "100",
        scanTime: localStorage.getItem("scanTime") || "15",
        email: localStorage.getItem("email"),
      };
      socket.emit("websocket_start_scan", settings);
    } else {
      socket.emit("websocket_stop_scan");
      const timestamp = new Date().toLocaleString();
      setLogMessages((prev) => [...prev, `${timestamp} - Scanning stopped.`]);
      setScanning(false);
    }
  };

  const clearLogs = () => setLogMessages([]);

  return (
    <ScannerWrapper>
      <h2>Scanner</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <ScanButton onClick={toggleScanning} disabled={!connected}>
          {scanning ? "Stop Scanning" : "Start Scanning"}
        </ScanButton>
        <button
          onClick={clearLogs}
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Clear Terminal
        </button>
      </div>
      <Status connected={connected}>{connected ? "Connected" : "Disconnected"}</Status>
      <TerminalBox ref={terminalRef}>
        {logMessages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </TerminalBox>
    </ScannerWrapper>
  );
};

export default Scanner;
