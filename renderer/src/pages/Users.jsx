import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/users.css";

function Users({ page, goTo }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    window.versions.getUsers().then((data) => setUsers(data || []));
  }, []);

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Users</h1>
        <p>View and manage all registered users here.</p>

        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="2">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Users;
