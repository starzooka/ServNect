import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerSignIn from './pages/auth/CustomerSignIn';
import CustomerSignUp from './pages/auth/CustomerSignUp';
import CustomerHome from './pages/CustomerHome';
import AccountSettings from './pages/AccountSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<CustomerSignIn />} />
        <Route path="/signup" element={<CustomerSignUp />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/home" element={<CustomerHome />} />
        <Route path="/settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  );
}

export default App;