import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@servnect.com" && password === "admin123") {
      navigate("/dashboard");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-glass">
        <h1 className="admin-title">Admin Login</h1>
        <p className="admin-subtitle">
          ServNect Administration Panel
        </p>

        <form onSubmit={handleLogin}>
          <div className="admin-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@servnect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="admin-btn">Login</button>
        </form>

        <div className="admin-footer">
          © 2025 ServNect Admin
        </div>
      </div>
    </div>
  );
}
