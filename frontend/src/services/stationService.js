import api from './api.js';

export const stationService = {
  async getAll() {
    const res = await api.get('/stations');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/stations/${id}`);
    return res.data;
  },

  async getHealth(code) {
    const res = await api.get(`/stations/${code}/health`);
    return res.data;
  },

  async getInsights(code) {
    const res = await api.get(`/stations/${code}/insights`);
    return res.data;
  },
};

export default stationService;
