import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';

// --- AUTH PAGES (Shared) ---
import CustomerSignIn from './pages/auth/SignIn';
import CustomerSignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/ResetPassword';

// --- CUSTOMER PAGES ---
import CustomerHome from './pages/customer/CustomerHome';
import CustomerSettings from './pages/customer/CustomerSettings';
import ProProfile from './pages/customer/ProProfile'; // <-- Imported public portfolio page

// --- PROFESSIONAL PAGES ---
import ProfessionalLanding from './pages/professional/ProfessionalLanding';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import ProOnboarding from './pages/professional/ProOnboarding';
import ProSettings from './pages/professional/ProSettings';

// --- ADMIN PAGES ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminVerifications from './pages/admin/AdminVerifications';
import CategoryManager from './pages/admin/CategoryManager'; // <-- The new Dynamic Categories Page!

export default function App() {
  const host = window.location.hostname;
  
  // Check if the user is on the pro subdomain (e.g. pro.servnect.com or pro.localhost)
  const isProDomain = host.startsWith('pro.');

  return (
    <Router>
      <Routes>
        {/* =========================================
            1. UNIVERSAL ADMIN ROUTES
            ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="verifications" element={<AdminVerifications />} />
          <Route path="categories" element={<CategoryManager />} />
        </Route>

        {/* =========================================
            2. DOMAIN-SPECIFIC ROUTES
            ========================================= */}
        {isProDomain ? (
          <>
            {/* PROFESSIONAL APP ROUTES */}
            <Route path="/" element={<ProfessionalLanding />} />
            <Route path="/dashboard" element={<ProfessionalDashboard />} />
            <Route path="/onboarding" element={<ProOnboarding />} />
            <Route path="/settings" element={<ProSettings />} />

            {/* Pro Auth Routes */}
            <Route path="/signup" element={<CustomerSignUp />} />
            <Route path="/login" element={<CustomerSignIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </>
        ) : (
          <>
            {/* CUSTOMER APP ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<CustomerHome />} />
            <Route path="/settings" element={<CustomerSettings />} />
            <Route path="/pro/:proId" element={<ProProfile />} /> {/* <-- Connected dynamic portfolio path */}
            
            {/* Customer Auth Routes */}
            <Route path="/login" element={<CustomerSignIn />} />
            <Route path="/signup" element={<CustomerSignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </>
        )}
      </Routes>
    </Router>
  );
}