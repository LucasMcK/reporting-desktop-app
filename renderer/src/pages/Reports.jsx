import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import downloadIcon from "../assets/icons/download.png";
import deleteIcon from "../assets/icons/delete.png";
import "../styles/reports.css";

function Reports({ page, goTo }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);


  // Fetch reports
  const fetchReports = async () => {
    if (!window.versions?.getReports) {
      console.error("getReports is undefined!");
      return;
    }
    const data = await window.versions.getReports();
    setReports(data || []);
  };

  // Download report
  const handleDownload = async (id, name) => {
    if (!window.versions?.downloadReport) return console.error("downloadReport is undefined!");
    const result = await window.versions.downloadReport(id, name);
    if (result.success) alert(`Downloaded: ${name}`);
    else alert(`Download failed: ${result.message}`);
  };

  // Delete report
  const handleDelete = async (id) => {
    if (!window.versions?.deleteReport) return console.error("deleteReport is undefined!");
    const confirmed = window.confirm("Are you sure you want to delete this report?");
    if (!confirmed) return;
    const result = await window.versions.deleteReport(id);
    if (result.success) fetchReports();
    else alert(`Delete failed: ${result.message}`);
  };

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Reports</h1>
        <p>View and manage all reports here.</p>

        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Filename</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.name}</td>
                  <td>{report.uploaded_by}</td>
                  <td>{report.uploaded_at}</td>
                  <td>
                    <div className="report-actions">
                      <button onClick={() => handleDownload(report.id, report.name)}>
                        <img src={downloadIcon} alt="Download" className="icon-btn" />
                      </button>

                      <button onClick={() => handleDelete(report.id)}>
                        <img src={deleteIcon} alt="Delete" className="icon-btn" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Reports;
