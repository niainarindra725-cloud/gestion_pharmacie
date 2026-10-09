import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!uid || !token) {
      setError("Lien invalide.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(uid, token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card text-center">
        <div className="auth-icon-circle">
          <i className="bi bi-shield-lock"></i>
        </div>
        <h5 className="auth-title">Nouveau mot de passe</h5>

        {success ? (
          <p style={{ color: "rgba(224,242,254,0.8)" }} className="small">
            Mot de passe réinitialisé avec succès. Redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="text-start">
            {error && (
              <div className="alert alert-danger py-2 small text-center mb-3">{error}</div>
            )}

            <div className="auth-input-group input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div className="auth-input-group input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Confirmer le mot de passe"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-neon" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "RÉINITIALISER"
              )}
            </button>
            <p className="auth-footer-text">
              <Link to="/login" className="auth-link">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}