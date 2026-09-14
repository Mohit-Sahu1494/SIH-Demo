import telemetryRepository from '../repositories/telemetryRepository.js';
import anomalyService from './anomalyService.js';
import healthService from './healthService.js';
import { Station } from '../models/Station.js';
import { Asset } from '../models/Asset.js';
import { EnvironmentReading } from '../models/EnvironmentReading.js';
import { EnergyReading } from '../models/EnergyReading.js';

let socketServerRef = null;

export const telemetryService = {
  setSocketServer(io) {
    socketServerRef = io;
  },

  async processAssetTelemetry(stationCode, assetId, telemetryData, sourceType = 'SIMULATED') {
    const code = stationCode.toUpperCase();
    const id = assetId.toUpperCase();
    const station = await Station.findOne({ code }).lean();
    if (!station) return;

    // 1. Run rule-based anomaly detection & update asset telemetry
    const { status, healthScore } = await anomalyService.evaluateAssetTelemetry(code, id, telemetryData);

    // 2. Persist individual parameter readings to Telemetry collection
    const timestamp = telemetryData.timestamp ? new Date(telemetryData.timestamp) : new Date();
    const records = [];

    for (const [key, val] of Object.entries(telemetryData)) {
      if (typeof val === 'number') {
        let unit = '';
        if (key === 'temperature') unit = '°C';
        else if (key === 'vibration') unit = 'mm/s';
        else if (key === 'load') unit = '%';
        else if (key === 'oilPressure') unit = 'bar';
        else if (key === 'fuelConsumption') unit = 'L/hr';
        else if (key === 'rpm') unit = 'RPM';

        records.push({
          stationId: station._id,
          stationCode: code,
          assetId: id,
          parameter: key,
          value: val,
          unit,
          timestamp,
          sourceType,
        });
      }
    }

    if (records.length > 0) {
      await telemetryRepository.insertMany(records).catch((e) => {
        // silent catch to prevent loop block
      });
    }

    // Update asset in MongoDB
    try {
      await Asset.findOneAndUpdate(
        { code, assetId: id },
        {
          status,
          healthScore,
          currentTelemetry: telemetryData,
          updatedAt: new Date(),
        }
      );
    } catch (e) {
      // ignore
    }

    // 3. Recalculate station dynamic health
    const healthResult = await healthService.computeStationHealth(code);

    // 4. Broadcast via Socket.IO
    if (socketServerRef) {
      socketServerRef.emit('telemetry-update', {
        stationCode: code,
        assetId: id,
        telemetry: telemetryData,
        status,
        healthScore,
        timestamp,
      });

      if (healthResult) {
        socketServerRef.emit('station-health-update', healthResult);
      }

      socketServerRef.emit('asset-update', {
        stationCode: code,
        assetId: id,
        status,
        healthScore,
        currentTelemetry: telemetryData,
      });
    }

    return { status, healthScore, healthResult };
  },

  async processEnvironmentTelemetry(stationCode, envData, sourceType = 'SIMULATED') {
    const code = stationCode.toUpperCase();
    const station = await Station.findOne({ code }).lean();
    if (!station) return;

    // Persist to MongoDB EnvironmentReading
    try {
      await EnvironmentReading.create({
        stationId: station._id,
        stationCode: code,
        temperature: envData.temperature,
        humidity: envData.humidity,
        pressure: envData.pressure,
        windSpeed: envData.windSpeed,
        windDirection: envData.windDirection,
        visibility: envData.visibility,
        snow: envData.snow,
        sourceType,
        timestamp: envData.timestamp ? new Date(envData.timestamp) : new Date(),
      });
    } catch (e) {
      console.warn('[TelemetryService] Error saving environment record:', e.message);
    }

    await anomalyService.evaluateEnvironmentTelemetry(code, envData);
    const healthResult = await healthService.computeStationHealth(code);

    if (socketServerRef) {
      socketServerRef.emit('environment-update', {
        stationCode: code,
        data: envData,
        timestamp: new Date(),
        sourceType,
      });

      if (healthResult) {
        socketServerRef.emit('station-health-update', healthResult);
      }
    }
  },

  async processEnergyTelemetry(stationCode, energyData, sourceType = 'SIMULATED') {
    const code = stationCode.toUpperCase();
    const station = await Station.findOne({ code }).lean();
    if (!station) return;

    // Persist to MongoDB EnergyReading
    try {
      await EnergyReading.create({
        stationId: station._id,
        stationCode: code,
        generation: energyData.generation,
        consumption: energyData.consumption,
        batteryLevel: energyData.batteryLevel,
        fuelLevel: energyData.fuelLevel,
        generatorLoad: energyData.generatorLoad,
        peakLoad: energyData.peakLoad,
        efficiency: energyData.efficiency,
        sourceType,
        timestamp: energyData.timestamp ? new Date(energyData.timestamp) : new Date(),
      });
    } catch (e) {
      console.warn('[TelemetryService] Error saving energy record:', e.message);
    }

    await anomalyService.evaluateEnergyTelemetry(code, energyData);
    const healthResult = await healthService.computeStationHealth(code);

    if (socketServerRef) {
      socketServerRef.emit('energy-update', {
        stationCode: code,
        data: energyData,
        timestamp: new Date(),
        sourceType,
      });

      if (healthResult) {
        socketServerRef.emit('station-health-update', healthResult);
      }
    }
  },
};

export default telemetryService;
