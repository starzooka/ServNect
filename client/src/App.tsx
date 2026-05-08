import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- MAIN PAGES ---
import LandingPage from './pages/LandingPage';

// --- AUTH PAGES (Shared) ---
import CustomerSignIn from './pages/auth/SignIn';
import CustomerSignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/ResetPassword';

// --- SHARED DASHBOARD PAGES ---
import AccountSettings from './pages/shared/AccountSettings';

// --- CUSTOMER PAGES ---
import CustomerHome from './pages/customer/CustomerHome';

// --- PROFESSIONAL PAGES ---
import ProfessionalLanding from './pages/professional/ProfessionalLanding';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import ProOnboarding from './pages/professional/ProOnboarding';

export default function App() {
  const host = window.location.hostname;
  const isProDomain = host.startsWith('pro.');

  return (
    <Router>
      {isProDomain ? (
        <Routes>
          <Route path="/" element={<ProfessionalLanding />} />
          
          <Route path="/dashboard" element={<ProfessionalDashboard />} />
          <Route path="/onboarding" element={<ProOnboarding />} />
          <Route path="/settings" element={<AccountSettings />} />

          <Route path="/signup" element={<CustomerSignUp />} />
          <Route path="/login" element={<CustomerSignIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<CustomerSignIn />} />
          <Route path="/signup" element={<CustomerSignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/home" element={<CustomerHome />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Routes>
      )}
    </Router>
  );
}