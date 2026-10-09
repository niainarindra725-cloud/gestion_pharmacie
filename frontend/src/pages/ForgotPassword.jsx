import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card text-center">
        <div className="auth-icon-circle">
          <i className="bi bi-key"></i>
        </div>
        <h5 className="auth-title">Mot de passe oublié</h5>

        {sent ? (
          <>
            <p style={{ color: "rgba(224,242,254,0.8)" }} className="small mb-4">
              Si un compte existe avec cet email, un lien de réinitialisation vient
              d'être envoyé. Vérifiez votre boîte de réception (ou le terminal du
              serveur en environnement de développement).
            </p>
            <Link to="/login" className="btn-neon d-inline-block text-decoration-none">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="text-start">
            <p
              style={{ color: "rgba(224,242,254,0.7)" }}
              className="small text-center mb-3"
            >
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
            <div className="auth-input-group input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-neon" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "ENVOYER LE LIEN"
              )}
            </button>
            <p className="auth-footer-text">
              <Link to="/login" className="auth-link">
                <i className="bi bi-arrow-left me-1"></i>Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}