import api from "../api/axiosConfig";

const BASE = "/approvisionnements/";

export const stockService = {
  getAll: (params) => api.get(BASE, { params }).then((r) => r.data),
  getOne: (id) => api.get(`${BASE}${id}/`).then((r) => r.data),
  create: (payload) => api.post(BASE, payload).then((r) => r.data),
  remove: (id) => api.delete(`${BASE}${id}/`),
};