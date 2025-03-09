import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

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
  text-align: left;
  background: var(--table-header);
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
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

const AddNewDevice: React.FC<{
  setIsAdding: (value: boolean) => void;
  fetchDevices: () => void;
}> = ({ setIsAdding, fetchDevices }) => {
  const [formData, setFormData] = useState({
    mac_address: "",
    device_name: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Adding device...");

    try {
      await axios.post(
        "http://127.0.0.1:5000/add_device",
        { ...formData, last_seen: Math.floor(Date.now() / 1000).toString() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Device added successfully!");
      fetchDevices();
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      console.error("Failed to add device", error);
      localStorage.removeItem("token");
      navigate("/");
      setMessage("Failed to add device. Please try again.");
    }
  };

  return (
    <div className="device-container">
      <h2 className="device-title">Add New Device</h2>
      {message && <p className="device-message">{message}</p>}
      <form className="device-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="mac_address"
          placeholder="MAC Address"
          value={formData.mac_address}
          onChange={handleChange}
          className="device-input"
          required
        />
        <input
          type="text"
          name="device_name"
          placeholder="Device Name"
          value={formData.device_name}
          onChange={handleChange}
          className="device-input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="device-input"
          required
        />
        <div className="device-button-container">
          <button type="submit" className="device-button">
            Submit
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="device-button cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Devices;
