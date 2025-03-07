import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const DevicesWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  background: var(--button-bg);
  color: var(--text-light);
  border: none;
  padding: 15px;
  padding-left: 25px;
  padding-right: 25px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--red);
  }
`;

const Table = styled.table`
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
  background: var(--bg-light);
  color: var(--text-dark);
`;

const Th = styled.th`
  padding: 10px;
  border-bottom: 2px solid var(--border-color);
  text-align: left;
  background: var(--table-header);
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<
    { mac_address: string; device_name: string; last_seen: string; email: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDevices = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    try {
      const response = await axios.get("http://127.0.0.1:5000/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(response.data);
    } catch (err) {
      setError("Failed to fetch device data");
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <DevicesWrapper>
      <h2>Device List</h2>
      <ButtonContainer>
        <Button>Add New Device</Button>
      </ButtonContainer>
      {error ? (
        <p>{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>MAC Address</Th>
              <Th>Device Name</Th>
              <Th>Last Seen</Th>
              <Th>User Email</Th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.mac_address}>
                <Td>{device.mac_address}</Td>
                <Td>{device.device_name}</Td>
                <Td>{device.last_seen}</Td>
                <Td>{device.email}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DevicesWrapper>
  );
};

export default Devices;
