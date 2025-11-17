import React, { useState } from "react";
import idIcon from "../assets/icons/id.png";
import filenameIcon from "../assets/icons/filename.png";
import worksheetIcon from "../assets/icons/worksheet.png";
import uploadedByIcon from "../assets/icons/uploaded_by.png";
import calendarIcon from "../assets/icons/calendar.png";
import filterIcon from "../assets/icons/filter.png";
import "../styles/filter.css";

function Filter({ filters, updateFilter }) {
  const [filterCollapsed, setFilterCollapsed] = useState(true);

  const toggleFilter = () => setFilterCollapsed(prev => !prev);

  return (
    <>
      <div className={`filter ${filterCollapsed ? "collapsed" : ""}`}>
        <h3 className="logo">Filter by</h3>

        {/* ID */}
        <div className="filter-input">
          <div className="icon-label">
            <img className="icon" src={idIcon} alt="ID" />
            <span>ID</span>
          </div>
          <input
            type="text"
            placeholder="ID"
            value={filters.id}
            onChange={(e) => updateFilter("id", e.target.value)}
          />
        </div>

        {/* Filename */}
        <div className="filter-input">
          <div className="icon-label">
            <img className="icon" src={filenameIcon} alt="Filename" />
            <span>Filename</span>
          </div>
          <input
            type="text"
            placeholder="Filename"
            value={filters.filename}
            onChange={(e) => updateFilter("filename", e.target.value)}
          />
        </div>

        {/* Worksheet */}
        <div className="filter-input">
          <div className="icon-label">
            <img className="icon" src={worksheetIcon} alt="Worksheet" />
            <span>Worksheet Name</span>
          </div>
          <input
            type="text"
            placeholder="Worksheet"
            value={filters.worksheet}
            onChange={(e) => updateFilter("worksheet", e.target.value)}
          />
        </div>

        {/* Uploaded By */}
        <div className="filter-input">
          <div className="icon-label">
            <img className="icon" src={uploadedByIcon} alt="Uploaded By" />
            <span>Uploaded By</span>
          </div>
          <input
            type="text"
            placeholder="Uploaded by"
            value={filters.uploadedBy}
            onChange={(e) => updateFilter("uploadedBy", e.target.value)}
          />
        </div>

        {/* Uploaded At */}
        <div className="filter-input">
          <div className="icon-label">
            <img className="icon" src={calendarIcon} alt="Uploaded At" />
            <span>Uploaded At</span>
          </div>
          <input
            type="text"
            placeholder="Uploaded at"
            value={filters.uploadedAt}
            onChange={(e) => updateFilter("uploadedAt", e.target.value)}
          />
        </div>
      </div>

      <button className="filter-toggle" onClick={toggleFilter}>
        <span>Add Filters</span>
        <img className="icon-btn" src={filterIcon} alt="Filters" />
      </button>
    </>
  );
}

export default Filter;
