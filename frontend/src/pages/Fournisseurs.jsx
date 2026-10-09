import React, { useEffect, useState } from "react";
import { fournisseurService } from "../services/fournisseurService";

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [form, setForm] = useState({ nom: "", telephone: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const charger = async () => {
    setLoading(true);
    const data = await fournisseurService.getAll();
    setFournisseurs(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await fournisseurService.update(editId, form);
      } else {
        await fournisseurService.create(form);
      }
      setForm({ nom: "", telephone: "" });
      setEditId(null);
      charger();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setForm({ nom: f.nom, telephone: f.telephone || "" });
    setEditId(f.id);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nom: "", telephone: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce fournisseur ?")) {
      await fournisseurService.remove(id);
      charger();
    }
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-truck me-2"></i>Fournisseurs
      </h2>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold">
          <i className={`bi ${editId ? "bi-pencil-square" : "bi-plus-circle"} me-2`}></i>
          {editId ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label small text-muted">Nom</label>
              <input
                name="nom"
                className="form-control"
                placeholder="Nom du fournisseur"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Téléphone</label>
              <input
                name="telephone"
                className="form-control"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-fill" disabled={saving}>
                {saving ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : editId ? (
                  "Modifier"
                ) : (
                  "Ajouter"
                )}
              </button>
              {editId && (
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
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
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      Aucun fournisseur enregistré.
                    </td>
                  </tr>
                )}
                {fournisseurs.map((f) => (
                  <tr key={f.id}>
                    <td className="fw-semibold">
                      <i className="bi bi-building me-2 text-secondary"></i>
                      {f.nom}
                    </td>
                    <td>{f.telephone || <span className="text-muted">—</span>}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(f)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(f.id)}
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
    </div>
  );
}