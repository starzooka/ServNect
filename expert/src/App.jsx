// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import SidebarLayout from "./components/SidebarLayout.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";

import AppPreloader from "./components/AppPreloader";
import ProtectedRoute from "./components/ProtectedRoute";

import SignUp from "./pages/SignUp-Expert.jsx";
import SignIn from "./pages/SignIn-Expert.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Global preloader (app boot)
  if (loading) {
    return <AppPreloader loading />;
  }

  return (
    <Routes>
      {/* ✅ Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* 🔒 Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
