import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { IconEmail, IconLock } from "../components/Icons";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (!terms) { setError("Vous devez accepter les CGU"); return; }
    setLoading(true);
    try {
      const data = await registerUser(email, password, true);
      if (data.token) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message || "Erreur lors de l'inscription");
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
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-sub">Rejoignez KB Events et réservez vos billets</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><IconEmail size={12} color="var(--text-secondary)" /> Email</label>
            <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label"><IconLock size={12} color="var(--text-secondary)" /> Mot de passe</label>
            <input className="form-input" type="password" placeholder="Minimum 6 caractères" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label"><IconLock size={12} color="var(--text-secondary)" /> Confirmer le mot de passe</label>
            <input className="form-input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={e => setTerms(e.target.checked)}
              style={{ marginTop: "3px", accentColor: "var(--gold)", flexShrink: 0 }}
            />
            <label htmlFor="terms" style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, cursor: "pointer" }}>
              J'accepte les{" "}
              <Link to="/terms" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
                Conditions Générales d'Utilisation
              </Link>
            </label>
          </div>

          <button className="btn-gold" style={{ width: "100%", marginBottom: "1rem" }} type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Créer mon compte"}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color: "var(--gold)", fontWeight: 700, textDecoration: "none" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
