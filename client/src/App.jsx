import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSetAtom } from "jotai";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ExploreServices from "./pages/Explore";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Professionals from "./pages/Professionals";
import AppPreloader from "./components/AppPreloader";
import { userAtom } from "./atoms";
import Profile from "./pages/Profile";
import BecomeExpert from "./pages/BecomeExpert";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const checkAuth = async () => {
      // ✅ 1. Get Token from Local Storage
      const token = localStorage.getItem("user_token");

      // If no token, stop immediately (User is guest)
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Checking auth with token...");
        
        const res = await fetch(`${BACKEND_URL}/users/me`, {
          method: "GET",
          // ✅ 2. Attach Token to Header (No Cookies)
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          // Token is invalid/expired -> Clear it to prevent loops
          console.warn("Token invalid, logging out.");
          localStorage.removeItem("user_token");
          setUser(null);
        } else {
          // Success -> Restore user session
          const me = await res.json();
          setUser(me);
        }
      } catch (err) {
        console.error("Failed to fetch /users/me:", err);
        // On network error, we usually keep the user logged out
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (loading) {
    return <AppPreloader loading={true} />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreServices />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/professionals/:category" element={<Professionals />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/bookings"
          element={<div className="p-6">Bookings page coming soon</div>}
        />
        <Route path="/become-expert" element={<BecomeExpert />} />
      </Routes>
    </>
  );
}

export default App;