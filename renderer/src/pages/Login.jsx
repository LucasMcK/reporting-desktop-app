import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");
import "../styles/auth.css";
import "../styles/global.css";


function Login({ goTo }) {
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
    const result = await ipcRenderer.invoke("login", { username, password });

    setMessage(result.message);
    setMessageColor(result.success ? "green" : "red");

    if (result.success) {
      // Instead of loading dashboard.html, switch React page
      goTo("dashboard");
    }
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    goTo("signup"); // <-- switch to signup component
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="animated-form">
        <h1>Login</h1>

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

        <button type="submit">Login</button>

        {message && <p id="message" style={{ color: messageColor }}>{message}</p>}

        <p className="bottom-link">
          Don't have an account?{" "}
          <a href="#" onClick={handleSignupClick}>Sign up</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
