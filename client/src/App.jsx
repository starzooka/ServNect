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

function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    // 🔁 Restore login from localStorage
    const storedUser = localStorage.getItem("servnect_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    setLoading(false);
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
        <Route
          path="/professionals/:category"
          element={<Professionals />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/bookings"
          element={<div className="p-6">Bookings page coming soon</div>}
        />
      </Routes>
    </>
  );
}

export default App;
