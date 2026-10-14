import React, { useEffect, useState } from "react";
import { fournisseurService } from "../services/fournisseurService";
import Pagination from "../components/common/Pagination";

const PAR_PAGE = 6;
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

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [form, setForm] = useState({ nom: "", telephone: "" });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const charger = async () => {
    setLoading(true);
    const data = await fournisseurService.getAll({ page_size: 200 });
    setFournisseurs(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleNomChange = (e) => setForm({ ...form, nom: e.target.value });

  const handleTelephoneChange = (e) => {
    const val = e.target.value;
    if (TEL_CARACTERES_REGEX.test(val)) {
      setForm({ ...form, telephone: val });
    }
  };

  const valider = () => {
    const erreurs = {};
    const nom = form.nom.trim();
    if (!nom) {
      erreurs.nom = "Le nom est obligatoire.";
    } else if (!NOM_REGEX.test(nom)) {
      erreurs.nom = "Le nom ne doit contenir que des lettres.";
    }

    if (form.telephone) {
      const erreurTel = validerTelephone(form.telephone);
      if (erreurTel) erreurs.telephone = erreurTel;
    }

    setErrors(erreurs);
    return Object.keys(erreurs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setSaving(true);
    try {
      if (editId) {
        await fournisseurService.update(editId, form);
      } else {
        await fournisseurService.create(form);
      }
      setForm({ nom: "", telephone: "" });
      setErrors({});
      setEditId(null);
      charger();
    } catch (err) {
      const data = err?.response?.data;
      setErrors({
        nom: data?.nom?.[0],
        telephone: data?.telephone?.[0],
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setForm({ nom: f.nom, telephone: f.telephone || "" });
    setErrors({});
    setEditId(f.id);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nom: "", telephone: "" });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce fournisseur ?")) {
      await fournisseurService.remove(id);
      charger();
    }
  };

  const totalPages = Math.max(1, Math.ceil(fournisseurs.length / PAR_PAGE));
  const fournisseursPage = fournisseurs.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

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
                className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                placeholder="Nom du fournisseur"
                value={form.nom}
                onChange={handleNomChange}
              />
              {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted">Téléphone</label>
              <input
                name="telephone"
                className={`form-control ${errors.telephone ? "is-invalid" : ""}`}
                placeholder="0XX XX XXX XX ou +261 XX XX XXX XX"
                value={form.telephone}
                onChange={handleTelephoneChange}
              />
              {errors.telephone && <div className="invalid-feedback">{errors.telephone}</div>}
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
          <>
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
                  {fournisseursPage.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        Aucun fournisseur enregistré.
                      </td>
                    </tr>
                  )}
                  {fournisseursPage.map((f) => (
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

            {totalPages > 1 && (
              <div className="card-footer bg-white d-flex justify-content-center">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}