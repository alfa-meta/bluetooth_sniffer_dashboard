import React, { useState } from "react";
import styled from "styled-components";
import "./styles/globals.css"; // Ensure correct relative path

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

const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);

  const toggleScanning = () => {
    setScanning((prev) => !prev);
  };

  return (
    <ScannerWrapper>
      <ScanButton onClick={toggleScanning}>
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </ScanButton>
    </ScannerWrapper>
  );
};

export default Scanner;
