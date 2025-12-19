import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";
import { expertAtom } from "../atoms.js";

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

      if (!token) {
        setExpert(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/experts/me`, {
          // ✅ 2. Attach Token to Headers
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setExpert(data);
          setIsAuthenticated(true);
        } else {
          // Token invalid/expired
          localStorage.removeItem("expert_token");
          setExpert(null);
          setIsAuthenticated(false);
        }
      } catch {
        setExpert(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkExpertAuth();
  }, [setExpert]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}