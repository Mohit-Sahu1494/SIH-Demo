import api from './api.js';

export const maintenanceService = {
  async getAll(stationCode, status) {
    const res = await api.get('/maintenance', {
      params: { stationCode, status },
    });
    return res.data;
  },

  async getRecommendations(stationCode) {
    const res = await api.get(`/maintenance/recommendations/${stationCode}`);
    return res.data;
  },

  async create(data) {
    const res = await api.post('/maintenance', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.patch(`/maintenance/${id}`, data);
    return res.data;
  },
};

export default maintenanceService;
