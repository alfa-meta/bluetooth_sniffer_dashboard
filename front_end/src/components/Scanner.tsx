import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ScannerWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
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

interface ScanResponse {
  message: string;
  pid: number;
}

const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [responseData, setResponseData] = useState<ScanResponse | null>(null);
  const navigate = useNavigate();

  const toggleScanning = async () => {
    if (!scanning) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); // Redirect to login if token is missing
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5000/start_scanning", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data: ScanResponse = await res.json();
        setResponseData(data);
        setScanning(true);
      } catch (error) {
        console.error("Error starting scan:", error);
      }
    } else {
      // Optionally implement stop scanning functionality
      setScanning(false);
      setResponseData(null);
    }
  };

  return (
    <ScannerWrapper>
      <div>
        <ScanButton onClick={toggleScanning}>
          {scanning ? "Stop Scanning" : "Start Scanning"}
        </ScanButton>
        {responseData && (
          <div>
            <p>{responseData.message}</p>
            <p>Process ID: {responseData.pid}</p>
          </div>
        )}
      </div>
    </ScannerWrapper>
  );
};

export default Scanner;
