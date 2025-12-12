import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

// Spinner overlay (unchanged)
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
    let isMounted = true;
    const ac = new AbortController();

    async function checkAuth() {
      setAuthLoading(true);

      const url = `${BACKEND_URL.replace(/\/$/, "")}/users/me/current`;
      console.debug("[AuthWrapper] checking auth at:", url);

      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: ac.signal,
        });

        if (!res.ok) {
          // Not authenticated — clear user
          if (isMounted) setUser(null);
          console.warn(`[AuthWrapper] auth check returned status ${res.status}`);
        } else {
          const data = await res.json();
          if (isMounted) setUser(data || null);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.info("[AuthWrapper] auth check aborted");
        } else {
          console.error("Auth check failed:", err);
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
      ac.abort();
    };
  }, [setUser, setAuthLoading]);

  // Block app render while checking session
  if (loading) {
    return <SpinnerOverlay />;
  }

  return children;
}
