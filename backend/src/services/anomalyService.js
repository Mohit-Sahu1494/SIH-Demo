import alertService from './alertService.js';
import assetRepository from '../repositories/assetRepository.js';

export const anomalyService = {
  async evaluateAssetTelemetry(stationCode, assetId, telemetry) {
    const code = stationCode.toUpperCase();
    const id = assetId.toUpperCase();
    const { temperature, vibration, load, oilPressure } = telemetry;

    let status = 'HEALTHY';
    let healthScore = 95;

    // 1. Generator Temperature Anomaly
    if (typeof temperature === 'number') {
      const tempKey = `${code}:${id}:TEMP_ANOMALY`;
      if (temperature > 92) {
        status = 'CRITICAL';
        healthScore = Math.max(25, 95 - (temperature - 90) * 12);
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          severity: 'CRITICAL',
          type: 'OVERHEATING',
          title: `Generator ${id} Overheating Exceeded Critical Safety Threshold`,
          description: `Operating temperature reached ${temperature.toFixed(1)}°C (Safe limit: < 85°C). Critical thermal stress detected.`,
          reason: 'Coolant circulation disruption or continuous heavy load bearing friction.',
          recommendedAction: 'Inspect auxiliary radiator cooling loops immediately and shed 40% electrical load.',
          deduplicationKey: tempKey,
        });
      } else if (temperature > 85) {
        if (status !== 'CRITICAL') status = 'WARNING';
        healthScore = Math.min(healthScore, 75);
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          severity: 'WARNING',
          type: 'TEMPERATURE_ELEVATED',
          title: `Generator ${id} Temperature Elevated`,
          description: `Core temperature is ${temperature.toFixed(1)}°C, trending toward upper safety limit.`,
          reason: 'Ambient ventilation dampers partially restricted or high continuous bus load.',
          recommendedAction: 'Verify airflow ducts and monitor thermal drift.',
          deduplicationKey: tempKey,
        });
      } else {
        // Temperature normal: resolve if previously alerted
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          deduplicationKey: tempKey,
          isNominal: true,
        });
      }
    }

    // 2. Vibration Anomaly
    if (typeof vibration === 'number') {
      const vibKey = `${code}:${id}:VIB_ANOMALY`;
      if (vibration > 3.8) {
        status = 'CRITICAL';
        healthScore = Math.min(healthScore, 35);
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          severity: 'CRITICAL',
          type: 'VIBRATION_SPIKE',
          title: `Generator ${id} Severe Mechanical Vibration`,
          description: `Vibration velocity measured ${vibration.toFixed(2)} mm/s (Nominal: < 2.5 mm/s). Mechanical integrity risk.`,
          reason: 'Flywheel unbalance, bearing sleeve wear, or loose mounting isolators.',
          recommendedAction: 'Transfer critical load to alternate genset and conduct laser shaft alignment.',
          deduplicationKey: vibKey,
        });
      } else if (vibration > 3.0) {
        if (status !== 'CRITICAL') status = 'WARNING';
        healthScore = Math.min(healthScore, 70);
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          severity: 'WARNING',
          type: 'VIBRATION_WARNING',
          title: `Generator ${id} Vibration Rising`,
          description: `Vibration level increased to ${vibration.toFixed(2)} mm/s.`,
          reason: 'Early bearing raceway micro-wear or damper degradation.',
          recommendedAction: 'Schedule acoustic bearing lubrication check.',
          deduplicationKey: vibKey,
        });
      } else {
        await alertService.handleCondition({
          stationCode: code,
          assetId: id,
          deduplicationKey: vibKey,
          isNominal: true,
        });
      }
    }

    // Update asset status and health score in repository
    await assetRepository.updateTelemetryAndHealth(code, id, telemetry, status, healthScore);

    return { status, healthScore };
  },

  async evaluateEnergyTelemetry(stationCode, energy) {
    const code = stationCode.toUpperCase();
    const { batteryLevel, fuelLevel, generatorLoad } = energy;

    // Fuel check
    if (typeof fuelLevel === 'number') {
      const fuelKey = `${code}:ENERGY:FUEL_LOW`;
      if (fuelLevel < 18) {
        await alertService.handleCondition({
          stationCode: code,
          severity: 'CRITICAL',
          type: 'FUEL_CRITICAL',
          title: 'Station Main Fuel Reserve Critically Low',
          description: `Polar aviation-grade diesel fuel reserve down to ${fuelLevel.toFixed(1)}%. Estimated autonomy under 12 days.`,
          reason: 'Extended storm duration preventing scheduled bulk transfer.',
          recommendedAction: 'Activate tier-1 fuel conservation protocol and notify Maitri/Bharati logistics flight coordinator.',
          deduplicationKey: fuelKey,
        });
      } else if (fuelLevel < 30) {
        await alertService.handleCondition({
          stationCode: code,
          severity: 'WARNING',
          type: 'FUEL_WARNING',
          title: 'Main Fuel Reserve Below Warning Threshold',
          description: `Bulk fuel level at ${fuelLevel.toFixed(1)}%.`,
          reason: 'Normal seasonal consumption with cold-weather generator heating demand.',
          recommendedAction: 'Schedule replenishment from secondary reserve tanks.',
          deduplicationKey: fuelKey,
        });
      } else {
        await alertService.handleCondition({
          stationCode: code,
          deduplicationKey: fuelKey,
          isNominal: true,
        });
      }
    }

    // Battery check
    if (typeof batteryLevel === 'number') {
      const batKey = `${code}:ENERGY:BATTERY_LOW`;
      if (batteryLevel < 22) {
        await alertService.handleCondition({
          stationCode: code,
          severity: 'CRITICAL',
          type: 'BATTERY_CRITICAL',
          title: 'Station Emergency UPS Battery Bank Critically Depleted',
          description: `Central LiFePO4 battery state of charge is ${batteryLevel.toFixed(1)}%. Station backup autonomy compromised.`,
          reason: 'Excess bus draw coinciding with generator phase cycling.',
          recommendedAction: 'Prioritize auxiliary generator bus sync to initiate bulk recharge cycle.',
          deduplicationKey: batKey,
        });
      } else {
        await alertService.handleCondition({
          stationCode: code,
          deduplicationKey: batKey,
          isNominal: true,
        });
      }
    }
  },

  async evaluateEnvironmentTelemetry(stationCode, env) {
    const code = stationCode.toUpperCase();
    const { windSpeed, temperature } = env;

    const weatherKey = `${code}:ENV:STORM`;
    if (windSpeed > 85) {
      await alertService.handleCondition({
        stationCode: code,
        severity: 'CRITICAL',
        type: 'EXTREME_BLIZZARD',
        title: 'Severe Polar Blizzard Warning (Cat-3 Gale)',
        description: `Sustained Antarctic katabatic winds reaching ${windSpeed.toFixed(1)} km/h with zero ground visibility.`,
        reason: 'Intense polar vortex pressure trough moving across Larsemann / Schirmacher Hills.',
        recommendedAction: 'Enforce station lock-down: cease all outdoor scientific fieldwork and tether satellite radomes.',
        deduplicationKey: weatherKey,
      });
    } else {
      await alertService.handleCondition({
        stationCode: code,
        deduplicationKey: weatherKey,
        isNominal: true,
      });
    }
  },
};

export default anomalyService;
