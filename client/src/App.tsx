import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerSignIn from './pages/auth/CustomerSignIn';
import CustomerSignUp from './pages/auth/CustomerSignUp';
import CustomerHome from './pages/CustomerHome';
import AccountSettings from './pages/AccountSettings';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Landing Page is now the default view */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<CustomerSignIn />} />
        <Route path="/signup" element={<CustomerSignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/home" element={<CustomerHome />} />
        <Route path="/settings" element={<AccountSettings />} />

        {/* Note: The Landing Page links to a '/partner' page in the bottom section. 
            You can create a separate Signup for Pros later, but for now, we can map it to standard signup */}
        <Route path="/partner" element={<CustomerSignUp />} />
      </Routes>
    </Router>
  );
}

export default App;