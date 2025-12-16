
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
    console.log("🔍 Checking auth...");

    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const me = await res.json();
          setUser(me);
        }
      } catch (err) {
        console.error("Failed to fetch /auth/me:", err);
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
        <Route path="/bookings" element={<div className="p-6">Bookings page coming soon</div>} />
        <Route path="/become-expert" element={<BecomeExpert />} />
      </Routes>
    </>
  );
}

export default App;
