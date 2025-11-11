import React, { useState, useEffect } from "react";
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

    if (!window.versions?.createUser) {
      console.error("createUser is undefined!");
      return;
    }

    const result = await window.versions.createUser(username, password);
    if (result.success) {
      goTo("login");
    } else {
      alert(result.message);
    }
  };


  const handleLoginClick = (e) => {
    e.preventDefault();
    goTo("login");
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
