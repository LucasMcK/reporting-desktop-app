import React, { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("login"); // login, signup, dashboard

  const goTo = (newPage) => setPage(newPage);

  return (
    <>
      {page === "login" && <Login goTo={goTo} />}
      {page === "signup" && <Signup goTo={goTo} />}
      {page === "dashboard" && <Dashboard goTo={goTo} />}
    </>
  );
}

export default App;
