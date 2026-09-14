import api from './api.js';

export const assetService = {
  async getAll(stationCode, params = {}) {
    const res = await api.get('/assets', {
      params: { stationCode, ...params },
    });
    return res.data;
  },

  async getById(id, stationCode) {
    const res = await api.get(`/assets/${id}`, {
      params: { stationCode },
    });
    return res.data;
  },

  async getBreakdown(stationCode) {
    const res = await api.get(`/assets/breakdown/${stationCode}`);
    return res.data;
  },
};

export default assetService;
