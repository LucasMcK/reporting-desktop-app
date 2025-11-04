import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/reports.css";
const { ipcRenderer } = window.require("electron");

function Reports({ page, goTo }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke("get-reports").then((data) => {
      setReports(data || []);
    });
  }, []);

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Reports</h1>
        <p>View and manage all reports here.</p>

        <div className="reports-list">
          {reports.length === 0 ? (
            <p>No reports available.</p>
          ) : (
            <ul>
              {reports.map((report, index) => (
                <li key={index}>{report.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default Reports;
