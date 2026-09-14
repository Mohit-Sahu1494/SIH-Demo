import { Asset } from '../models/Asset.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { EnvironmentReading } from '../models/EnvironmentReading.js';
import { HealthSnapshot } from '../models/HealthSnapshot.js';
import { Station } from '../models/Station.js';

export const healthService = {
  weights: {
    environment: 0.20,
    energy: 0.25,
    infrastructure: 0.35,
    logistics: 0.20,
  },

  async calculateInfrastructureHealth(stationCode) {
    const assets = await Asset.find({ stationCode: stationCode.toUpperCase() }).lean();
    if (!assets || assets.length === 0) return 90;

    let totalScore = 0;
    let criticalPenalty = 0;
    let warningPenalty = 0;

    for (const asset of assets) {
      const score = typeof asset.healthScore === 'number' ? asset.healthScore : 90;
      totalScore += score;

      if (asset.status === 'CRITICAL') {
        criticalPenalty += 12;
      } else if (asset.status === 'WARNING') {
        warningPenalty += 4;
      }
    }

    const avgScore = totalScore / assets.length;
    const finalScore = Math.max(10, Math.min(100, Math.round(avgScore - criticalPenalty - warningPenalty)));
    return finalScore;
  },

  async calculateEnergyHealth(stationCode) {
    const latest = await EnergyReading.findOne({ stationCode: stationCode.toUpperCase() })
      .sort({ timestamp: -1 })
      .lean();

    if (!latest) return 88;

    let score = 100;
    // Battery penalty
    if (latest.batteryLevel < 20) score -= 35;
    else if (latest.batteryLevel < 40) score -= 15;
    else if (latest.batteryLevel < 60) score -= 5;

    // Fuel penalty
    if (latest.fuelLevel < 20) score -= 30;
    else if (latest.fuelLevel < 35) score -= 15;

    // Generator load penalty (overload)
    if (latest.generatorLoad > 95) score -= 25;
    else if (latest.generatorLoad > 85) score -= 10;

    return Math.max(10, Math.min(100, Math.round(score)));
  },

  async calculateLogisticsHealth(stationCode) {
    const items = await InventoryItem.find({ stationCode: stationCode.toUpperCase() }).lean();
    if (!items || items.length === 0) return 92;

    let score = 100;
    for (const item of items) {
      if (item.status === 'CRITICAL' || item.daysRemaining < 7) {
        score -= 15;
      } else if (item.status === 'WARNING' || item.daysRemaining < 21) {
        score -= 5;
      }
    }

    return Math.max(10, Math.min(100, Math.round(score)));
  },

  async calculateEnvironmentHealth(stationCode) {
    const env = await EnvironmentReading.findOne({ stationCode: stationCode.toUpperCase() })
      .sort({ timestamp: -1 })
      .lean();

    if (!env) return 94;

    let score = 100;
    // Blizzard / high wind penalty
    if (env.windSpeed > 80) score -= 25;
    else if (env.windSpeed > 55) score -= 10;

    // Extreme cold penalty
    if (env.temperature < -45) score -= 20;
    else if (env.temperature < -35) score -= 8;

    // Visibility penalty
    if (env.visibility < 1) score -= 15;

    return Math.max(15, Math.min(100, Math.round(score)));
  },

  async computeStationHealth(stationCode) {
    const code = stationCode.toUpperCase();
    const station = await Station.findOne({ code }).lean();
    if (!station) return null;

    const [envHealth, energyHealth, infraHealth, logisticsHealth] = await Promise.all([
      this.calculateEnvironmentHealth(code),
      this.calculateEnergyHealth(code),
      this.calculateInfrastructureHealth(code),
      this.calculateLogisticsHealth(code),
    ]);

    const overallHealth = Math.round(
      envHealth * this.weights.environment +
      energyHealth * this.weights.energy +
      infraHealth * this.weights.infrastructure +
      logisticsHealth * this.weights.logistics
    );

    const breakdown = {
      environment: envHealth,
      energy: energyHealth,
      infrastructure: infraHealth,
      logistics: logisticsHealth,
    };

    // Update station in database
    await Station.updateOne(
      { code },
      {
        $set: {
          healthScore: overallHealth,
          healthBreakdown: breakdown,
          status: overallHealth < 50 ? 'CRITICAL' : overallHealth < 75 ? 'WARNING' : 'OPERATIONAL',
        },
      }
    );

    // Record health snapshot
    await HealthSnapshot.create({
      stationId: station._id,
      stationCode: code,
      overallHealth,
      environmentHealth: envHealth,
      energyHealth,
      infrastructureHealth: infraHealth,
      logisticsHealth,
      timestamp: new Date(),
    });

    return {
      stationCode: code,
      overallHealth,
      breakdown,
      weights: this.weights,
    };
  },
};

export default healthService;
