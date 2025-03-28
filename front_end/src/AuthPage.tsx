import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import "./styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && window.location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Processing...");

    const salt = "$2a$10$abcdefghijklmnopqrstuv";
    const hashedPassword = bcrypt.hashSync(formData.password, salt);

    const endpoint = isLogin
      ? "http://127.0.0.1:5000/login"
      : "http://127.0.0.1:5000/register";
    const payload = isLogin
      ? { email: formData.email, password: hashedPassword }
      : {
          username: formData.name,
          email: formData.email,
          password: hashedPassword,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Success! Redirecting...");
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("email", data.email);
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("Request failed. Please try again.");
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img
          src="/ble_deanonymiser_icon.png"
          alt="App Icon"
          className="auth-icon"
        />
        <h2 className="auth-title">{isLogin ? "Login" : "Register"}</h2>
        {message && <p className="auth-message">{message}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="auth-input"
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="auth-toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            className="auth-toggle-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
