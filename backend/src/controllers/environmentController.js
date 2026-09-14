import { EnvironmentReading } from '../models/EnvironmentReading.js';
import telemetryService from '../services/telemetryService.js';

export const environmentController = {
  async getLatest(req, res, next) {
    try {
      const raw = req.params.stationId || req.query.stationCode || 'BHT';
      const stationCode = raw.toLowerCase() === 'maitri' || raw.toUpperCase() === 'MTR' ? 'MTR' : 'BHT';
      const latest = await EnvironmentReading.findOne({ stationCode })
        .sort({ timestamp: -1 })
        .lean();

      res.json({
        success: true,
        data: latest || {
          stationCode,
          temperature: -26.4,
          humidity: 68,
          pressure: 988,
          windSpeed: 32.4,
          windDirection: 'ESE',
          visibility: 18,
          snow: 'Light Flurries',
          sourceType: 'SIMULATED',
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const stationCode = req.query.stationCode || 'BHT';
      const range = req.query.range || '24h';
      let hours = 24;
      if (range === '7d') hours = 168;
      if (range === '30d') hours = 720;

      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const records = await EnvironmentReading.find({
        stationCode: stationCode.toUpperCase(),
        timestamp: { $gte: since },
      })
        .sort({ timestamp: 1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  },

  async ingest(req, res, next) {
    try {
      const { stationCode, ...data } = req.body;
      const reading = await EnvironmentReading.create({
        stationCode: stationCode.toUpperCase(),
        ...data,
      });
      await telemetryService.processEnvironmentTelemetry(stationCode, data);
      res.status(201).json({
        success: true,
        data: reading,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default environmentController;
