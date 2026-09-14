import { create } from 'zustand';
import authService from '../services/authService.js';

const storedUser = localStorage.getItem('polar_twin_user');
const storedToken = localStorage.getItem('polar_twin_token');

export const useAuthStore = create((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      // data: { user: { id, name, email, role }, token }
      localStorage.setItem('polar_twin_user', JSON.stringify(data.user));
      localStorage.setItem('polar_twin_token', data.token);

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    authService.logout();
    localStorage.removeItem('polar_twin_user');
    localStorage.removeItem('polar_twin_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('polar_twin_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
