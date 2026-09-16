// Coupled Telemetry & Operational Simulation Engine
// Models physical interdependencies between Environment -> Heating -> CHP Load -> Fuel Consumption -> Runway
// Fully connected to Backend via Socket.IO and REST with a synchronized 7-second real-time cycle

import { io } from 'socket.io-client';
import { STATIONS } from '../data/stationConfig.js';
import useDashboardStore from '../store/dashboardStore.js';

const BACKEND_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class TelemetryEngine {
  constructor() {
    this.subscribers = new Set();
    this.intervalId = null;
    this.secondTickerId = null;
    this.socket = null;
    this.isBackendConnected = false;

    // Simulation overrides & scenario stress parameters
    this.scenarioStress = {
      temperature: -16.4,
      supplyDelayDays: 0,
      chpFailure: 'None', // 'None' | 'CHP-1' | 'CHP-2' | 'CHP-3' | 'DG-1' | 'DG-2' | 'DG-3'
      windSeverity: 'Normal', // 'Normal' | 'High' | 'Extreme'
      satelliteConn: 'Normal', // 'Normal' | 'Degraded' | 'Offline'
      waterPumpStatus: 'Normal', // 'Normal' | 'Failed'
      fuelReservePercent: 61, // 0 to 100
      generatorTempOverheat: false,
    };

    // Environmental baseline
    this.environment = {
      temperature: -16.4,
      windSpeed: 22.3,
      humidity: 26.3,
      pressure: 973,
    };

    // Real-time telemetry ticker (7-second heartbeat cycle)
    this.telemetryAgeSeconds = 0;
    this.lastTickTimestamp = Date.now();
    this.tickCycleSeconds = 7;
    this.tickCount = 0;

    // Initialize backend socket and start 7-second engine loop
    this.initSocket();
    this.start();
  }

  initSocket() {
    try {
      this.socket = io(BACKEND_SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 25,
        reconnectionDelay: 2000,
        timeout: 8000,
      });

      this.socket.on('connect', () => {
        this.isBackendConnected = true;
        this.socket.emit('join-station', 'BHT');
        this.socket.emit('join-station', 'MTR');
        this.notify();
      });

      this.socket.on('disconnect', () => {
        this.isBackendConnected = false;
        this.notify();
      });

      this.socket.on('connect_error', () => {
        this.isBackendConnected = false;
      });

      // Handle backend live telemetry updates
      this.socket.on('environment-update', (payload) => {
        if (payload?.data?.temperature !== undefined) {
          this.environment.temperature = payload.data.temperature;
        }
        this.resetAgeTicker();
        this.notify();
      });

      this.socket.on('energy-update', (payload) => {
        if (payload?.data?.batteryLevel !== undefined) {
          if (this.scenarioStress.batteryLevel === undefined || this.scenarioStress.batteryLevel === 88) {
            this.scenarioStress.batteryLevel = payload.data.batteryLevel;
          }
        }
        this.resetAgeTicker();
        this.notify();
      });

      this.socket.on('scenario-stress-update', (payload) => {
        if (payload?.params) {
          this.scenarioStress = { ...this.scenarioStress, ...payload.params };
          this.notify();
        }
      });

      this.socket.on('scenario-changed', (payload) => {
        if (payload?.name === 'NORMAL') {
          this.resetScenarioStress(false);
        } else if (payload?.name === 'GENERATOR_FAILURE') {
          this.scenarioStress.chpFailure = 'CHP-3';
          this.scenarioStress.generatorTempOverheat = true;
          this.notify();
        } else if (payload?.name === 'LOW_FUEL') {
          this.scenarioStress.fuelReservePercent = 18;
          this.notify();
        } else if (payload?.name === 'EXTREME_WEATHER') {
          this.scenarioStress.temperature = -42.0;
          this.scenarioStress.windSeverity = 'Extreme';
          this.notify();
        }
      });
    } catch (err) {
      console.warn('[TelemetryEngine] Socket init notice:', err.message);
    }
  }

  start() {
    if (this.intervalId) return;

    // 1. Synchronized 7-second heartbeat cycle
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickCycleSeconds * 1000);

    // 2. Continuous 1-second ticker for precise "X seconds ago" live indicators
    this.secondTickerId = setInterval(() => {
      this.telemetryAgeSeconds++;
      if (this.telemetryAgeSeconds >= this.tickCycleSeconds + 1) {
        this.telemetryAgeSeconds = 0;
      }
      this.notify();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.secondTickerId) {
      clearInterval(this.secondTickerId);
      this.secondTickerId = null;
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const state = this.getState();
    const activeTel = state.BHT || {};

    // Keep useDashboardStore in real-time sync
    try {
      const store = useDashboardStore.getState();
      if (store?.updateEnergy && activeTel?.battery) {
        store.updateEnergy({
          batteryLevel: activeTel.battery.levelPercent,
          fuelLevel: activeTel.fuel?.reservePercent || 61,
          generatorLoad: parseFloat(activeTel.power?.chp1?.load || '72'),
          generation: activeTel.power?.availableKva ? Math.round(activeTel.power.availableKva * 0.72) : 168,
          consumption: activeTel.power?.totalDemandKw || 144,
        });

        store.updateAssetTelemetry(
          'BAT-01',
          {
            temperature: parseFloat(String(activeTel.battery.temperature)),
            load: activeTel.battery.loadPercent,
            level: activeTel.battery.levelPercent,
          },
          activeTel.battery.status === 'Critical' ? 'CRITICAL' : activeTel.battery.status === 'Warning' ? 'WARNING' : 'HEALTHY',
          activeTel.battery.healthScore
        );
      }
    } catch (e) {
      // safe fallback
    }

    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('Error notifying telemetry subscriber:', e);
      }
    });
  }

  resetAgeTicker() {
    this.telemetryAgeSeconds = 0;
    this.lastTickTimestamp = Date.now();
  }

  tick() {
    this.tickCount++;
    this.resetAgeTicker();

    // Natural micro-fluctuation in nominal environment if not severely overridden
    if (this.scenarioStress.temperature === -16.4) {
      const fluctuation = (((this.tickCount * 3) % 7) - 3) * 0.08;
      this.environment.temperature = +(-16.4 + fluctuation).toFixed(1);
    }

    this.notify();
  }

  // Apply real-time scenario stress parameters
  applyScenarioStress(params = {}) {
    this.scenarioStress = {
      ...this.scenarioStress,
      ...params,
    };

    this.resetAgeTicker();
    this.notify();

    // Sync to backend via REST
    fetch(`${BACKEND_API_URL}/scenarios/stress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.scenarioStress),
    }).catch(() => {
      // Offline fallback: purely client-driven simulation remains active
    });
  }

  resetScenarioStress(notifyBackend = true) {
    this.scenarioStress = {
      temperature: -16.4,
      supplyDelayDays: 0,
      chpFailure: 'None',
      windSeverity: 'Normal',
      satelliteConn: 'Normal',
      waterPumpStatus: 'Normal',
      fuelReservePercent: 61,
      generatorTempOverheat: false,
    };

    this.resetAgeTicker();
    this.notify();

    if (notifyBackend) {
      fetch(`${BACKEND_API_URL}/scenarios/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  }

  // Legacy injection support for DemoControlBar
  injectFailure(type, value = true) {
    if (type === 'extremeCold') {
      this.applyScenarioStress({ temperature: value ? -42.0 : -16.4, windSeverity: value ? 'Extreme' : 'Normal' });
    } else if (type === 'chpFailure') {
      this.applyScenarioStress({ chpFailure: value ? 'CHP-3' : 'None', generatorTempOverheat: value });
    } else if (type === 'lowFuel') {
      this.applyScenarioStress({ fuelReservePercent: value ? 22 : 61 });
    } else if (type === 'pumpFailure') {
      this.applyScenarioStress({ waterPumpStatus: value ? 'Failed' : 'Normal' });
    } else if (type === 'satelliteFailure') {
      this.applyScenarioStress({ satelliteConn: value ? 'Offline' : 'Normal' });
    }
  }

  resetFailures() {
    this.resetScenarioStress(true);
  }

  get injections() {
    return {
      chpFailure: this.scenarioStress.chpFailure !== 'None',
      pumpFailure: this.scenarioStress.waterPumpStatus === 'Failed',
      satelliteFailure: this.scenarioStress.satelliteConn === 'Offline',
      extremeCold: this.scenarioStress.temperature <= -35,
      lowFuel: this.scenarioStress.fuelReservePercent <= 30,
      supplyDelayDays: this.scenarioStress.supplyDelayDays,
    };
  }

  // Calculate coupled station telemetry metrics based on current inputs & failure stresses
  calculateTelemetry(stationCode = 'BHT') {
    const isBharati = stationCode.toUpperCase() === 'BHT';
    const config = STATIONS[stationCode.toUpperCase()] || STATIONS.BHT;
    const stress = this.scenarioStress;
    const wave = this.tickCount || 0;

    // 1. Environment coupled calculations
    let outsideTemp = stress.temperature;
    if (stress.temperature === -16.4) {
      outsideTemp = +(-16.4 + (((wave * 2) % 5) - 2) * 0.1).toFixed(1);
    }

    let windSpeed = isBharati ? 22.3 : 19.5;
    if (stress.windSeverity === 'Extreme') windSpeed = 68.4;
    else if (stress.windSeverity === 'High') windSpeed = 42.1;
    else {
      windSpeed = +(windSpeed + (((wave * 3) % 7) - 3) * 0.25).toFixed(1);
    }

    const pressureVal = 973 + (((wave * 1) % 3) - 1);
    const humidityVal = +(26.3 + (((wave * 2) % 5) - 2) * 0.15).toFixed(1);

    // 2. Heating demand calculation:
    const tempDeltaFromBaseline = Math.max(0, -16.4 - outsideTemp);
    const windHeatingBonus = stress.windSeverity === 'Extreme' ? 12 : stress.windSeverity === 'High' ? 6 : 0;
    const heatingDemandPercent = Math.min(99, Math.round(70 + tempDeltaFromBaseline * 1.5 + windHeatingBonus));

    // 3. Generator & Power System calculations:
    let baseChp1Load = 72 + (((wave * 2) % 5) - 2) * 0.5;
    let baseChp2Load = 64 + (((wave * 3) % 5) - 2) * 0.4;
    let baseChp3Load = 91 + (((wave * 1) % 4) - 2) * 0.3;
    let chp1Status = 'Healthy';
    let chp2Status = 'Healthy';
    let chp3Status = 'Healthy';
    let chp1Temp = 78;
    let chp2Temp = 74;
    let chp3Temp = 94;
    let availablePowerKva = isBharati ? 360 : 300;

    // Cold weather increases electrical & thermal demand
    if (stress.temperature <= -30) {
      baseChp1Load = Math.min(96, baseChp1Load + 14);
      baseChp2Load = Math.min(95, baseChp2Load + 15);
      baseChp3Load = Math.min(98, baseChp3Load + 5);
      chp1Temp += 6;
      chp2Temp += 6;
      chp3Temp += 4;
    }

    // Generator outage / trip / high temperature stress
    const failedGen = stress.chpFailure;
    if (failedGen && failedGen !== 'None') {
      if (failedGen === 'CHP-1' || failedGen === 'DG-1') {
        chp1Status = 'Critical';
        baseChp1Load = 0;
        chp1Temp = 104;
        baseChp2Load = 96;
        baseChp3Load = 98;
        availablePowerKva -= 120;
      } else if (failedGen === 'CHP-2' || failedGen === 'DG-2') {
        chp2Status = 'Critical';
        baseChp2Load = 0;
        chp2Temp = 102;
        baseChp1Load = 97;
        baseChp3Load = 98;
        availablePowerKva -= 120;
      } else if (failedGen === 'CHP-3' || failedGen === 'DG-3') {
        chp3Status = 'Critical';
        baseChp3Load = 0;
        chp3Temp = 106;
        baseChp1Load = 95;
        baseChp2Load = 93;
        availablePowerKva -= 120;
      }
    } else {
      chp3Status = baseChp3Load > 90 ? 'Warning' : 'Healthy';
    }

    // If fuel is depleted (< 10%), generators shut down!
    if (stress.fuelReservePercent <= 10) {
      chp1Status = 'Critical';
      chp2Status = 'Critical';
      chp3Status = 'Critical';
      baseChp1Load = 0;
      baseChp2Load = 0;
      baseChp3Load = 0;
      availablePowerKva = 0;
    }

    // 4. Fuel Consumption & Runway calculations:
    let dailyFuelUseLiters = isBharati ? 4150 : 3820;
    const heatingFuelFactor = (heatingDemandPercent - 70) * 0.012;
    dailyFuelUseLiters = Math.round(dailyFuelUseLiters * (1 + Math.max(0, heatingFuelFactor)));
    if (failedGen !== 'None') {
      dailyFuelUseLiters = Math.round(dailyFuelUseLiters * 1.12);
    }

    const fuelReservePercent = stress.fuelReservePercent;
    const totalCapacityLiters = isBharati ? 240000 : 200000;
    const currentFuelLiters = Math.round((totalCapacityLiters * fuelReservePercent) / 100);
    const fuelRunwayDays = dailyFuelUseLiters > 0 ? Math.floor(currentFuelLiters / dailyFuelUseLiters) : 0;

    const resupplyHorizon = config.resupply.daysUntilNext + Number(stress.supplyDelayDays || 0);
    const fuelDeficitDays = Math.max(0, resupplyHorizon - fuelRunwayDays);

    // 5. Water Systems:
    let pumpFlowLh = isBharati ? 3200 : 2800;
    let pumpStatus = 'Healthy';
    if (stress.waterPumpStatus === 'Failed') {
      pumpFlowLh = 0;
      pumpStatus = 'Critical';
    }

    // 6. Satellite Link:
    let satelliteStatus = 'Connected';
    let satelliteLatency = isBharati ? 742 : 685;
    let packetLoss = 1.2;
    if (stress.satelliteConn === 'Offline') {
      satelliteStatus = 'Disconnected';
      satelliteLatency = 0;
      packetLoss = 100;
    } else if (stress.satelliteConn === 'Degraded') {
      satelliteStatus = 'Warning';
      satelliteLatency = 1480;
      packetLoss = 14.8;
    }

    // 7. Overall Station Composite Health Score
    let healthScore = config.healthScore || 88;
    if (failedGen !== 'None') healthScore -= 18;
    if (stress.waterPumpStatus === 'Failed') healthScore -= 14;
    if (stress.satelliteConn === 'Offline') healthScore -= 14;
    else if (stress.satelliteConn === 'Degraded') healthScore -= 6;
    if (stress.temperature <= -35) healthScore -= 10;
    if (stress.fuelReservePercent <= 25) healthScore -= 20;
    else if (stress.fuelReservePercent <= 40) healthScore -= 10;
    healthScore = Math.max(20, Math.min(100, healthScore));

    let stationStatus = 'Operational';
    if (healthScore < 60 || availablePowerKva === 0) stationStatus = 'Critical';
    else if (healthScore < 80) stationStatus = 'Warning';

    const isSatelliteLost = stress.satelliteConn === 'Offline';
    const updateText = isSatelliteLost
      ? '17 minutes ago (LINK LOST)'
      : `${this.telemetryAgeSeconds}s ago · 7s heartbeat`;

    return {
      stationCode: stationCode.toUpperCase(),
      stationName: config.name,
      stationStatus,
      healthScore,
      isBackendConnected: this.isBackendConnected,
      telemetryAgeSeconds: this.telemetryAgeSeconds,
      environment: {
        temperature: outsideTemp,
        windSpeed,
        humidity: humidityVal,
        pressure: pressureVal,
        source: this.isBackendConnected ? 'LIVE · BACKEND SYNC' : 'LIVE · NCPOR',
        updatedAt: updateText,
        isStale: isSatelliteLost,
      },
      power: {
        availableKva: availablePowerKva,
        totalDemandKw: Math.round(availablePowerKva * 0.72),
        chp1: { load: `${baseChp1Load}%`, temp: `${chp1Temp}°C`, status: chp1Status },
        chp2: { load: `${baseChp2Load}%`, temp: `${chp2Temp}°C`, status: chp2Status },
        chp3: {
          load: `${baseChp3Load}%`,
          temp: failedGen === 'CHP-3' ? 'Overheat / Tripped (106°C)' : `${chp3Temp}°C`,
          status: chp3Status,
        },
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
        nextResupplyDays: resupplyHorizon,
        deficitDays: fuelDeficitDays,
        isDeficit: fuelDeficitDays > 0,
      },
      water: {
        pumpStatus,
        pumpFlowLh,
        sourceName: config.waterSource,
        reservePercent: stress.waterPumpStatus === 'Failed' ? 34 : 78,
      },
      satellite: {
        status: satelliteStatus,
        latencyMs: satelliteLatency,
        packetLoss,
        lastTelemetrySeconds: this.telemetryAgeSeconds,
        isLost: isSatelliteLost,
      },
      battery: {
        levelPercent: (() => {
          let lvl = stress.batteryLevel !== undefined ? stress.batteryLevel : 88;
          if (stress.fuelReservePercent <= 10) return 18.0;
          if (failedGen !== 'None') return Math.min(lvl, 62.0);
          if (stress.temperature <= -30) return Math.min(lvl, 74.0);
          if (stress.batteryLevel === undefined || stress.batteryLevel === 88) {
            return +(88.0 + (((wave * 2) % 5) - 2) * 0.3).toFixed(1);
          }
          return lvl;
        })(),
        loadPercent: failedGen !== 'None' ? 84.0 : stress.fuelReservePercent <= 10 ? 94.0 : +(42.0 + (((wave * 3) % 5) - 2) * 0.6).toFixed(1),
        temperature: +(21.4 + (((wave * 1) % 3) - 1) * 0.1).toFixed(1),
        status: (stress.fuelReservePercent <= 10 || (stress.batteryLevel && stress.batteryLevel < 25))
          ? 'Critical'
          : (failedGen !== 'None' || (stress.batteryLevel && stress.batteryLevel < 50))
          ? 'Warning'
          : 'Healthy',
        healthScore: stress.fuelReservePercent <= 10 ? 42 : failedGen !== 'None' ? 72 : 96,
      },
      scenarioStress: { ...this.scenarioStress },
    };
  }

  getState() {
    return {
      BHT: this.calculateTelemetry('BHT'),
      MTR: this.calculateTelemetry('MTR'),
      scenarioStress: { ...this.scenarioStress },
      telemetryAgeSeconds: this.telemetryAgeSeconds,
      isBackendConnected: this.isBackendConnected,
    };
  }
}

export const telemetryEngine = new TelemetryEngine();
export default telemetryEngine;
