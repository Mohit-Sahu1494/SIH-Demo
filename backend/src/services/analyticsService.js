import { HealthSnapshot } from '../models/HealthSnapshot.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { EnvironmentReading } from '../models/EnvironmentReading.js';
import { Alert } from '../models/Alert.js';

export const analyticsService = {
  async getHealthHistory(stationCode, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const snapshots = await HealthSnapshot.find({
      stationCode: stationCode.toUpperCase(),
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();

    return snapshots.map((s) => ({
      timestamp: s.timestamp,
      overallHealth: s.overallHealth,
      environmentHealth: s.environmentHealth,
      energyHealth: s.energyHealth,
      infrastructureHealth: s.infrastructureHealth,
      logisticsHealth: s.logisticsHealth,
    }));
  },

  async getEnergyHistory(stationCode, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const records = await EnergyReading.find({
      stationCode: stationCode.toUpperCase(),
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(120)
      .lean();

    return records.map((r) => ({
      timestamp: r.timestamp,
      generation: r.generation,
      consumption: r.consumption,
      batteryLevel: r.batteryLevel,
      fuelLevel: r.fuelLevel,
      generatorLoad: r.generatorLoad,
    }));
  },

  async getEnvironmentHistory(stationCode, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const records = await EnvironmentReading.find({
      stationCode: stationCode.toUpperCase(),
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .limit(120)
      .lean();

    return records.map((r) => ({
      timestamp: r.timestamp,
      temperature: r.temperature,
      windSpeed: r.windSpeed,
      pressure: r.pressure,
      humidity: r.humidity,
      visibility: r.visibility,
    }));
  },

  async getAlertStats(stationCode) {
    const filter = {};
    if (stationCode) filter.stationCode = stationCode.toUpperCase();

    const alerts = await Alert.find(filter).lean();
    const severityCount = {
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
      WARNING: alerts.filter((a) => a.severity === 'WARNING').length,
      INFO: alerts.filter((a) => a.severity === 'INFO').length,
    };

    const statusCount = {
      ACTIVE: alerts.filter((a) => a.status === 'ACTIVE').length,
      ACKNOWLEDGED: alerts.filter((a) => a.status === 'ACKNOWLEDGED').length,
      RESOLVED: alerts.filter((a) => a.status === 'RESOLVED').length,
    };

    return {
      totalAlerts: alerts.length,
      severityCount,
      statusCount,
    };
  },
};

export default analyticsService;
