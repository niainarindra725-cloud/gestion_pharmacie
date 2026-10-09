import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    nom: "",
    email: "",
    password: "",
    role: "CAISSIER",
  });
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      setSuccess(true);
    } catch (err) {
      const data = err?.response?.data;
      const message = data?.username?.[0] || data?.email?.[0] || "Erreur lors de l'inscription.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card text-center">
          <div className="auth-icon-circle">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <h5 className="auth-title">Compte créé</h5>
          <p style={{ color: "rgba(224,242,254,0.8)" }} className="small mb-4">
            Votre compte a bien été créé. Il est en attente de validation par
            l'administrateur avant de pouvoir vous connecter.
          </p>
          <button className="btn-neon" onClick={() => navigate("/login")}>
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-icon-circle">
          <i className="bi bi-person-plus"></i>
        </div>

        <h5 className="auth-title">Créer un compte</h5>

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
              name="username"
              className="form-control"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-card-text"></i>
            </span>
            <input
              type="text"
              name="nom"
              className="form-control"
              placeholder="Nom complet"
              value={form.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-briefcase"></i>
            </span>
            <select
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
              style={{ background: "transparent", color: "#e0f2fe", border: "none" }}
            >
              <option value="CAISSIER" style={{ color: "#000" }}>Caissier</option>
              <option value="PHARMACIEN" style={{ color: "#000" }}>Pharmacien</option>
              <option value="ADMIN" style={{ color: "#000" }}>Administrateur</option>
            </select>
          </div>

          <div className="auth-input-group input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
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
              "S'INSCRIRE"
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Déjà un compte ?{" "}
          <Link to="/login" className="auth-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}