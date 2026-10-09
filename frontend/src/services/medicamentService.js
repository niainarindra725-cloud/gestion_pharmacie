import api from "../api/axiosConfig";

const BASE_PRODUIT = "/produits/";
const BASE_CATEGORIE = "/categories/";

export const categorieService = {
  getAll: () => api.get(BASE_CATEGORIE).then((r) => r.data),
  create: (payload) => api.post(BASE_CATEGORIE, payload).then((r) => r.data),
  update: (id, payload) => api.put(`${BASE_CATEGORIE}${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`${BASE_CATEGORIE}${id}/`),
};

export const produitService = {
  getAll: (params) => api.get(BASE_PRODUIT, { params }).then((r) => r.data),
  getOne: (id) => api.get(`${BASE_PRODUIT}${id}/`).then((r) => r.data),
  create: (payload) => api.post(BASE_PRODUIT, payload).then((r) => r.data),
  update: (id, payload) => api.put(`${BASE_PRODUIT}${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`${BASE_PRODUIT}${id}/`),
  alertesStock: () => api.get(`${BASE_PRODUIT}alertes_stock/`).then((r) => r.data),
  bientotExpires: () => api.get(`${BASE_PRODUIT}bientot_expires/`).then((r) => r.data),
};