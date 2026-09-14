import api from './api.js';

export const telemetryService = {
  async getByAsset(assetId, stationCode, limit = 50) {
    const res = await api.get(`/telemetry/${assetId}`, {
      params: { stationCode, limit },
    });
    return res.data;
  },

  async getByParameter(parameter, stationCode, assetId, limit = 30) {
    const res = await api.get(`/telemetry/param/${parameter}`, {
      params: { stationCode, assetId, limit },
    });
    return res.data;
  },
};

export default telemetryService;
