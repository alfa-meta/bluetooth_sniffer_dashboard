import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import AddNewDevice from "./AddNewDevice";

interface Device {
  mac_address: string;
  device_name: string;
  device_vendor: string;
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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 50%;
  margin-bottom: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-light);
  padding: 5px 10px;
`;

const SearchIcon = styled(FaSearch)`
  color: var(--text-dark);
  margin-right: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-dark);
  font-size: 16px;
  outline: none;
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

const DeleteButton = styled.button`
  padding: 5px 10px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background: darkred;
  }
  &:disabled {
    background: grey;
    cursor: not-allowed;
  }
`;

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
    mode?: "alpha" | "numeric";
  }>({ key: null, direction: "asc" });
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
      const response = await axios.get<Device[]>("http://127.0.0.1:5000/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleDelete = async (mac_address: string, device_name: string) => {
    const confirmDelete = await window.confirm(`Are you sure you want to delete ${device_name}?`);
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:5000/delete_device/${mac_address}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devices.filter((device) => device.mac_address !== mac_address));
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log("Session expired. Please log in again.");
      } else {
        setError("Failed to delete device");
      }
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key: string) => {
    if (key === "mac_address") {
      if (sortConfig.key !== "mac_address") {
        setSortConfig({ key: "mac_address", direction: "asc", mode: "alpha" });
      } else {
        if (sortConfig.mode === "alpha" && sortConfig.direction === "asc") {
          setSortConfig({ key: "mac_address", direction: "desc", mode: "alpha" });
        } else if (sortConfig.mode === "alpha" && sortConfig.direction === "desc") {
          setSortConfig({ key: "mac_address", direction: "asc", mode: "numeric" });
        } else if (sortConfig.mode === "numeric" && sortConfig.direction === "asc") {
          setSortConfig({ key: "mac_address", direction: "desc", mode: "numeric" });
        } else {
          setSortConfig({ key: "mac_address", direction: "asc", mode: "alpha" });
        }
      }
    } else {
      if (sortConfig.key === key) {
        const newDirection = sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction: newDirection });
      } else {
        setSortConfig({ key, direction: "asc" });
      }
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.device_vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const sortedDevices = [...filteredDevices];
  if (sortConfig.key) {
    sortedDevices.sort((a, b) => {
      if (sortConfig.key === "mac_address") {
        if (sortConfig.mode === "alpha") {
          const res = a.mac_address.localeCompare(b.mac_address);
          return sortConfig.direction === "asc" ? res : -res;
        } else {
          const numA = parseInt(a.mac_address.replace(/:/g, ""), 16);
          const numB = parseInt(b.mac_address.replace(/:/g, ""), 16);
          const res = numA - numB;
          return sortConfig.direction === "asc" ? res : -res;
        }
      }
      if (sortConfig.key && ["device_name", "email", "device_vendor"].includes(sortConfig.key)) {
        const res = a[sortConfig.key as keyof Device].localeCompare(b[sortConfig.key as keyof Device]);
        return sortConfig.direction === "asc" ? res : -res;
      }
      if (sortConfig.key === "last_seen") {
        const res = parseInt(a.last_seen) - parseInt(b.last_seen);
        return sortConfig.direction === "asc" ? res : -res;
      }
      return 0;
    });
  }

  return isAdding ? (
    <AddNewDevice setIsAdding={setIsAdding} fetchDevices={fetchDevices} />
  ) : (
    <DevicesWrapper>
      <h2>Device List</h2>
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search Devices"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      <ButtonContainer>
        <Button onClick={() => setIsAdding(true)}>Add New Device</Button>
      </ButtonContainer>
      {error ? (
        <p>{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th onClick={() => handleSort("mac_address")}>MAC Address</Th>
              <Th onClick={() => handleSort("device_vendor")}>Device Vendor</Th>
              <Th onClick={() => handleSort("device_name")}>Device Name</Th>
              <Th onClick={() => handleSort("last_seen")}>Last Seen</Th>
              <Th onClick={() => handleSort("email")}>User Email</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device) => (
              <tr key={device.mac_address}>
                <Td>{device.mac_address}</Td>
                <Td>{device.device_vendor}</Td>
                <Td>{device.device_name}</Td>
                <Td>{new Date(parseInt(device.last_seen) * 1000).toLocaleString()}</Td>
                <Td>{device.email}</Td>
                <Td>
                  <DeleteButton
                    disabled={isDeleting}
                    onClick={() => handleDelete(device.mac_address, device.device_name)}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DevicesWrapper>
  );
};

export default Devices;
