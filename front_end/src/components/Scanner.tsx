import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";

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

const ConnectButton = styled.button<StatusProps>`
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  background: ${({ connected }) => (connected ? "red" : "var(--button-bg)")};
  color: var(--text-light);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${({ connected }) => (connected ? "#cc0000" : "var(--highlight)")};
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
  max-width: 800px;
  height: 650px;
  margin-top: 20px;
  padding: 10px;
  background: black;
  color: limegreen;
  font-family: monospace;
  font-size: 14px;
  border-radius: 5px;
  overflow-y: auto;
  border: 2px solid #444;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #555 #222;

  /* Webkit browsers */
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
  const terminalRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Set up mutation observer for DOM changes
  useEffect(() => {
    if (terminalRef.current) {
      // Force scroll to bottom on any content change
      observerRef.current = new MutationObserver(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
      
      observerRef.current.observe(terminalRef.current, {
        childList: true,
        subtree: true
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Alternative approach using direct manipulation when log messages change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logMessages]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token");
        navigate("/"); // Redirect if token is missing
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
    if (socket) return; // Already connected

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      console.error("Missing auth token, unable to connect WebSocket");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    const newSocket = io("http://127.0.0.1:5001", {
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
      setLogMessages((prev) => {
        const newMessages = [...prev, data.message];
        // Force scroll after state update completes
        requestAnimationFrame(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        });
        return newMessages;
      });
      setScanning(true);
    });

    newSocket.on("scan_error", (error) => {
      setLogMessages((prev) => {
        const newMessages = [...prev, `Error: ${error.message}`];
        // Force scroll after state update completes
        requestAnimationFrame(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        });
        return newMessages;
      });
      setScanning(false);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      // Send a custom disconnect request to the server
      socket.emit("websocket_handle_disconnect", { reason: "User initiated disconnect" });
      
      // Then disconnect
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setLogMessages((prev) => [...prev, "WebSocket Disconnected."]);
    }
  };

  const toggleScanning = () => {
    if (!socket) return;

    if (!scanning) {
      socket.emit("websocket_start_scan");
      setLogMessages((prev) => [...prev, "Scanning started..."]);
    } else {
      socket.emit("websocket_stop_scan");
      setLogMessages((prev) => [...prev, "Scanning stopped."]);
    }
    setScanning(!scanning);
  };

  return (
    <ScannerWrapper>
      <h2>Scanner</h2>
      <ConnectButton onClick={connected ? disconnectSocket : connectSocket} connected={connected}>
        {connected ? "Disconnect" : "Connect"}
      </ConnectButton>
      <Status connected={connected}>{connected ? "Connected" : "Disconnected"}</Status>
      <ScanButton onClick={toggleScanning} disabled={!connected}>
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </ScanButton>
      <TerminalBox ref={terminalRef}>
        <div>
          {logMessages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      </TerminalBox>
    </ScannerWrapper>
  );
};

export default Scanner;