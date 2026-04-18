import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Particles from "./components/Particles";
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TermsPage from "./pages/TermsPage";

function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Particles />
      <div className="app-wrapper">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<EventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route
              path="/mes-billets"
              element={<PrivateRoute><MyTicketsPage /></PrivateRoute>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} KB Events — Madagascar</p>
          <p style={{ marginTop: "0.25rem" }}>
            <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "none" }}>CGU</a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
