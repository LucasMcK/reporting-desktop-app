import React from "react";
import dashboardIcon from "../assets/icons/dashboard.png";
import reportIcon from "../assets/icons/report.png";
import uploadIcon from "../assets/icons/upload.png";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/settings.png";
import logoutIcon from "../assets/icons/logout.png";
import Button from "../components/Button.jsx";
import "../styles/sidebar.css";

function Sidebar({ collapsed, onLogout }) {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <h2 className="logo">Reporting App</h2>
      <nav>
        <a href="#" className="active">
          <img className="icon" src={dashboardIcon} alt="Dashboard" />
          <span className="text">Dashboard</span>
        </a>
        <a href="#">
          <img className="icon" src={reportIcon} alt="Reports" />
          <span className="text">Reports</span>
        </a>
        <a href="#">
          <img className="icon" src={uploadIcon} alt="Upload" />
          <span className="text">Upload</span>
        </a>
        <a href="#">
          <img className="icon" src={userIcon} alt="Users" />
          <span className="text">Users</span>
        </a>
        <a href="#">
          <img className="icon" src={settingsIcon} alt="Settings" />
          <span className="text">Settings</span>
        </a>
        <Button onClick={onLogout} variant="secondary">
          <img className="icon" src={logoutIcon} alt="Logout" />
          <span className="text">Logout</span>
        </Button>
      </nav>
    </div>
  );
}

export default Sidebar;
