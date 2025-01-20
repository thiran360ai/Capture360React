import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(
        "http://59.97.51.97:8081/building/login/",
        {
          username,
          password,
        },
        {
          headers: {
            Accept: "application/json",
            
          },
        }
      );
      console.log("API Response:", response.data); // Log the entire response data for debugging
      if (response.data && response.data.Success === "login successfully") {
        setSuccess("Login successful!");
        onLoginSuccess();
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (error) {
      setError("Failed to connect to the server. Please try again later."); // Generic error message for network issues
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login Page</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User Name"
              required
            />
          </label>
          <label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
