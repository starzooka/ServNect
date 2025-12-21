import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">ServNect</div>

        <div className="admin-nav">
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={page === "users" ? "active" : ""}
            onClick={() => setPage("users")}
          >
            Users
          </button>

          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        {page === "dashboard" && <Dashboard />}
        {page === "users" && <Users />}
      </div>
    </div>
  );
}

/* ===== Dashboard ===== */
function Dashboard() {
  return (
    <>
      <h1>Admin Dashboard</h1>

      <div className="admin-stats">
        <StatCard title="Total Users" value="3" />
        <StatCard title="Total Experts" value="2" />
        <StatCard title="Total Services" value="5" />
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-title">{title}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

/* ===== Users Table ===== */
function Users() {
  const users = [
    { name: "Tisha Banerjee", email: "tisha124@gmail.com", role: "User" },
    { name: "Aman Thakur", email: "amar@gmail.com", role: "User" },
    { name: "Shubhradeep Lodh", email: "shubhradeep.alstarz@gmail.com", role: "User" },
  ];

  return (
    <>
      <h1>Registered Users</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td className="email">{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
