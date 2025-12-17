import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ Reusable Spinner Overlay Component (unchanged)
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
      try {
        const res = await fetch(`${BACKEND_URL}/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data || null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setAuthLoading]);

  // ✅ Block app render while checking session
  if (loading) {
    return <SpinnerOverlay />;
  }

  return children;
}
