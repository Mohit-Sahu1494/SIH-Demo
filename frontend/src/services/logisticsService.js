import api from './api.js';

export const logisticsService = {
  async getAll(stationCode, params = {}) {
    const res = await api.get('/inventory', {
      params: { stationCode, ...params },
    });
    return res.data;
  },

  async getSummary(stationCode) {
    const res = await api.get(`/inventory/summary/${stationCode}`);
    return res.data;
  },

  async updateItem(id, data) {
    const res = await api.patch(`/inventory/${id}`, data);
    return res.data;
  },
};

export default logisticsService;
