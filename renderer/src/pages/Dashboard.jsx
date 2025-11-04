// import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import "../styles/dashboard.css";

function Dashboard({page, goTo}) {
  return (
    <>
      <Sidebar page={page} goTo={goTo}/>

      {/* Main content */}
      <div className="content">
        <h1>Welcome to the Dashboard</h1>
        <p>This is where you'll manage reports and access all application features.</p>
      </div>
    </>
  );
}

export default Dashboard;
