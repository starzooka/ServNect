import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

// ✅ FIX 1: Add Fallback URL (Critical for preventing undefined URL errors)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

const SpinnerOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="relative w-12 h-12">
      <div className="absolute w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

export default function AuthWrapper({ children }) {
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("user_token");

      if (!token) {
        setUser(null);
        setAuthLoading(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Token invalid");
        }

        const data = await res.json();
        setUser(data || null);

      } catch (err) {
        console.error("Auth check failed:", err);
        // ✅ FIX 2: Clear token on error to prevent inconsistent state
        localStorage.removeItem("user_token");
        setUser(null);
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setAuthLoading]);

  if (loading) {
    return <SpinnerOverlay />;
  }

  return children;
}