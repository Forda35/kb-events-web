import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { IconEmail, IconLock } from "../components/Icons";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message || "Identifiants incorrects");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-sub">Accédez à vos billets KB Events</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <IconEmail size={12} color="var(--text-secondary)" /> Email
            </label>
            <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">
              <IconLock size={12} color="var(--text-secondary)" /> Mot de passe
            </label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div style={{ textAlign: "right", marginBottom: "1.25rem" }}>
            <Link to="/forgot-password" style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button className="btn-gold" style={{ width: "100%", marginBottom: "1rem" }} type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Se connecter"}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Pas encore de compte ?{" "}
          <Link to="/register" style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "none" }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
