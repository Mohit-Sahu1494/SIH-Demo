import mqtt from 'mqtt';
import env from '../config/env.js';
import simulatorConfig from './simulatorConfig.js';
import generateEnvironment from './generators/environmentGenerator.js';
import generateEnergy from './generators/energyGenerator.js';
import generateAssetTelemetry from './generators/assetGenerator.js';

import normalScenario from './scenarios/normal.js';
import generatorFailureScenario from './scenarios/generatorFailure.js';
import lowFuelScenario from './scenarios/lowFuel.js';
import highEnergyScenario from './scenarios/highEnergy.js';
import extremeWeatherScenario from './scenarios/extremeWeather.js';
import lowInventoryScenario from './scenarios/lowInventory.js';

class Simulator {
  constructor() {
    this.client = null;
    this.intervalId = null;
    this.tick = 0;
    this.currentScenarioName = 'NORMAL';
    this.scenarioProgress = 0.0;
    this.isRunning = false;

    this.scenarios = {
      NORMAL: normalScenario,
      GENERATOR_FAILURE: generatorFailureScenario,
      LOW_FUEL: lowFuelScenario,
      HIGH_ENERGY_CONSUMPTION: highEnergyScenario,
      EXTREME_WEATHER: extremeWeatherScenario,
      LOW_INVENTORY: lowInventoryScenario,
    };
  }

  initMqtt() {
    if (this.client) return;

    this.client = mqtt.connect(env.MQTT_BROKER_URL, {
      clientId: `polar-twin-simulator-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 2000,
      connectTimeout: 5000,
    });

    this.client.on('connect', () => {
      console.log(`\x1b[35m[Simulator] Connected to MQTT broker at ${env.MQTT_BROKER_URL}\x1b[0m`);
    });

    this.client.on('error', (err) => {
      console.warn(`[Simulator] MQTT connection notice: ${err.message}`);
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.initMqtt();

    console.log(`\x1b[35m[Simulator] Starting telemetry publisher loop (interval: ${simulatorConfig.tickIntervalMs}ms)...\x1b[0m`);

    this.intervalId = setInterval(() => {
      this.step();
    }, simulatorConfig.tickIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  setScenario(name) {
    const valid = this.scenarios[name];
    if (!valid) {
      console.warn(`[Simulator] Unknown scenario '${name}'. Defaulting to NORMAL.`);
      this.currentScenarioName = 'NORMAL';
      this.scenarioProgress = 0.0;
    } else {
      this.currentScenarioName = name;
      this.scenarioProgress = 0.0; // reset progress on switch
      console.log(`\x1b[35m[Simulator] Active scenario switched to: ${name}\x1b[0m`);
    }

    return this.getCurrentScenario();
  }

  getCurrentScenario() {
    const s = this.scenarios[this.currentScenarioName] || this.scenarios.NORMAL;
    return {
      name: this.currentScenarioName,
      label: s.label,
      description: s.description,
      progress: +(this.scenarioProgress * 100).toFixed(0),
      isRunning: this.isRunning,
    };
  }

  step() {
    this.tick++;

    // Apply scenario progression
    const scenario = this.scenarios[this.currentScenarioName] || this.scenarios.NORMAL;
    scenario.apply(this);

    for (const stationCode of simulatorConfig.stations) {
      const slug = stationCode.toUpperCase() === 'MTR' ? 'maitri' : 'bharati';

      // 1. Environment Telemetry
      const envData = generateEnvironment(stationCode, this.currentScenarioName, this.tick);
      this.publish(`stations/${slug}/environment`, envData);

      // 2. Energy Telemetry
      const energyData = generateEnergy(stationCode, this.currentScenarioName, this.tick);
      this.publish(`stations/${slug}/energy`, energyData);

      // 3. Asset Telemetry
      for (const assetId of simulatorConfig.assets) {
        const assetData = generateAssetTelemetry(
          stationCode,
          assetId,
          this.currentScenarioName,
          this.scenarioProgress,
          this.tick
        );
        this.publish(`stations/${slug}/assets/${assetId}/telemetry`, assetData);
      }
    }
  }

  publish(topic, payload) {
    if (!this.client || !this.client.connected) return;
    try {
      const msg = JSON.stringify(payload);
      this.client.publish(topic, msg);
    } catch (err) {
      // ignore serialization error
    }
  }
}

export const simulator = new Simulator();
export default simulator;
