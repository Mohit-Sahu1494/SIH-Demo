import telemetryService from '../services/telemetryService.js';

export const topicHandlers = {
  async handleAssetTelemetry(stationCode, assetId, payload) {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
      await telemetryService.processAssetTelemetry(stationCode, assetId, data, data.sourceType || 'SIMULATED');
    } catch (err) {
      console.error(`[MQTT Handler] Error handling asset telemetry for ${stationCode}/${assetId}:`, err.message);
    }
  },

  async handleEnvironment(stationCode, payload) {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
      await telemetryService.processEnvironmentTelemetry(stationCode, data, data.sourceType || 'REFERENCE');
    } catch (err) {
      console.error(`[MQTT Handler] Error handling environment telemetry for ${stationCode}:`, err.message);
    }
  },

  async handleEnergy(stationCode, payload) {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
      await telemetryService.processEnergyTelemetry(stationCode, data, data.sourceType || 'SIMULATED');
    } catch (err) {
      console.error(`[MQTT Handler] Error handling energy telemetry for ${stationCode}:`, err.message);
    }
  },
};

export default topicHandlers;
