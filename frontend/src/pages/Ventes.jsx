import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { panierService, factureService } from "../services/venteService";
import { clientService } from "../services/clientService";
import { produitService } from "../services/medicamentService";
import Modal from "../components/common/Modal";


const NOM_REGEX = /^[A-Za-zÀ-ÿ\s'-]+$/;
const TEL_CARACTERES_REGEX = /^[0-9+\s]*$/;

function validerTelephone(value) {
  const sansEspaces = value.replace(/\s/g, "");
  if (!sansEspaces) return null;

  if (sansEspaces.startsWith("+261")) {
    const chiffres = sansEspaces.slice(4);
    if (!/^\d+$/.test(chiffres) || chiffres.length !== 9) {
      return "Numéro invalide ou incomplet.";
    }
  } else if (sansEspaces.startsWith("0")) {
    if (!/^\d+$/.test(sansEspaces) || sansEspaces.length !== 10) {
      return "Numéro invalide ou incomplet.";
    }
  } else {
    return "Le numéro doit commencer par 0 ou +261.";
  }
  return null;
}

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
  const [erreurValidation, setErreurValidation] = useState("");
  const [suppressionId, setSuppressionId] = useState(null);

  const [showClientModal, setShowClientModal] = useState(false);
  const [nouveauClient, setNouveauClient] = useState({ nom: "", telephone: "" });
  const [erreurClient, setErreurClient] = useState({});
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
  }, []);

  const rafraichirPanier = async () => {
    const panierRafraichi = await panierService.getOne(panier.id);
    setPanier(panierRafraichi);
  };

  const ajouterAuPanier = async () => {
    setErreurAjout("");
    setErreurValidation("");

    if (!produitChoisi) {
      setErreurAjout("Veuillez choisir un produit.");
      return;
    }
    const qte = Number(quantite);
    if (!qte || qte <= 0) {
      setErreurAjout("Veuillez saisir une quantité valide.");
      return;
    }

    const prod = produits.find((p) => p.id === Number(produitChoisi));
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
      await rafraichirPanier();
      setProduitChoisi("");
      setQuantite(1);
    } catch (err) {
      const msg = err?.response?.data?.quantite?.[0] || "Erreur lors de l'ajout au panier.";
      setErreurAjout(msg);
    }
  };

  const retirerLigne = async (ligneId) => {
    setSuppressionId(ligneId);
    try {
      await panierService.supprimerLigne(ligneId);
      await rafraichirPanier();
    } finally {
      setSuppressionId(null);
    }
  };

    const validerFacture = async () => {
    setErreurValidation("");

    if (!client) {
      setErreurValidation("Veuillez sélectionner un client avant de générer la facture.");
      return;
    }

    if (!panier || !panier.lignes?.length) {
      setErreurValidation("Ajoutez au moins un produit au panier avant de générer la facture.");
      return;
    }

    setGeneration(true);
    try {
      await panierService.assignerClient(panier.id, Number(client));
      const facture = await factureService.genererDepuisPanier(panier.id);
      navigate(`/factures/${facture.id}`);
    } catch (err) {
      setErreurValidation("Erreur lors de la génération de la facture.");
    } finally {
      setGeneration(false);
    }
  };

  const ouvrirModalClient = () => {
    setNouveauClient({ nom: "", telephone: "" });
    setErreurClient({});
    setShowClientModal(true);
  };

  const handleCreerClient = async (e) => {
    e.preventDefault();
    const erreurs = {};
    const nom = nouveauClient.nom.trim();

    if (!nom) {
      erreurs.nom = "Le nom du client est obligatoire.";
    } else if (!NOM_REGEX.test(nom)) {
      erreurs.nom = "Le nom ne doit contenir que des lettres.";
    }

    if (nouveauClient.telephone) {
      const erreurTel = validerTelephone(nouveauClient.telephone);
      if (erreurTel) erreurs.telephone = erreurTel;
    }

    setErreurClient(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    setSavingClient(true);
    try {
      const created = await clientService.create(nouveauClient);
      setClients([...clients, created]);
      setClient(String(created.id));
      setShowClientModal(false);
    } catch (err) {
      const data = err?.response?.data;
      setErreurClient({
        nom: data?.nom?.[0],
        telephone: data?.telephone?.[0],
        general: !data?.nom && !data?.telephone ? "Erreur lors de la création du client." : "",
      });
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
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-8">
              <select className="form-select" value={client} onChange={(e) => setClient(e.target.value)}>
                <option value="">-- Sélectionner un client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
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
                  <option key={p.id} value={p.id}>{p.nom}</option>
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

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Produit</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-end">Prix unitaire</th>
                  <th className="text-end">Sous-total</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {(!panier?.lignes || panier.lignes.length === 0) && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">
                      Aucun produit ajouté au panier.
                    </td>
                  </tr>
                )}
                {panier?.lignes?.map((l) => (
                  <tr key={l.id}>
                    <td>{l.produit_nom}</td>
                    <td className="text-center">{l.quantite}</td>
                    <td className="text-end">{Number(l.prix_unitaire).toFixed(2)} Ar</td>
                    <td className="text-end">{(l.quantite * l.prix_unitaire).toFixed(2)} Ar</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => retirerLigne(l.id)}
                        disabled={suppressionId === l.id}
                      >
                        {suppressionId === l.id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" className="text-end">Total</th>
                  <th className="text-end">{Number(panier?.montant_total || 0).toFixed(2)} Ar</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>

          {erreurValidation && (
            <div className="alert alert-danger py-2 d-flex align-items-center">
              <i className="bi bi-exclamation-circle me-2"></i>
              {erreurValidation}
            </div>
          )}

          <div className="text-end">
            <button className="btn btn-success" onClick={validerFacture} disabled={generation}>
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
        {erreurClient.general && <div className="alert alert-danger py-2">{erreurClient.general}</div>}
        {erreurClient.nom && (
          <div className="alert alert-danger py-2 d-flex align-items-center">
            <i className="bi bi-exclamation-circle me-2"></i>
            {erreurClient.nom}
          </div>
        )}
        <form onSubmit={handleCreerClient}>
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input
              className={`form-control ${erreurClient.nom ? "is-invalid" : ""}`}
              value={nouveauClient.nom}
              onChange={(e) => setNouveauClient({ ...nouveauClient, nom: e.target.value })}
              autoFocus
            />
            {erreurClient.nom && <div className="invalid-feedback">{erreurClient.nom}</div>}
          </div>
          <div className="mb-2">
            <label className="form-label">Téléphone</label>
            <input
              className={`form-control ${erreurClient.telephone ? "is-invalid" : ""}`}
              placeholder="0XX XX XXX XX ou +261 XX XX XXX XX"
              value={nouveauClient.telephone}
              onChange={(e) => {
                const val = e.target.value;
                if (TEL_CARACTERES_REGEX.test(val)) {
                  setNouveauClient({ ...nouveauClient, telephone: val });
                }
              }}
            />
            {erreurClient.telephone && <div className="invalid-feedback">{erreurClient.telephone}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
}