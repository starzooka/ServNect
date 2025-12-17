import { Routes, Route, Navigate } from "react-router-dom";

import SidebarLayout from "./components/SidebarLayout";
import ExpertAuthWrapper from "./components/AuthWrapper";

import DashboardHome from "./pages/DashboardHome";
import BookingsPage from "./pages/BookingsPage";
import MessagesPage from "./pages/MessagesPage";
import AccountPage from "./pages/AccountPage";

import SignIn from "./pages/SignIn-Expert";
import SignUp from "./pages/SignUp-Expert";

export default function App() {
  return (
    <Routes>
      {/* 🔁 ROOT REDIRECT */}
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* ✅ PUBLIC ROUTES */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* 🔒 PROTECTED EXPERT ROUTES */}
      <Route
        path="/expert"
        element={
          <ExpertAuthWrapper>
            <SidebarLayout />
          </ExpertAuthWrapper>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>

      {/* ❌ CATCH-ALL */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
