import api from './api.js';

export const energyService = {
  async getLatest(stationCode) {
    const res = await api.get('/energy/latest', {
      params: { stationCode },
    });
    return res.data;
  },

  async getHistory(stationCode, range = '24h') {
    const res = await api.get('/energy/history', {
      params: { stationCode, range },
    });
    return res.data;
  },
};

export default energyService;
