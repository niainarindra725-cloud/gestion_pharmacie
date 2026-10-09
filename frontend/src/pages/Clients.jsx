import React, { useEffect, useState } from "react";
import { clientService } from "../services/clientService";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = async () => {
    setLoading(true);
    const data = await clientService.getAll();
    setClients(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce client ?")) {
      await clientService.remove(id);
      charger();
    }
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-people me-2"></i>Clients
      </h2>
      <p className="text-muted small mb-3">
        Les nouveaux clients sont créés directement depuis la page "Nouvelle vente".
      </p>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      Aucun client enregistré.
                    </td>
                  </tr>
                )}
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">
                      {c.nom}
                    </td>
                    <td>{c.telephone || <span className="text-muted">—</span>}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                        <i className="bi bi-trash me-1"></i>Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}