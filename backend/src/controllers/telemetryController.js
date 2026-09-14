import telemetryRepository from '../repositories/telemetryRepository.js';
import telemetryService from '../services/telemetryService.js';

export const telemetryController = {
  async getByAsset(req, res, next) {
    try {
      const { assetId } = req.params;
      const stationCode = req.query.stationCode || 'BHT';
      const limit = parseInt(req.query.limit || '50', 10);

      const records = await telemetryRepository.getLatestByAsset(stationCode, assetId, limit);
      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      next(err);
    }
  },

  async getByParameter(req, res, next) {
    try {
      const { parameter } = req.params;
      const stationCode = req.query.stationCode || 'BHT';
      const assetId = req.query.assetId;
      const limit = parseInt(req.query.limit || '30', 10);

      const records = await telemetryRepository.getRecentByParameter(stationCode, assetId, parameter, limit);
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
      const { stationCode, assetId, telemetry, sourceType } = req.body;
      const result = await telemetryService.processAssetTelemetry(stationCode, assetId, telemetry, sourceType);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default telemetryController;
