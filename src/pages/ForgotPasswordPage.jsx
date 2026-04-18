import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";
import { IconEmail } from "../components/Icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.message && !data.error) {
        setSent(true);
      } else {
        setError(data.message || "Erreur");
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
        <h1 className="auth-title">Mot de passe oublié</h1>
        <p className="auth-sub">Entrez votre email pour recevoir un lien de réinitialisation</p>

        {sent ? (
          <div>
            <div className="alert alert-success">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
            </div>
            <Link to="/login" className="btn-gold" style={{ display: "flex", marginTop: "1rem" }}>Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label"><IconEmail size={12} color="var(--text-secondary)" /> Email</label>
              <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn-gold" style={{ width: "100%", marginBottom: "1rem" }} type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Envoyer le lien"}
            </button>
            <Link to="/login" style={{ display: "block", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
              ← Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
