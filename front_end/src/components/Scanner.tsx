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
  justify-content: center;
  background: var(--background);
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/"); // Redirect to login if no token
      return;
    }

    const newSocket = io("http://127.0.0.1:5000", {
      query: { token },
      transports: ["websocket"],
    });

    newSocket.on("scan_update", (data: ScanResponse) => {
      setLogMessages((prev) => [...prev, data.message]); // Append new message
      setScanning(true);
    });

    newSocket.on("scan_error", (error: { message: string }) => {
      setLogMessages((prev) => [...prev, `Error: ${error.message}`]);
      setScanning(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("handle_disconnect");
      newSocket.disconnect();
    };
  }, [navigate, token]);

  const toggleScanning = () => {
    if (!socket) return;

    if (!scanning) {
      setLogMessages([]); // Clear log before new scan
      socket.emit("start_scan");
    } else {
      socket.emit("handle_disconnect");
      setScanning(false);
      setLogMessages((prev) => [...prev, "Scan stopped."]);
    }
  };

  return (
    <ScannerWrapper>
      <ScanButton onClick={toggleScanning}>
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
