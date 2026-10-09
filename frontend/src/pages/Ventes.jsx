import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { panierService, factureService } from "../services/venteService";
import { clientService } from "../services/clientService";
import { produitService } from "../services/medicamentService";
import Modal from "../components/common/Modal";

export default function Ventes() {
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState(null);
  const [client, setClient] = useState("");
  const [produitChoisi, setProduitChoisi] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(false);
  const [erreurAjout, setErreurAjout] = useState("");

  const [showClientModal, setShowClientModal] = useState(false);
  const [nouveauClient, setNouveauClient] = useState({ nom: "", telephone: "" });
  const [erreurClient, setErreurClient] = useState("");
  const [savingClient, setSavingClient] = useState(false);

  const navigate = useNavigate();

  const charger = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      clientService.getAll(),
      produitService.getAll({ page_size: 200 }),
    ]);
    setClients(c.results || c);
    setProduits(p.results || p);
    setLoading(false);
  };

  const initPanier = async () => {
    const nouveauPanier = await panierService.create({});
    setPanier(nouveauPanier);
  };

  useEffect(() => {
    (async () => {
      await charger();
      await initPanier();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ajouterAuPanier = async () => {
    setErreurAjout("");
    if (!panier || !produitChoisi) return;

    const prod = produits.find((p) => p.id === Number(produitChoisi));
    const qte = Number(quantite);

    if (!qte || qte <= 0) {
      setErreurAjout("Veuillez saisir une quantité valide.");
      return;
    }
    if (qte > prod.quantite_stock) {
      setErreurAjout(`Stock insuffisant. Disponible : ${prod.quantite_stock}`);
      return;
    }

    try {
      await panierService.ajouterLigne(panier.id, {
        produit: prod.id,
        quantite: qte,
        prix_unitaire: prod.prix_vente,
      });
      const panierRafraichi = await panierService.getOne(panier.id);
      setPanier(panierRafraichi);
      setProduitChoisi("");
      setQuantite(1);
    } catch (err) {
      const msg = err?.response?.data?.quantite?.[0] || "Erreur lors de l'ajout au panier.";
      setErreurAjout(msg);
    }
  };

  const validerFacture = async () => {
    if (!panier || !panier.lignes?.length) return;
    setGeneration(true);
    try {
      if (client) {
        // relie le client au panier avant la facturation si besoin d'implémenter un endpoint dédié
      }
      const facture = await factureService.genererDepuisPanier(panier.id);
      navigate(`/factures/${facture.id}`);
    } finally {
      setGeneration(false);
    }
  };

  const ouvrirModalClient = () => {
    setNouveauClient({ nom: "", telephone: "" });
    setErreurClient("");
    setShowClientModal(true);
  };

  const handleCreerClient = async (e) => {
    e.preventDefault();
    if (!nouveauClient.nom.trim()) {
      setErreurClient("Le nom du client est obligatoire.");
      return;
    }
    setSavingClient(true);
    try {
      const created = await clientService.create(nouveauClient);
      setClients([...clients, created]);
      setClient(String(created.id));
      setShowClientModal(false);
    } catch {
      setErreurClient("Erreur lors de la création du client.");
    } finally {
      setSavingClient(false);
    }
  };

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
        <i className="bi bi-cart-check me-2"></i>Nouvelle vente
      </h2>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Client */}
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-8">
              <label className="form-label">Client (optionnel)</label>
              <select className="form-select" value={client} onChange={(e) => setClient(e.target.value)}>
                <option value="">-- Vente sans client enregistré --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {c.telephone ? `— ${c.telephone}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-primary w-100" onClick={ouvrirModalClient}>
                <i className="bi bi-person-plus me-2"></i>Nouveau client
              </button>
            </div>
          </div>

          <hr />

          {/* Ajout produit */}
          {erreurAjout && <div className="alert alert-danger py-2">{erreurAjout}</div>}
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <select
                className="form-select"
                value={produitChoisi}
                onChange={(e) => setProduitChoisi(e.target.value)}
              >
                <option value="">-- Choisir un produit --</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.prix_vente} / stock: {p.quantite_stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                min="1"
                className="form-control"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="Quantité"
              />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={ajouterAuPanier}>
                <i className="bi bi-cart-plus me-1"></i>Ajouter
              </button>
            </div>
          </div>

          {/* Table panier */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Produit</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-end">Prix unitaire</th>
                  <th className="text-end">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {(!panier?.lignes || panier.lignes.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      Aucun produit ajouté au panier.
                    </td>
                  </tr>
                )}
                {panier?.lignes?.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit_nom}</td>
                    <td className="text-center">{l.quantite}</td>
                    <td className="text-end">{Number(l.prix_unitaire).toFixed(2)}</td>
                    <td className="text-end">{(l.quantite * l.prix_unitaire).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" className="text-end">Total</th>
                  <th className="text-end">{Number(panier?.montant_total || 0).toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-end">
            <button
              className="btn btn-success"
              onClick={validerFacture}
              disabled={!panier?.lignes?.length || generation}
            >
              {generation ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-receipt me-2"></i>
              )}
              Générer la facture
            </button>
          </div>
        </div>
      </div>

      <Modal
        show={showClientModal}
        title="Nouveau client"
        onClose={() => setShowClientModal(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShowClientModal(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleCreerClient} disabled={savingClient}>
              {savingClient ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
            </button>
          </>
        }
      >
        {erreurClient && <div className="alert alert-danger py-2">{erreurClient}</div>}
        <form onSubmit={handleCreerClient}>
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input
              className="form-control"
              value={nouveauClient.nom}
              onChange={(e) => setNouveauClient({ ...nouveauClient, nom: e.target.value })}
              autoFocus
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Téléphone</label>
            <input
              className="form-control"
              value={nouveauClient.telephone}
              onChange={(e) => setNouveauClient({ ...nouveauClient, telephone: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}