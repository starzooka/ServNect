import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerSignUp from './pages/auth/CustomerSignUp';
import CustomerSignIn from './pages/auth/CustomerSignIn';
import CustomerHome from './pages/CustomerHome';
import AccountSettings from './pages/AccountSettings';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<CustomerSignUp />} />
          <Route path="/login" element={<CustomerSignIn />} />
          <Route path="/home" element={<CustomerHome />} />
<Route path="/settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  );
}

export default App;