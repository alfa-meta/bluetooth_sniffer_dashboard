import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";
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

const LOG_MESSAGES_STORAGE_KEY = "scanner_log_messages";
const SCANNING_STATUS_STORAGE_KEY = "scanner_scanning_status";

const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(() => {
    const savedScanningStatus = localStorage.getItem(SCANNING_STATUS_STORAGE_KEY);
    return savedScanningStatus ? JSON.parse(savedScanningStatus) : false;
  });
  
  const [logMessages, setLogMessages] = useState<string[]>(() => {
    const savedLogMessages = localStorage.getItem(LOG_MESSAGES_STORAGE_KEY);
    return savedLogMessages ? JSON.parse(savedLogMessages) : [];
  });
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Helper function to add a timestamp to each log message
  const addLogMessage = (msg: string) => {
    const timestamp = new Date().toLocaleString();
    setLogMessages((prev) => [...prev, `${timestamp} - ${msg}`]);
  };

  // Save logMessages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOG_MESSAGES_STORAGE_KEY, JSON.stringify(logMessages));
  }, [logMessages]);

  // Save scanning status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SCANNING_STATUS_STORAGE_KEY, JSON.stringify(scanning));
  }, [scanning]);

  // Set up mutation observer for DOM changes (auto-scroll)
  useEffect(() => {
    if (terminalRef.current) {
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

  // Ensure terminal scrolls to the bottom when log messages change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logMessages]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
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
        if (!response.ok) {
          console.error("Error fetching user data:", data.message);
          handleLogout();
          navigate("/");
        }
      } catch (error) {
        console.error("Error:", error);
        handleLogout();
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
      handleLogout();
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
      addLogMessage("WebSocket Connected!");
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket Disconnected!");
      setConnected(false);
      setScanning(false);
      addLogMessage("WebSocket Disconnected!");
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket Connection Error:", error);
      setConnected(false);
      addLogMessage(`Connection Error: ${error.message}`);
    });

    newSocket.on("scan_update", (data: ScanResponse) => {
      addLogMessage(data.message);
      setScanning(true);
    });

    newSocket.on("scan_stop", (data: ScanResponse) => {
      setScanning(false);
    });

    newSocket.on("scan_error", (error) => {
      addLogMessage(`Error: ${error.message}`);
      setScanning(false);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.emit("websocket_handle_disconnect", { reason: "User initiated disconnect" });
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      addLogMessage("WebSocket Disconnected.");
    }
  };

  const toggleScanning = () => {
    if (!socket) return;
  
    if (!scanning) {
      const settings = {
        theme: localStorage.getItem("theme") || "",
        packets: localStorage.getItem("packets") || "100",
        scanTime: localStorage.getItem("scanTime") || "15",
        email: localStorage.getItem("email")
      };
  
      socket.emit("websocket_start_scan", settings);
    } else {
      socket.emit("websocket_stop_scan");
      addLogMessage("Scanning stopped.");
    }
    setScanning(!scanning);
  };
  

  const clearLogs = () => {
    setLogMessages([]);
  };

  return (
    <ScannerWrapper>
      <h2>Scanner</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <ConnectButton onClick={connected ? disconnectSocket : connectSocket} connected={connected}>
          {connected ? "Disconnect" : "Connect"}
        </ConnectButton>
        
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
            cursor: "pointer"
          }}
        >
          Clear Terminal
        </button>
      </div>
      <Status connected={connected}>{connected ? "Connected" : "Disconnected"}</Status>
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
