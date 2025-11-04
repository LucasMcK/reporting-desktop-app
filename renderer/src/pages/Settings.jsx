import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/settings.css";

function Settings({ page, goTo }) {
  useEffect(() => {
    document.body.classList.add("settings");
    return () => document.body.classList.remove("settings");
  }, []);

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Settings</h1>
        <p>Adjust your application settings here.</p>

        <div className="settings-section">
          {/* Add form fields or toggle settings here */}
          <p>Placeholder for settings controls.</p>
        </div>
      </div>
    </>
  );
}

export default Settings;
