import React, { useState, useEffect } from "react";
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
        if (!response.ok) {
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

  const connectSocket = () => {
    if (socket) return;

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      console.error("Missing auth token, unable to connect WebSocket");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    const newSocket = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      query: { token: storedToken },
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