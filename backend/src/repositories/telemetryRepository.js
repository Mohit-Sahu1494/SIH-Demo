import { Telemetry } from '../models/Telemetry.js';

export const telemetryRepository = {
  async insertMany(records) {
    if (!records || records.length === 0) return [];
    return Telemetry.insertMany(records);
  },

  async insertOne(record) {
    return Telemetry.create(record);
  },

  async getLatestByAsset(stationCode, assetId, limit = 50) {
    return Telemetry.find({
      stationCode: stationCode.toUpperCase(),
      assetId: assetId.toUpperCase(),
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  },

  async getRecentByParameter(stationCode, assetId, parameter, limit = 30) {
    const filter = {
      stationCode: stationCode.toUpperCase(),
      parameter,
    };
    if (assetId) filter.assetId = assetId.toUpperCase();

    const data = await Telemetry.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return data.reverse();
  },

  async getDownsampledHistory(stationCode, assetId, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Telemetry.find({
      stationCode: stationCode.toUpperCase(),
      assetId: assetId.toUpperCase(),
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();
  },
};

export default telemetryRepository;
