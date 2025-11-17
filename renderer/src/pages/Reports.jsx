import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Filter from "../components/Filter";
import downloadIcon from "../assets/icons/download.png";
import deleteIcon from "../assets/icons/delete.png";
import "../styles/reports.css";

function Reports({ page, goTo }) {
  const [reports, setReports] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({
    id: "",
    filename: "",
    worksheet: "",
    uploadedBy: "",
    uploadedAt: "",
  });

  const updateFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const sortedReports = React.useMemo(() => {
    if (!sortConfig.key) return reports; // default order

    const sorted = [...reports].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [reports, sortConfig]);

  const filteredReports = React.useMemo(() => {
    return sortedReports.filter(report => {
      return (
        (filters.id === "" || String(report.id).includes(filters.id)) &&
        (filters.filename === "" || report.name.toLowerCase().includes(filters.filename.toLowerCase())) &&
        (filters.worksheet === "" || report.worksheet?.toLowerCase().includes(filters.worksheet.toLowerCase())) &&
        (filters.uploadedBy === "" || report.uploaded_by.toLowerCase().includes(filters.uploadedBy.toLowerCase())) &&
        (filters.uploadedAt === "" || report.uploaded_at.includes(filters.uploadedAt))
      );
    });
  }, [sortedReports, filters]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "desc" };
      if (prev.direction === "desc") return { key, direction: "asc" };
      return { key: null, direction: null }; // default
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
                <th onClick={() => handleSort("id")}>
                  ID <span className={`sort-arrow ${sortConfig.key === "id" ? sortConfig.direction : ""}`}>↑</span>
                </th>
                <th onClick={() => handleSort("name")}>
                  Filename <span className={`sort-arrow ${sortConfig.key === "name" ? sortConfig.direction : ""}`}>↑</span>
                </th>
                <th onClick={() => handleSort("uploaded_by")}>
                  Uploaded By <span className={`sort-arrow ${sortConfig.key === "uploaded_by" ? sortConfig.direction : ""}`}>↑</span>
                </th>
                <th onClick={() => handleSort("uploaded_at")}>
                  Uploaded At <span className={`sort-arrow ${sortConfig.key === "uploaded_at" ? sortConfig.direction : ""}`}>↑</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
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
      <Filter filters={filters} updateFilter={updateFilter} />
    </>
  );
}

export default Reports;
