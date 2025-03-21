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
  height: 100%;
  max-width: 800px;
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

// Constants for localStorage keys
const LOG_MESSAGES_STORAGE_KEY = 'scanner_log_messages';
const SCANNING_STATUS_STORAGE_KEY = 'scanner_scanning_status';

const Scanner: React.FC = () => {
  // Initialize state with values from localStorage if they exist
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

  // Save logMessages to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOG_MESSAGES_STORAGE_KEY, JSON.stringify(logMessages));
  }, [logMessages]);

  // Save scanning status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SCANNING_STATUS_STORAGE_KEY, JSON.stringify(scanning));
  }, [scanning]);

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
      setLogMessages((prev) => [...prev, "WebSocket Connected!"]);
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket Disconnected!");
      setConnected(false);
      setScanning(false);
      setLogMessages((prev) => [...prev, "WebSocket Disconnected!"]);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket Connection Error:", error);
      setConnected(false);
      setLogMessages((prev) => [...prev, `Connection Error: ${error.message}`]);
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

    newSocket.on("scan_stop", (data: ScanResponse) => {
      setScanning(false);
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

  // Add function to clear the logs if needed
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
          Clear Logs
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