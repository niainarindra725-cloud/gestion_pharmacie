import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";

const ROLE_BADGE = {
  ADMIN: "bg-danger",
  PHARMACIEN: "bg-primary",
  CAISSIER: "bg-secondary",
};

export default function UtilisateursEnAttente() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const charger = async () => {
    setLoading(true);
    const data = await userService.getEnAttente();
    setUtilisateurs(data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleValider = async (id) => {
    setActionId(id);
    await userService.valider(id);
    await charger();
    setActionId(null);
  };

  const handleRefuser = async (id) => {
    if (!window.confirm("Refuser et supprimer définitivement cette demande ?")) return;
    setActionId(id);
    await userService.refuser(id);
    await charger();
    setActionId(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-person-check me-2"></i>Utilisateurs en attente
        </h2>
        <span className="badge bg-warning text-dark fs-6">
          {utilisateurs.length} demande{utilisateurs.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : utilisateurs.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            <i className="bi bi-check2-circle fs-1 d-block mb-2 text-success"></i>
            Aucune demande en attente.
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {utilisateurs.map((u) => (
            <div className="col-md-6 col-lg-4" key={u.id}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-0">{u.nom}</h5>
                      <p className="text-muted small mb-0">@{u.username}</p>
                    </div>
                    <span className={`badge ${ROLE_BADGE[u.role] || "bg-secondary"}`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="small text-muted mb-1">
                    <i className="bi bi-envelope me-1"></i>{u.email}
                  </p>
                  <p className="small text-muted mb-3">
                    <i className="bi bi-calendar3 me-1"></i>
                    Inscrit le {new Date(u.date_joined).toLocaleDateString()}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm flex-fill"
                      disabled={actionId === u.id}
                      onClick={() => handleValider(u.id)}
                    >
                      <i className="bi bi-check-circle me-1"></i>Valider
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm flex-fill"
                      disabled={actionId === u.id}
                      onClick={() => handleRefuser(u.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i>Refuser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}