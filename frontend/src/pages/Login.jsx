import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(false);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const detailText = typeof detail === "string" ? detail : JSON.stringify(detail || "");

      if (detailText.includes("pending_approval")) {
        setPending(true);
      } else {
        setError("Identifiants incorrects.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-icon-circle">
          <i className="bi bi-heart-pulse"></i>
        </div>

        <h5 className="auth-title">Gestion Pharmacie</h5>

        {pending && (
          <div className="alert alert-warning py-2 small text-center mb-3">
            <i className="bi bi-hourglass-split me-1"></i>
            Votre compte n'est pas encore validé. En attente de validation par l'administrateur.
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 small text-center mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label
                htmlFor="remember"
                className="form-check-label small"
                style={{ color: "rgba(224,242,254,0.7)" }}
              >
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-neon" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : "LOGIN"}
          </button>
        </form>

        <p className="auth-footer-text">
          Pas encore de compte ?{" "}
          <Link to="/register" className="auth-link">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}