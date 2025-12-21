import { Routes, Route, Navigate } from "react-router-dom";

import SidebarLayout from "./components/SidebarLayout";
import ExpertAuthWrapper from "./components/AuthWrapper";
import About from "./pages/About";
import DashboardHome from "./pages/DashboardHome";
import BookingsPage from "./pages/BookingsPage";
import MessagesPage from "./pages/MessagesPage";
import AccountPage from "./pages/AccountPage";

import SignIn from "./pages/SignIn-Expert";
import SignUp from "./pages/SignUp-Expert";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

function App() {
  const [loading, setLoading] = useState(true); // loading = checking auth
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    // On first load, check if user is already logged in (via cookie)
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        if (!res.ok) {
          // not logged in / token invalid
          setUser(null);
        } else {
          const me = await res.json();
          setUser(me); // { id, firstName, lastName, email, ... }
        }
      } catch (err) {
        console.error("Failed to fetch /auth/me:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (loading) {
    // Show preloader while we check if user is logged in
    return <AppPreloader loading={true} />;
  }
}

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
