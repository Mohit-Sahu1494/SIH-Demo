// Coupled Telemetry & Operational Simulation Engine
// Models physical interdependencies between Environment -> Heating -> CHP Load -> Fuel Consumption -> Runway

import { STATIONS } from '../data/stationConfig.js';

class TelemetryEngine {
  constructor() {
    this.subscribers = new Set();
    this.intervalId = null;

    // Simulation overrides / Injected failures
    this.injections = {
      chpFailure: false,
      pumpFailure: false,
      satelliteFailure: false,
      extremeCold: false,
      lowFuel: false,
      supplyDelayDays: 0,
    };

    // Environmental baseline
    this.environment = {
      temperature: -16.4,
      windSpeed: 22.3,
      humidity: 26.3,
      pressure: 973,
    };

    // Last telemetry timestamp (seconds elapsed)
    this.telemetryAgeSeconds = 8;
    this.lastSatelliteHeartbeat = Date.now();

    // Start tick loop (runs every 6 seconds)
    this.start();
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 6000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    // emit immediately
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('Error notifying telemetry subscriber:', e);
      }
    });
  }

  // Inject failure modes (for SIH jury demonstrations)
  injectFailure(type, value = true) {
    if (type in this.injections) {
      this.injections[type] = value;
      this.notify();
    }
  }

  resetFailures() {
    this.injections = {
      chpFailure: false,
      pumpFailure: false,
      satelliteFailure: false,
      extremeCold: false,
      lowFuel: false,
      supplyDelayDays: 0,
    };
    this.telemetryAgeSeconds = 6;
    this.notify();
  }

  tick() {
    if (this.injections.satelliteFailure) {
      // If satellite is lost, telemetry age ticks upwards
      this.telemetryAgeSeconds += 6;
    } else {
      this.telemetryAgeSeconds = Math.floor(Math.random() * 4) + 5; // 5 to 8s
      this.lastSatelliteHeartbeat = Date.now();
    }
    this.notify();
  }

  // Calculate coupled station metrics based on current inputs & failure injections
  calculateTelemetry(stationCode = 'BHT') {
    const isBharati = stationCode.toUpperCase() === 'BHT';
    const config = STATIONS[stationCode.toUpperCase()] || STATIONS.BHT;

    // 1. Environment coupled calculations
    let outsideTemp = isBharati ? -16.4 : -18.2;
    let windSpeed = isBharati ? 22.3 : 19.5;

    if (this.injections.extremeCold) {
      outsideTemp = -42.0;
      windSpeed = 38.5;
    }

    // 2. Heating demand calculation:
    // As outside temperature drops, heating demand increases proportionally
    // Baseline: -16°C -> 70% heating demand. Every 5°C drop adds ~8% heating demand
    const tempDeltaFromBaseline = Math.max(0, -16.4 - outsideTemp);
    const heatingDemandPercent = Math.min(98, Math.round(70 + tempDeltaFromBaseline * 1.6));

    // 3. CHP / Power Generation Load:
    // Heating demand requires thermal output from CHPs, plus electrical base load
    let baseChp1Load = 72;
    let baseChp2Load = 64;
    let baseChp3Load = 91;
    let chp3Status = 'Warning';
    let availablePowerKva = 360;

    if (this.injections.extremeCold) {
      baseChp1Load = Math.min(95, baseChp1Load + 14);
      baseChp2Load = Math.min(95, baseChp2Load + 15);
      baseChp3Load = 96;
    }

    if (this.injections.chpFailure) {
      chp3Status = 'Critical';
      baseChp3Load = 0; // Unit tripped
      baseChp1Load = 96; // Overloaded to compensate
      baseChp2Load = 94; // Overloaded to compensate
      availablePowerKva = 240; // Lost 120 kVA capacity
    }

    // 4. Fuel Consumption & Runway:
    // Fuel burn rate scales directly with generator output and auxiliary boilers
    let dailyFuelUseLiters = isBharati ? 4150 : 3820;
    if (this.injections.extremeCold) {
      dailyFuelUseLiters = Math.round(dailyFuelUseLiters * 1.24); // +24% consumption
    }
    if (this.injections.chpFailure) {
      dailyFuelUseLiters = Math.round(dailyFuelUseLiters * 1.15); // Less efficient load curve
    }

    let fuelReservePercent = isBharati ? 61 : 67;
    if (this.injections.lowFuel) {
      fuelReservePercent = 28;
    }

    const currentFuelLiters = Math.round(((isBharati ? 240000 : 200000) * fuelReservePercent) / 100);
    let fuelRunwayDays = Math.floor(currentFuelLiters / dailyFuelUseLiters);

    const baseResupplyDays = config.resupply.daysUntilNext + (this.injections.supplyDelayDays || 0);
    const fuelDeficitDays = Math.max(0, baseResupplyDays - fuelRunwayDays);

    // 5. Water Systems:
    let pumpFlowLh = isBharati ? 3200 : 2800;
    let pumpStatus = 'Healthy';
    if (this.injections.pumpFailure) {
      pumpFlowLh = 0;
      pumpStatus = 'Critical';
    }

    // 6. Satellite Link:
    let satelliteStatus = 'Connected';
    let satelliteLatency = isBharati ? 742 : 685;
    let packetLoss = 1.2;
    if (this.injections.satelliteFailure) {
      satelliteStatus = 'Disconnected';
      satelliteLatency = 0;
      packetLoss = 100;
    }

    // 7. Station Health Score calculation
    let healthScore = config.healthScore;
    if (this.injections.chpFailure) healthScore -= 18;
    if (this.injections.pumpFailure) healthScore -= 14;
    if (this.injections.satelliteFailure) healthScore -= 12;
    if (this.injections.extremeCold) healthScore -= 8;
    if (this.injections.lowFuel) healthScore -= 16;
    healthScore = Math.max(25, Math.min(100, healthScore));

    let stationStatus = 'Operational';
    if (healthScore < 60) stationStatus = 'Critical';
    else if (healthScore < 80) stationStatus = 'Warning';

    return {
      stationCode: stationCode.toUpperCase(),
      stationName: config.name,
      stationStatus,
      healthScore,
      environment: {
        temperature: outsideTemp,
        windSpeed,
        humidity: 26.3,
        pressure: 973,
        source: 'LIVE · NCPOR',
        updatedAt: this.injections.satelliteFailure ? '17 minutes ago' : `${this.telemetryAgeSeconds} sec ago`,
        isStale: this.injections.satelliteFailure,
      },
      power: {
        availableKva: availablePowerKva,
        totalDemandKw: Math.round(availablePowerKva * 0.72),
        chp1: { load: `${baseChp1Load}%`, temp: `${74 + Math.round(baseChp1Load * 0.15)}°C`, status: baseChp1Load > 90 ? 'Warning' : 'Healthy' },
        chp2: { load: `${baseChp2Load}%`, temp: `${72 + Math.round(baseChp2Load * 0.15)}°C`, status: baseChp2Load > 90 ? 'Warning' : 'Healthy' },
        chp3: { load: `${baseChp3Load}%`, temp: this.injections.chpFailure ? 'Overheat / Tripped' : '94°C', status: chp3Status },
      },
      heating: {
        demandPercent: heatingDemandPercent,
        status: heatingDemandPercent > 85 ? 'High Demand' : 'Nominal',
      },
      fuel: {
        reservePercent: fuelReservePercent,
        currentLiters: currentFuelLiters,
        dailyBurnLiters: dailyFuelUseLiters,
        runwayDays: fuelRunwayDays,
        nextResupplyDays: baseResupplyDays,
        deficitDays: fuelDeficitDays,
        isDeficit: fuelDeficitDays > 0,
      },
      water: {
        pumpStatus,
        pumpFlowLh,
        sourceName: config.waterSource,
        reservePercent: this.injections.pumpFailure ? 42 : 78,
      },
      satellite: {
        status: satelliteStatus,
        latencyMs: satelliteLatency,
        packetLoss,
        lastTelemetrySeconds: this.telemetryAgeSeconds,
        isLost: this.injections.satelliteFailure,
      },
      injections: { ...this.injections },
    };
  }

  getState() {
    return {
      BHT: this.calculateTelemetry('BHT'),
      MTR: this.calculateTelemetry('MTR'),
      injections: { ...this.injections },
      telemetryAgeSeconds: this.telemetryAgeSeconds,
    };
  }
}

export const telemetryEngine = new TelemetryEngine();
export default telemetryEngine;
