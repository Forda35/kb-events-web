import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">KB Events</Link>

      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <div className={`navbar-links ${open ? "open" : ""}`}>
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end onClick={close}>
          Événements
        </NavLink>
        {user && (
          <NavLink to="/mes-billets" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={close}>
            Mes Billets
          </NavLink>
        )}
        <NavLink to="/terms" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={close}>
          CGU
        </NavLink>
        {user ? (
          <>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "0.5rem 0.5rem" }}>
              {user.email}
            </span>
            <button className="nav-btn" onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={close}>
              Connexion
            </NavLink>
            <Link to="/register" className="nav-btn" onClick={close}>S'inscrire</Link>
          </>
        )}
      </div>
    </nav>
  );
}
