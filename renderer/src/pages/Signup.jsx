import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");
import Button from "../components/Button.jsx";
import "../styles/auth.css";
import "../styles/global.css";

function Signup({ goTo }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");

  useEffect(() => {
    document.body.classList.add("auth");
    return () => document.body.classList.remove("auth");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await ipcRenderer.invoke("create-user", { username, password });

    setMessage(result.message);
    setMessageColor(result.success ? "green" : "red");

    if (result.success) {
      // Instead of navigating with Electron, switch React page
      setTimeout(() => goTo("login"), 1000);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    goTo("login"); // <-- switch to login component
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="animated-form">
        <h1>Sign Up</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary">Sign Up</Button>

        {message && <p id="message" style={{ color: messageColor }}>{message}</p>}

        <p className="bottom-link">
          Already have an account?{" "}
          <a href="#" onClick={handleLoginClick}>Login</a>
        </p>
      </form>
    </div>
  );
}

export default Signup;
