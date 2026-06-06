import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';

// --- AUTH PAGES (Shared) ---
import CustomerSignIn from './pages/auth/SignIn';
import CustomerSignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/ResetPassword';

// --- CUSTOMER PAGES ---
import CustomerHome from './pages/customer/CustomerHome';
import CustomerSettings from './pages/customer/CustomerSettings'; // <-- NEW

// --- PROFESSIONAL PAGES ---
import ProfessionalLanding from './pages/professional/ProfessionalLanding';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import ProOnboarding from './pages/professional/ProOnboarding';
import ProSettings from './pages/professional/ProSettings'; // <-- NEW

// --- ADMIN PAGES ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminVerifications from './pages/admin/AdminVerifications';

export default function App() {
  const host = window.location.hostname;
  const isProDomain = host.startsWith('pro.');

  return (
    <Router>
        <Routes>
        {/* UNIVERSAL ADMIN ROUTE WITH NESTED LAYOUT */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="verifications" element={<AdminVerifications />} />  {/* ADD THIS */}
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* 2. DOMAIN-SPECIFIC ROUTES */}
        {isProDomain ? (
          <>
            <Route path="/" element={<ProfessionalLanding />} />
            <Route path="/dashboard" element={<ProfessionalDashboard />} />
            <Route path="/onboarding" element={<ProOnboarding />} />
            
            {/* Using the new Pro-specific settings page */}
            <Route path="/settings" element={<ProSettings />} />

            <Route path="/signup" element={<CustomerSignUp />} />
            <Route path="/login" element={<CustomerSignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<CustomerSignIn />} />
            <Route path="/signup" element={<CustomerSignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/home" element={<CustomerHome />} />
            
            {/* Using the new Customer-specific settings page */}
            <Route path="/settings" element={<CustomerSettings />} />
          </>
        )}
      </Routes>
    </Router>
  );
}