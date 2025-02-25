import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // 🔹 Redirect to login if the user is NOT authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    navigate("/"); // Redirect to login
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Dashboard!</h1>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
