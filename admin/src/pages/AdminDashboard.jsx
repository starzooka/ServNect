import "../admin.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-stats">
        <StatCard title="Total Users" value="3" />
        <StatCard title="Total Experts" value="2" />
        <StatCard title="Total Services" value="5" />
      </div>
    </div>
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
