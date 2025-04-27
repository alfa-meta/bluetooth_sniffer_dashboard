import React, { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { handleLogout } from "./AuthFunctions";

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  logMessages: string[];
  scanning: boolean;
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
  setScanning: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  logMessages: [],
  scanning: false,
  setLogMessages: () => {},
  setScanning: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://127.0.0.1:5001", {
      transports: ["websocket"],
      query: { token },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("websocket_handle_connect");
      setConnected(true);
    });
    
    newSocket.on("disconnect", () =>{
      newSocket.emit("websocket_handle_disconnect");
      setConnected(false);
    })
    
    newSocket.on("websocket_handle_disconnect", () => setConnected(false));
    newSocket.on("token_expired", () => {
      handleLogout();
      window.location.href = "/";
    });

    newSocket.on("scan_update", (data) => {
      const timestamp = new Date().toLocaleString();
      setLogMessages(prev => [...prev, `${timestamp} - ${data.message}`]);
      setScanning(true);
    });

    newSocket.on("scan_stop", () => {
      setScanning(false);
    });

    newSocket.on("scan_error", (error) => {
      const timestamp = new Date().toLocaleString();
      setLogMessages(prev => [...prev, `${timestamp} - Error: ${error.message}`]);
      setScanning(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, connected, logMessages, scanning, setLogMessages, setScanning }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
