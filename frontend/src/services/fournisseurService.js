import api from "../api/axiosConfig";

const BASE = "/fournisseurs/";

export const fournisseurService = {
  getAll: (params) => api.get(BASE, { params }).then((r) => r.data),
  getOne: (id) => api.get(`${BASE}${id}/`).then((r) => r.data),
  create: (payload) => api.post(BASE, payload).then((r) => r.data),
  update: (id, payload) => api.put(`${BASE}${id}/`, payload).then((r) => r.data),
  remove: (id) => api.delete(`${BASE}${id}/`),
};