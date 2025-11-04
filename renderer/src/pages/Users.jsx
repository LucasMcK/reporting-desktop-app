import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/users.css";

function Users({ page, goTo }) {
  const [users, setUsers] = useState([]);

  // Placeholder: Load users (replace with IPC or API call)
  useEffect(() => {
    const dummyUsers = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
      { id: 3, name: "Alice Brown", email: "alice@example.com", role: "User" },
    ];
    setUsers(dummyUsers);
  }, []);

  useEffect(() => {
    document.body.classList.add("users");
    return () => document.body.classList.remove("users");
  }, []);

  return (
    <>
      <Sidebar page={page} goTo={goTo} />
      <div className="content">
        <h1>Users</h1>
        <p>View and manage all users in the system.</p>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4">No users available.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Users;
