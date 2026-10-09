import React, { useEffect, useState } from "react";
import { categorieService } from "../services/medicamentService";
import Modal from "../components/common/Modal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [libelle, setLibelle] = useState("");
  const [erreur, setErreur] = useState("");
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const charger = async () => {
    setLoading(true);
    const data = await categorieService.getAll();
    setCategories(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ouvrirAjout = () => {
    setLibelle("");
    setErreur("");
    setEditId(null);
    setShowModal(true);
  };

  const ouvrirEdition = (c) => {
    setLibelle(c.libelle);
    setErreur("");
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!libelle.trim()) {
      setErreur("Le nom de la catégorie est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await categorieService.update(editId, { libelle });
      } else {
        await categorieService.create({ libelle });
      }
      setShowModal(false);
      charger();
    } catch (err) {
      setErreur(err?.response?.data?.libelle?.[0] || "Cette catégorie existe déjà.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      try {
        await categorieService.remove(id);
        charger();
      } catch {
        alert("Impossible de supprimer : des produits utilisent encore cette catégorie.");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-tags me-2"></i>Catégories
        </h2>
        <button className="btn btn-primary" onClick={ouvrirAjout}>
          <i className="bi bi-plus-circle me-2"></i>Ajouter une catégorie
        </button>
      </div>

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
                  <th>Libellé</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center text-muted py-4">
                      Aucune catégorie.
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <i className="bi bi-tag me-2 text-secondary"></i>
                      {c.libelle}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => ouvrirEdition(c)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
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
        title={editId ? "Modifier la catégorie" : "Ajouter une catégorie"}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm"></span> : "Enregistrer"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <label className="form-label">Libellé</label>
          <input
            className={`form-control ${erreur ? "is-invalid" : ""}`}
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            autoFocus
          />
          {erreur && <div className="invalid-feedback">{erreur}</div>}
        </form>
      </Modal>
    </div>
  );
}