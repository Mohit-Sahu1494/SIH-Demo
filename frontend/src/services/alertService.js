import api from './api.js';

export const alertService = {
  async getAll(params = {}) {
    const res = await api.get('/alerts', { params });
    return res.data;
  },

  async getActiveCount(stationCode) {
    const res = await api.get('/alerts/count/active', {
      params: { stationCode },
    });
    return res.data;
  },

  async acknowledge(id, operatorName) {
    const res = await api.patch(`/alerts/${id}/acknowledge`, { operatorName });
    return res.data;
  },

  async resolve(id, operatorName) {
    const res = await api.patch(`/alerts/${id}/resolve`, { operatorName });
    return res.data;
  },
};

export default alertService;
