import api from './api.js';

export const analyticsService = {
  async getHealthHistory(stationCode, days = 7) {
    const res = await api.get('/analytics/health', {
      params: { stationCode, days },
    });
    return res.data;
  },

  async getEnergyHistory(stationCode, hours = 24) {
    const res = await api.get('/analytics/energy', {
      params: { stationCode, hours },
    });
    return res.data;
  },

  async getEnvironmentHistory(stationCode, hours = 24) {
    const res = await api.get('/analytics/environment', {
      params: { stationCode, hours },
    });
    return res.data;
  },

  async getAlertStats(stationCode) {
    const res = await api.get('/analytics/alerts', {
      params: { stationCode },
    });
    return res.data;
  },
};

export default analyticsService;
