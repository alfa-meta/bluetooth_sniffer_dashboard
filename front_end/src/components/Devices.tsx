import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import AddNewDevice from "./AddNewDevice";

// Define the type for devices
interface Device {
  mac_address: string;
  device_name: string;
  last_seen: string;
  email: string;
}

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
  padding: 15px 25px;
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
  border: 2px solid var(--border-color);
`;

const Th = styled.th`
  padding: 10px;
  border-bottom: 2px solid var(--border-color);
  border-right: 2px solid var(--border-color);
  text-align: left;
  background: var(--table-header);
  cursor: pointer;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  border-right: 2px solid var(--border-color);
`;

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Device;
    direction: "asc" | "desc";
  } | null>(null);
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
      const response = await axios.get<Device[]>(
        "http://127.0.0.1:5000/devices",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDevices(response.data);
    } catch (err) {
      console.error("Failed to fetch device data", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const sortDevices = (key: keyof Device) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedDevices = [...devices].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setDevices(sortedDevices);
  };

  const getSortIndicator = (key: keyof Device) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  return isAdding ? (
    <AddNewDevice setIsAdding={setIsAdding} fetchDevices={fetchDevices} />
  ) : (
    <DevicesWrapper>
      <h2>Device List</h2>
      <ButtonContainer>
        <Button onClick={() => setIsAdding(true)}>Add New Device</Button>
      </ButtonContainer>
      {error ? (
        <p>{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th onClick={() => sortDevices("mac_address")}>
                MAC Address{getSortIndicator("mac_address")}
              </Th>
              <Th onClick={() => sortDevices("device_name")}>
                Device Name{getSortIndicator("device_name")}
              </Th>
              <Th onClick={() => sortDevices("last_seen")}>
                Last Seen{getSortIndicator("last_seen")}
              </Th>
              <Th onClick={() => sortDevices("email")}>
                User Email{getSortIndicator("email")}
              </Th>
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
