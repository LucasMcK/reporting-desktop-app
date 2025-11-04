import React, { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";

function App() {
  const [page, setPage] = useState("login");

  const goTo = (newPage) => setPage(newPage);

  return (
    <>
      {page === "login" && <Login goTo={goTo} />}
      {page === "signup" && <Signup goTo={goTo} />}
      {page === "dashboard" && <Dashboard page={page} goTo={goTo}/>}
      {page === "reports" && <Reports page={page} goTo={goTo}/>}
      {page === "upload" && <Upload page={page} goTo={goTo}/>}
    </>
  );
}

export default App;
