// renderer/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import "../styles/dashboard.css";

function Dashboard({ goTo }) { // <-- add goTo prop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => document.body.classList.remove("dashboard");
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    goTo("login"); // <-- switch to login page in React
  };

  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />

      {/* Toggle button */}
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
      >
        <span className="hamburger">☰</span>
      </button>

      {/* Main content */}
      <div className="content">
        <h1>Welcome to the Dashboard</h1>
        <p>This is where you'll manage reports and access all application features.</p>
      </div>
    </>
  );
}

export default Dashboard;
