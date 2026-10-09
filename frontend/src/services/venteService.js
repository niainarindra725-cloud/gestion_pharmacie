import api from "../api/axiosConfig";

const BASE_PANIER = "/paniers/";
const BASE_FACTURE = "/factures/";
const BASE_PAIEMENT = "/paiements/";

export const panierService = {
  getAll: (params) => api.get(BASE_PANIER, { params }).then((r) => r.data),
  getOne: (id) => api.get(`${BASE_PANIER}${id}/`).then((r) => r.data),
  create: (payload) => api.post(BASE_PANIER, payload).then((r) => r.data),
  ajouterLigne: (panierId, payload) =>
    api.post(`${BASE_PANIER}${panierId}/ajouter_ligne/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`${BASE_PANIER}${id}/`),
};

export const factureService = {
  getAll: (params) => api.get(BASE_FACTURE, { params }).then((r) => r.data),
  getOne: (id) => api.get(`${BASE_FACTURE}${id}/`).then((r) => r.data),
  genererDepuisPanier: (panierId) =>
    api.post(`${BASE_FACTURE}generer/`, { panier_id: panierId }).then((r) => r.data),
  statistiques7Jours: () => api.get(`${BASE_FACTURE}statistiques/`).then((r) => r.data),
  totalVentes: () => api.get(`${BASE_FACTURE}total_ventes/`).then((r) => r.data),
};


export const paiementService = {
  getAll: (params) => api.get(BASE_PAIEMENT, { params }).then((r) => r.data),
  create: (payload) => api.post(BASE_PAIEMENT, payload).then((r) => r.data),
};