import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { factureService } from "../services/venteService";

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const charger = async () => {
    setLoading(true);
    const data = await factureService.getAll();
    setFactures(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-receipt me-2"></i>Liste des factures
      </h2>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Date</th>
                <th className="text-end">Montant total</th>
                <th className="text-end">Payé</th>
                <th className="text-end">Solde</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {factures.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    Aucune facture enregistrée.
                  </td>
                </tr>
              )}
              {factures.map((f) => (
                <tr key={f.id}>
                  <td className="fw-semibold">{f.numero_facture}</td>
                  <td>{f.client_nom || <span className="text-muted">—</span>}</td>
                  <td>{new Date(f.date_facture).toLocaleString()}</td>
                  <td className="text-end">{Number(f.montant_total).toFixed(2)}</td>
                  <td className="text-end">{Number(f.montant_paye).toFixed(2)}</td>
                  <td className="text-end">{Number(f.solde_restant).toFixed(2)}</td>
                  <td className="text-center">
                    {Number(f.solde_restant) > 0 ? (
                      <span className="badge bg-warning text-dark">Impayée</span>
                    ) : (
                      <span className="badge bg-success">Soldée</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/factures/${f.id}`)}
                    >
                      <i className="bi bi-eye me-1"></i>Voir détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}