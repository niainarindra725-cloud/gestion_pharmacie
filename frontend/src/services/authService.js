import api from "../api/axiosConfig";

export const authService = {
  async login(username, password) {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return data;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register/", payload);
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password/", { email });
    return data;
  },

  async resetPassword(uid, token, newPassword) {
    const { data } = await api.post("/auth/reset-password/", {
      uid,
      token,
      new_password: newPassword,
    });
    return data;
  },

  async me() {
    const { data } = await api.get("/auth/me/");
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};