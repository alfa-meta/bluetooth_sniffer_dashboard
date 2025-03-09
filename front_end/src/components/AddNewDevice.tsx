import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface AddNewDeviceProps {
  setIsAdding: (value: boolean) => void;
  fetchDevices: () => void;
}

const AddNewDevice: React.FC<AddNewDeviceProps> = ({
  setIsAdding,
  fetchDevices,
}) => {
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

export default AddNewDevice;
