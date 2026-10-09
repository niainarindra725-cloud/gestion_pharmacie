import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { factureService, paiementService } from "../services/venteService";
import Modal from "../components/common/Modal";

export default function FactureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [montant, setMontant] = useState("");
  const [modePaiement, setModePaiement] = useState("ESPECES");
  const [erreurs, setErreurs] = useState({});
  const [saving, setSaving] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    const data = await factureService.getOne(id);
    setFacture(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    charger();
  }, [charger]);

  const ouvrirModalPaiement = () => {
    setMontant(facture.solde_restant);
    setModePaiement("ESPECES");
    setErreurs({});
    setShowModal(true);
  };

  const handlePaiement = async (e) => {
    e.preventDefault();
    const erreurs = {};
    if (!montant || Number(montant) <= 0) erreurs.montant = "Le montant est obligatoire et doit être positif.";
    if (Number(montant) > Number(facture.solde_restant))
      erreurs.montant = `Le montant ne peut pas dépasser le solde restant (${facture.solde_restant}).`;
    if (!modePaiement) erreurs.mode_paiement = "Le mode de paiement est obligatoire.";
    setErreurs(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    setSaving(true);
    try {
      await paiementService.create({
        facture: facture.id,
        montant: Number(montant),
        mode_paiement: modePaiement,
      });
      setShowModal(false);
      charger();
    } catch {
      setErreurs({ general: "Erreur lors de l'enregistrement du paiement." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!facture) return <p>Facture introuvable.</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate("/factures")}>
          <i className="bi bi-arrow-left me-2"></i>Retour à la liste
        </button>
        <button className="btn btn-outline-primary" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>Imprimer
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
            <div>
              <h3 className="mb-1">
                <i className="bi bi-capsule-pill text-primary me-2"></i>Pharmacie
              </h3>
              <p className="text-muted mb-0">Facture de vente</p>
            </div>
            <div className="text-end">
              <h4 className="mb-1">{facture.numero_facture}</h4>
              <p className="text-muted mb-0">{new Date(facture.date_facture).toLocaleString()}</p>
              {Number(facture.solde_restant) > 0 ? (
                <span className="badge bg-warning text-dark mt-1">Impayée</span>
              ) : (
                <span className="badge bg-success mt-1">Soldée</span>
              )}
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="text-muted text-uppercase small">Facturé à</h6>
              <p className="mb-0 fw-semibold">{facture.client_nom || "Client non enregistré"}</p>
              {facture.client_telephone && (
                <p className="mb-0 text-muted">
                  <i className="bi bi-telephone me-1"></i>{facture.client_telephone}
                </p>
              )}
            </div>
          </div>

          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Produit</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-end">Prix unitaire</th>
                  <th className="text-end">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {facture.lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit_nom}</td>
                    <td className="text-center">{l.quantite}</td>
                    <td className="text-end">{(l.sous_total / l.quantite).toFixed(2)}</td>
                    <td className="text-end">{Number(l.sous_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row justify-content-end mb-4">
            <div className="col-md-5">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td>Montant total</td>
                    <td className="text-end fw-semibold">{Number(facture.montant_total).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Montant payé</td>
                    <td className="text-end text-success">{Number(facture.montant_paye).toFixed(2)}</td>
                  </tr>
                  <tr className="border-top">
                    <td className="fw-bold">Solde restant</td>
                    <td className="text-end fw-bold text-danger">{Number(facture.solde_restant).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted text-uppercase small mb-0">Historique des paiements</h6>
            {Number(facture.solde_restant) > 0 && (
              <button className="btn btn-sm btn-success" onClick={ouvrirModalPaiement}>
                <i className="bi bi-cash-coin me-1"></i>Encaisser
              </button>
            )}
          </div>
          {facture.paiements.length === 0 ? (
            <p className="text-muted small">Aucun paiement enregistré.</p>
          ) : (
            <ul className="list-group">
              {facture.paiements.map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    {new Date(p.date_paiement).toLocaleString()} —{" "}
                    <span className="badge bg-secondary">{p.mode_paiement}</span>
                  </span>
                  <span className="fw-semibold">{Number(p.montant).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        show={showModal}
        title="Enregistrer un paiement"
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button className="btn btn-success" onClick={handlePaiement} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm"></span> : "Enregistrer"}
            </button>
          </>
        }
      >
        {erreurs.general && <div className="alert alert-danger py-2">{erreurs.general}</div>}
        <form onSubmit={handlePaiement}>
          <div className="mb-3">
            <label className="form-label">Montant</label>
            <input
              type="number"
              step="0.01"
              className={`form-control ${erreurs.montant ? "is-invalid" : ""}`}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
            {erreurs.montant && <div className="invalid-feedback">{erreurs.montant}</div>}
            <div className="form-text">Solde restant : {facture.solde_restant}</div>
          </div>

          <div className="mb-2">
            <label className="form-label">Mode de paiement</label>
            <select
              className={`form-select ${erreurs.mode_paiement ? "is-invalid" : ""}`}
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value)}
            >
              <option value="ESPECES">Espèces</option>
              <option value="CARTE">Carte bancaire</option>
              <option value="MOBILE">Mobile Money</option>
              <option value="VIREMENT">Virement</option>
            </select>
            {erreurs.mode_paiement && <div className="invalid-feedback">{erreurs.mode_paiement}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
}