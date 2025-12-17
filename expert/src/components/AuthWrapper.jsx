import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function ExpertAuthWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const [expert, setExpert] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function checkExpertAuth() {
      try {
        const res = await fetch(`${BACKEND_URL}/experts/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setExpert(data);
        } else {
          setExpert(null);
        }
      } catch {
        setExpert(null);
      } finally {
        setLoading(false);
      }
    }

    checkExpertAuth();
  }, []);

  // ⏳ Loader
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication…
      </div>
    );
  }

  // 🔒 If not logged in → redirect to signin
  if (!expert) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ✅ Authenticated expert
  return children;
}
