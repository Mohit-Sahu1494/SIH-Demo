import api from './api.js';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('polar_twin_token', res.data.token);
      localStorage.setItem('polar_twin_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data?.token) {
      localStorage.setItem('polar_twin_token', res.data.token);
      localStorage.setItem('polar_twin_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('polar_twin_token');
    localStorage.removeItem('polar_twin_user');
  },
};

export default authService;
