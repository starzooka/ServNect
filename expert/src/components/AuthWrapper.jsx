import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";
import { expertAtom } from "../atoms";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function ExpertAuthWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const setExpert = useSetAtom(expertAtom);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkExpertAuth() {
      // ✅ 1. Get Token from LocalStorage
      const token = localStorage.getItem("expert_token");

      // If no token, stop immediately and redirect
      if (!token) {
        setExpert(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/experts/me`, {
          // ✅ 2. Attach Token to Headers manually
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setExpert(data); // Update Global State
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired -> Clear it
          localStorage.removeItem("expert_token");
          setExpert(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setExpert(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkExpertAuth();
  }, [setExpert]);

  // ⏳ Loader while checking token
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  // 🔒 Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }

  // ✅ Render the protected page
  return children;
}