import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";

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

const ConnectButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
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

interface StatusProps {
  connected: boolean;
}

const Status = styled.p<StatusProps>`
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: ${({ connected }) => (connected ? "green" : "red")};
`;

const TerminalBox = styled.div`
  width: 80%;
  max-width: 600px;
  height: 300px;
  margin-top: 20px;
  padding: 10px;
  background: black;
  color: limegreen;
  font-family: monospace;
  font-size: 14px;
  border-radius: 5px;
  overflow-y: auto;
  border: 2px solid #444;
`;

interface ScanResponse {
  message: string;
  pid?: number;
}

const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const connectSocket = () => {
    if (socket) return;

    const newSocket = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      query: { token },
    });

    newSocket.on("connect", () => {
      console.log("WebSocket Connected!");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket Disconnected!");
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket Connection Error:", error);
      setConnected(false);
    });

    newSocket.on("scan_update", (data: ScanResponse) => {
      setLogMessages((prev) => [...prev, data.message]);
      setScanning(true);
    });

    newSocket.on("scan_error", (error) => {
      setLogMessages((prev) => [...prev, `Error: ${error.message}`]);
      setScanning(false);
    });

    setSocket(newSocket);
  };

  const toggleScanning = () => {
    if (!socket) return;

    if (!scanning) {
      setLogMessages([]);
      socket.emit("websocket_start_scan");
    } else {
      socket.emit("websocket_handle_disconnect");
      setScanning(false);
      setLogMessages((prev) => [...prev, "Scan stopped."]);
    }
  };

  return (
    <ScannerWrapper>
      <h2>Scanner</h2>
      <ConnectButton onClick={connectSocket} disabled={connected}>
        {connected ? "Connected" : "Connect"}
      </ConnectButton>
      <Status connected={connected}>{connected ? "Connected" : "Disconnected"}</Status>
      <ScanButton onClick={toggleScanning} disabled={!connected}>
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </ScanButton>
      <TerminalBox>
        {logMessages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </TerminalBox>
    </ScannerWrapper>
  );
};

export default Scanner;