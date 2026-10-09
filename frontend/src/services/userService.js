import api from "../api/axiosConfig";

const BASE = "/utilisateurs/";

export const userService = {
  getEnAttente: () => api.get(`${BASE}en_attente/`).then((r) => r.data),
  valider: (id) => api.post(`${BASE}${id}/valider/`).then((r) => r.data),
  refuser: (id) => api.post(`${BASE}${id}/refuser/`),
};