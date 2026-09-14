import { EnergyReading } from '../models/EnergyReading.js';
import telemetryService from '../services/telemetryService.js';

export const energyController = {
  async getLatest(req, res, next) {
    try {
      const raw = req.params.stationId || req.query.stationCode || 'BHT';
      const stationCode = raw.toLowerCase() === 'maitri' || raw.toUpperCase() === 'MTR' ? 'MTR' : 'BHT';
      const latest = await EnergyReading.findOne({ stationCode })
        .sort({ timestamp: -1 })
        .lean();

      res.json({
        success: true,
        data: latest || {
          stationCode,
          generation: 168.0,
          consumption: 144.0,
          batteryLevel: 88.0,
          fuelLevel: 76.5,
          generatorLoad: 72.0,
          peakLoad: 184,
          efficiency: 91,
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
      const records = await EnergyReading.find({
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
      const reading = await EnergyReading.create({
        stationCode: stationCode.toUpperCase(),
        ...data,
      });
      await telemetryService.processEnergyTelemetry(stationCode, data);
      res.status(201).json({
        success: true,
        data: reading,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default energyController;
