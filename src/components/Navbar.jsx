import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Ferme le menu à chaque changement de route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Empêche le scroll du body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <nav className="navbar">
        <Link to="/" className="navbar-brand">KB Events</Link>

        <button
          className={`hamburger ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
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
              <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", padding: "0.5rem 0.75rem", borderTop: "1px solid var(--border)", marginTop: "0.25rem" }}>
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
    </>
  );
}
