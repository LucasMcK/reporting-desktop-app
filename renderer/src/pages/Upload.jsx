import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/upload.css";

function Upload({ page, goTo }) {
  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Upload</h1>
        <p>Upload files and manage your documents here.</p>

        <div className="upload-area">
          {/* Placeholder for future file upload UI */}
          <p>Drag & drop files here or click to browse.</p>
        </div>
      </div>
    </>
  );
}

export default Upload;
