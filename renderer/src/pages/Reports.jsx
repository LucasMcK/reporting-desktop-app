import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/reports.css";
const { ipcRenderer } = window.require("electron");

function Reports({ page, goTo }) {
  const [reports, setReports] = useState([]);

  // Fetch reports from DB
  const fetchReports = async () => {
    const data = await ipcRenderer.invoke("get-reports");
    setReports(data || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Download report
  const handleDownload = async (id, name) => {
    const result = await ipcRenderer.invoke("download-report", { id, name });
    if (result.success) alert(`Downloaded: ${name}`);
    else alert(`Download failed: ${result.message}`);
  };

  // Delete report
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this report?");
    if (!confirmed) return;

    const result = await ipcRenderer.invoke("delete-report", id);
    if (result.success) fetchReports(); // refresh list
    else alert(`Delete failed: ${result.message}`);
  };

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
              {reports.map((report) => (
                <li key={report.id}>
                  {report.name}
                  <button onClick={() => handleDownload(report.id, report.name)}>Download</button>
                  <button onClick={() => handleDelete(report.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default Reports;
