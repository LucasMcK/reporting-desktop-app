import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/upload.css";
const { ipcRenderer } = window.require("electron");

function Upload({ page, goTo, username }) { // <-- receive username
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(""); // notification text
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);

    for (let file of files) {
      try {
        // Convert File to Node Buffer
        const arrayBuffer = await file.arrayBuffer();
        const data = Buffer.from(arrayBuffer);

        // Send to main process with uploadedBy
        const result = await ipcRenderer.invoke("upload-report", {
          name: file.name,
          data,
          uploadedBy: username, // <-- pass username
        });

        if (!result.success) {
          setMessageType("error");
          setMessage(`Failed to upload ${file.name}: ${result.message}`);
        } else {
          setMessageType("success");
          setMessage(`${file.name} uploaded successfully!`);
        }
      } catch (err) {
        console.error(err);
        setMessageType("error");
        setMessage(`Error uploading ${file.name}`);
      }
    }

    setUploading(false);

    // Hide message after 3 seconds
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Upload</h1>
        <p>Upload files and manage your documents here.</p>

        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>{uploading ? "Uploading..." : "Drag & drop files here"}</p>
          <p>or</p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="fileInput"
          />
          <label htmlFor="fileInput" className="browse-btn">
            Browse Files
          </label>
        </div>

        {/* Notification below upload area */}
        {message && (
          <div id="message" className={`${messageType} fade`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default Upload;
