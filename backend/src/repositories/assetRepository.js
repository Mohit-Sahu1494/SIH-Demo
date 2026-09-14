import { Asset } from '../models/Asset.js';

export const assetRepository = {
  async findByStationCode(stationCode, query = {}) {
    const filter = { stationCode: stationCode.toUpperCase() };
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status.toUpperCase();
    return Asset.find(filter).sort({ category: 1, assetId: 1 }).lean();
  },

  async findByAssetId(stationCode, assetId) {
    return Asset.findOne({
      stationCode: stationCode.toUpperCase(),
      assetId: assetId.toUpperCase(),
    }).lean();
  },

  async findById(id) {
    return Asset.findById(id).populate('stationId').lean();
  },

  async updateTelemetryAndHealth(stationCode, assetId, telemetry, status, healthScore) {
    const update = {
      $set: {
        'currentTelemetry.temperature': telemetry.temperature,
        'currentTelemetry.vibration': telemetry.vibration,
        'currentTelemetry.load': telemetry.load,
        'currentTelemetry.oilPressure': telemetry.oilPressure,
        'currentTelemetry.fuelConsumption': telemetry.fuelConsumption,
        'currentTelemetry.rpm': telemetry.rpm,
        'currentTelemetry.lastUpdated': new Date(),
      },
    };

    if (status) update.$set.status = status;
    if (typeof healthScore === 'number') update.$set.healthScore = healthScore;

    return Asset.findOneAndUpdate(
      { stationCode: stationCode.toUpperCase(), assetId: assetId.toUpperCase() },
      update,
      { new: true }
    ).lean();
  },

  async getCategoryHealthBreakdown(stationCode) {
    const assets = await Asset.find({ stationCode: stationCode.toUpperCase() }).lean();
    const categories = ['Power', 'Buildings', 'Utilities', 'Equipment', 'Communication', 'Logistics'];
    
    const summary = {};
    for (const cat of categories) {
      const catAssets = assets.filter((a) => a.category === cat);
      if (catAssets.length === 0) {
        summary[cat] = { health: 100, count: 0, healthy: 0, warning: 0, critical: 0, offline: 0 };
        continue;
      }
      const avgHealth = Math.round(
        catAssets.reduce((sum, a) => sum + (a.healthScore || 0), 0) / catAssets.length
      );
      summary[cat] = {
        health: avgHealth,
        count: catAssets.length,
        healthy: catAssets.filter((a) => a.status === 'HEALTHY').length,
        warning: catAssets.filter((a) => a.status === 'WARNING').length,
        critical: catAssets.filter((a) => a.status === 'CRITICAL').length,
        offline: catAssets.filter((a) => a.status === 'OFFLINE').length,
      };
    }
    return summary;
  },
};

export default assetRepository;
