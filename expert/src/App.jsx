// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout.jsx";
import DashboardHome from "./components/DashboardHome.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AppPreloader from "./components/AppPreloader"; // ✅ import preloader


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (you can also replace this with actual logic like checking auth/session)
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AppPreloader loading={true} />; // ✅ Show preloader before app loads
  }

return (
    <Routes>
      <Route path="/" element={<SidebarLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}

export default App;
