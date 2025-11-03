import React from "react";
import "../styles/button.css";

function Button({ children, onClick, type = "button", variant = "primary", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`app-button ${variant}-btn ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
