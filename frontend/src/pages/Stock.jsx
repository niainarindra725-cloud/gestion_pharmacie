import React, { useEffect, useState } from "react";
import { stockService } from "../services/stockService";
import { fournisseurService } from "../services/fournisseurService";
import { produitService } from "../services/medicamentService";
import Modal from "../components/common/Modal";

export default function Stock() {
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [fournisseur, setFournisseur] = useState("");
  const [lignes, setLignes] = useState([]);
  const [ligneForm, setLigneForm] = useState({ produit: "", quantite_recue: "", prix_achat: "" });
  const [errors, setErrors] = useState({});

  const charger = async () => {
    setLoading(true);
    const [appros, fours, prods] = await Promise.all([
      stockService.getAll(),
      fournisseurService.getAll(),
      produitService.getAll({ page_size: 200 }),
    ]);
    setApprovisionnements(appros.results || appros);
    setFournisseurs(fours.results || fours);
    setProduits(prods.results || prods);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirModal = () => {
    setFournisseur("");
    setLignes([]);
    setLigneForm({ produit: "", quantite_recue: "", prix_achat: "" });
    setErrors({});
    setShowModal(true);
  };

  const validerLigne = () => {
    const erreurs = {};
    if (!ligneForm.produit) erreurs.produit = "Choisissez un produit.";
    if (!ligneForm.quantite_recue || !/^\d+$/.test(ligneForm.quantite_recue) || Number(ligneForm.quantite_recue) <= 0)
      erreurs.quantite_recue = "Quantité invalide (nombre entier positif requis).";
    if (!ligneForm.prix_achat || isNaN(ligneForm.prix_achat) || Number(ligneForm.prix_achat) <= 0)
      erreurs.prix_achat = "Prix invalide (nombre positif requis).";
    setErrors(erreurs);
    return Object.keys(erreurs).length === 0;
  };

  const ajouterLigne = () => {
    if (!validerLigne()) return;
    const prod = produits.find((p) => p.id === Number(ligneForm.produit));
    setLignes([
      ...lignes,
      {
        produit: Number(ligneForm.produit),
        produit_nom: prod.nom,
        quantite_recue: Number(ligneForm.quantite_recue),
        prix_achat: Number(ligneForm.prix_achat),
      },
    ]);
    setLigneForm({ produit: "", quantite_recue: "", prix_achat: "" });
    setErrors({});
  };

  const retirerLigne = (index) => setLignes(lignes.filter((_, i) => i !== index));

  const totalEstime = lignes.reduce((acc, l) => acc + l.quantite_recue * l.prix_achat, 0);

  const validerApprovisionnement = async () => {
    const erreurs = {};
    if (!fournisseur) erreurs.fournisseur = "Veuillez choisir un fournisseur.";
    if (lignes.length === 0) erreurs.lignes = "Ajoutez au moins un produit avant de valider.";
    setErrors(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    setSaving(true);
    try {
      await stockService.create({
        fournisseur: Number(fournisseur),
        lignes: lignes.map(({ produit, quantite_recue, prix_achat }) => ({
          produit, quantite_recue, prix_achat,
        })),
      });
      setShowModal(false);
      charger();
    } catch (err) {
      setErrors({ general: "Erreur lors de l'enregistrement. Vérifiez les données." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-box-seam me-2"></i>Stock / Approvisionnement
        </h2>
        <button className="btn btn-primary" onClick={ouvrirModal}>
          <i className="bi bi-plus-circle me-2"></i>Nouvel approvisionnement
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold">
          <i className="bi bi-clock-history me-2"></i>Historique des approvisionnements
        </div>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Fournisseur</th>
                  <th className="text-end">Montant total</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {approvisionnements.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      Aucun approvisionnement enregistré.
                    </td>
                  </tr>
                )}
                {approvisionnements.map((a) => (
                  <tr key={a.id}>
                    <td>{new Date(a.date_appro).toLocaleString()}</td>
                    <td>{a.fournisseur_nom}</td>
                    <td className="text-end fw-semibold">{Number(a.montant_total).toFixed(2)}</td>
                    <td>
                      {a.lignes.map((l) => (
                        <span key={l.id} className="badge bg-light text-dark border me-1 mb-1">
                          {l.produit_nom} × {l.quantite_recue}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        show={showModal}
        title="Nouvel approvisionnement"
        onClose={() => setShowModal(false)}
        size="lg"
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button className="btn btn-success" onClick={validerApprovisionnement} disabled={saving}>
              {saving ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-check-circle me-2"></i>
              )}
              Valider tout l'approvisionnement
            </button>
          </>
        }
      >
        {errors.general && <div className="alert alert-danger py-2">{errors.general}</div>}
        {errors.lignes && <div className="alert alert-warning py-2">{errors.lignes}</div>}

        <div className="mb-3">
          <label className="form-label">Fournisseur</label>
          <select
            className={`form-select ${errors.fournisseur ? "is-invalid" : ""}`}
            value={fournisseur}
            onChange={(e) => setFournisseur(e.target.value)}
          >
            <option value="">-- Choisir un fournisseur --</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          {errors.fournisseur && <div className="invalid-feedback">{errors.fournisseur}</div>}
        </div>

        <hr />
        <label className="form-label fw-semibold">Ajouter un produit</label>
        <div className="row g-2 mb-3">
          <div className="col-md-5">
            <select
              className={`form-select ${errors.produit ? "is-invalid" : ""}`}
              value={ligneForm.produit}
              onChange={(e) => setLigneForm({ ...ligneForm, produit: e.target.value })}
            >
              <option value="">-- Produit --</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
            {errors.produit && <div className="invalid-feedback d-block">{errors.produit}</div>}
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className={`form-control ${errors.quantite_recue ? "is-invalid" : ""}`}
              placeholder="Quantité"
              value={ligneForm.quantite_recue}
              onChange={(e) => setLigneForm({ ...ligneForm, quantite_recue: e.target.value })}
            />
            {errors.quantite_recue && <div className="invalid-feedback">{errors.quantite_recue}</div>}
          </div>
          <div className="col-md-3">
            <input
              type="number"
              step="0.01"
              className={`form-control ${errors.prix_achat ? "is-invalid" : ""}`}
              placeholder="Prix d'achat"
              value={ligneForm.prix_achat}
              onChange={(e) => setLigneForm({ ...ligneForm, prix_achat: e.target.value })}
            />
            {errors.prix_achat && <div className="invalid-feedback">{errors.prix_achat}</div>}
          </div>
          <div className="col-md-1">
            <button type="button" className="btn btn-outline-primary w-100" onClick={ajouterLigne}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>

        <table className="table table-sm">
          <thead>
            <tr>
              <th>Produit</th>
              <th className="text-center">Qté</th>
              <th className="text-end">Prix</th>
              <th className="text-end">Sous-total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lignes.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">Aucun produit ajouté.</td>
              </tr>
            )}
            {lignes.map((l, i) => (
              <tr key={i}>
                <td>{l.produit_nom}</td>
                <td className="text-center">{l.quantite_recue}</td>
                <td className="text-end">{l.prix_achat.toFixed(2)}</td>
                <td className="text-end">{(l.quantite_recue * l.prix_achat).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => retirerLigne(i)}>
                    <i className="bi bi-x"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {lignes.length > 0 && (
            <tfoot>
              <tr>
                <th colSpan="3" className="text-end">Total estimé</th>
                <th className="text-end">{totalEstime.toFixed(2)}</th>
                <th></th>
              </tr>
            </tfoot>
          )}
        </table>
      </Modal>
    </div>
  );
}