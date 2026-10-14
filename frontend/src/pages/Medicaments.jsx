import React, { useEffect, useState } from "react";
import { categorieService, produitService } from "../services/medicamentService";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";

const initialForm = {
  nom: "", prix_vente: "", quantite_stock: "",
  seuil_alerte: "", date_expiration: "", categorie: "",
};
const PAR_PAGE = 6;

export default function Medicaments() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const charger = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      produitService.getAll({ page_size: 200 }),
      categorieService.getAll(),
    ]);
    setProduits(p.results || p);
    setCategories(c.results || c);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const valider = () => {
    const erreurs = {};
    const nom = form.nom.trim();

    if (!nom) {
      erreurs.nom = "Le nom est obligatoire.";
    } else if (!/[A-Za-zÀ-ÿ]/.test(nom)) {
      erreurs.nom = "Le nom du produit doit contenir au moins une lettre.";
    }

    if (!form.prix_vente || Number(form.prix_vente) <= 0)
      erreurs.prix_vente = "Le prix de vente doit être supérieur à 0.";
    if (form.quantite_stock === "" || Number(form.quantite_stock) < 0)
      erreurs.quantite_stock = "La quantité en stock est obligatoire.";
    if (form.seuil_alerte === "" || Number(form.seuil_alerte) < 0)
      erreurs.seuil_alerte = "Le seuil d'alerte est obligatoire.";

    if (!form.date_expiration) {
      erreurs.date_expiration = "La date d'expiration est obligatoire.";
    } else {
      const aujourdHui = new Date();
      aujourdHui.setHours(0, 0, 0, 0);
      const dateExp = new Date(form.date_expiration);
      if (dateExp < aujourdHui) {
        erreurs.date_expiration = "Médicament date dépassée. Impossible d'ajouter un produit déjà expiré.";
      }
    }

    if (!form.categorie) erreurs.categorie = "Veuillez choisir une catégorie.";
    setErrors(erreurs);
    return Object.keys(erreurs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setSaving(true);
    try {
      const payload = { ...form, categorie: Number(form.categorie) };
      if (editId) {
        await produitService.update(editId, payload);
      } else {
        await produitService.create(payload);
      }
      fermerModal();
      charger();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.nom) {
        setErrors({ nom: Array.isArray(data.nom) ? data.nom[0] : data.nom });
      } else if (data?.date_expiration) {
        setErrors({
          date_expiration: Array.isArray(data.date_expiration)
            ? data.date_expiration[0]
            : data.date_expiration,
        });
      } else {
        setErrors({ general: "Une erreur est survenue. Vérifiez les champs." });
      }
    }
  };

  const ouvrirAjout = () => {
    setForm(initialForm);
    setErrors({});
    setEditId(null);
    setShowModal(true);
  };

  const ouvrirEdition = (p) => {
    setForm({
      nom: p.nom, prix_vente: p.prix_vente, quantite_stock: p.quantite_stock,
      seuil_alerte: p.seuil_alerte, date_expiration: p.date_expiration, categorie: p.categorie,
    });
    setErrors({});
    setEditId(p.id);
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setErrors({});
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      await produitService.remove(id);
      charger();
    }
  };

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(produitsFiltres.length / PAR_PAGE));
  const produitsPage = produitsFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  useEffect(() => {
    setPage(1);
  }, [recherche]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <i className="bi bi-capsule me-2"></i>Médicaments
        </h2>
        <button className="btn btn-primary" onClick={ouvrirAjout}>
          <i className="bi bi-plus-circle me-2"></i>Ajouter un produit
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2">
          <div className="input-group" style={{ maxWidth: 400 }}>
            <span className="input-group-text bg-light">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un produit..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th className="text-end">Prix vente</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Seuil</th>
                    <th>Expiration</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produitsPage.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        Aucun produit trouvé.
                      </td>
                    </tr>
                  )}
                  {produitsPage.map((p) => (
                    <tr
                      key={p.id}
                      className={p.en_alerte_stock ? "table-warning" : p.est_expire ? "table-danger" : ""}
                    >
                      <td className="fw-semibold">{p.nom}</td>
                      <td>{p.categorie_libelle}</td>
                      <td className="text-end">{Number(p.prix_vente).toFixed(2)}</td>
                      <td className="text-center">{p.quantite_stock}</td>
                      <td className="text-center">{p.seuil_alerte}</td>
                      <td>{p.date_expiration}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => ouvrirEdition(p)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(p.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="card-footer bg-white d-flex justify-content-center">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        show={showModal}
        title={editId ? "Modifier le produit" : "Ajouter un produit"}
        onClose={fermerModal}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={fermerModal}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm"></span> : editId ? "Modifier" : "Ajouter"}
            </button>
          </>
        }
      >
        {errors.general && <div className="alert alert-danger py-2">{errors.general}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nom du produit</label>
            <input
              name="nom"
              className={`form-control ${errors.nom ? "is-invalid" : ""}`}
              value={form.nom}
              onChange={handleChange}
            />
            {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Prix de vente</label>
              <input
                name="prix_vente"
                type="number"
                step="0.01"
                className={`form-control ${errors.prix_vente ? "is-invalid" : ""}`}
                value={form.prix_vente}
                onChange={handleChange}
              />
              {errors.prix_vente && <div className="invalid-feedback">{errors.prix_vente}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Quantité en stock</label>
              <input
                name="quantite_stock"
                type="number"
                className={`form-control ${errors.quantite_stock ? "is-invalid" : ""}`}
                value={form.quantite_stock}
                onChange={handleChange}
              />
              {errors.quantite_stock && <div className="invalid-feedback">{errors.quantite_stock}</div>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Seuil d'alerte</label>
              <input
                name="seuil_alerte"
                type="number"
                className={`form-control ${errors.seuil_alerte ? "is-invalid" : ""}`}
                value={form.seuil_alerte}
                onChange={handleChange}
              />
              {errors.seuil_alerte && <div className="invalid-feedback">{errors.seuil_alerte}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Date d'expiration</label>
              <input
                name="date_expiration"
                type="date"
                className={`form-control ${errors.date_expiration ? "is-invalid" : ""}`}
                value={form.date_expiration}
                onChange={handleChange}
              />
              {errors.date_expiration && <div className="invalid-feedback">{errors.date_expiration}</div>}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label">Catégorie</label>
            <select
              name="categorie"
              className={`form-select ${errors.categorie ? "is-invalid" : ""}`}
              value={form.categorie}
              onChange={handleChange}
            >
              <option value="">-- Choisir une catégorie --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.libelle}</option>
              ))}
            </select>
            {errors.categorie && <div className="invalid-feedback">{errors.categorie}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
}