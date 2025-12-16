import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function AuthWrapper({ children }) {
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);

      try {
        const res = await fetch(`${BACKEND_URL}/users/me/current`, {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data || null);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    }

    checkAuth();
  }, [setUser, setAuthLoading]);

  // 🌟 Animated loader with friendly message
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
        {/* Spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-base font-medium">
            Hold on for a moment...
          </p>
          <p className="text-sm text-muted-foreground">
            Setting up your workspace…
          </p>
        </div>
      </div>
    );
  }

  return children;
}
