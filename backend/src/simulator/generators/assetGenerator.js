// In-memory state tracking to ensure continuous, gradual transitions
const assetStateStore = {};

function getInitialState(stationCode, assetId) {
  return {
    temperature: 78.2,
    vibration: 2.02,
    load: 74.0,
    oilPressure: 4.2,
    fuelConsumption: 11.8,
    rpm: 1500,
  };
}

export function generateAssetTelemetry(stationCode, assetId, scenario = 'NORMAL', scenarioProgress = 0, tick = 0) {
  const code = stationCode.toUpperCase();
  const id = assetId.toUpperCase();
  const key = `${code}:${id}`;

  if (!assetStateStore[key]) {
    assetStateStore[key] = getInitialState(code, id);
  }

  const state = assetStateStore[key];

  // Gradual random walk step (-0.15 to +0.15)
  const tempDelta = (Math.random() - 0.5) * 0.3;
  const vibDelta = (Math.random() - 0.5) * 0.04;
  const loadDelta = (Math.random() - 0.5) * 0.8;
  const pressDelta = (Math.random() - 0.5) * 0.05;
  const fuelDelta = (Math.random() - 0.5) * 0.1;
  const rpmDelta = Math.round((Math.random() - 0.5) * 4);

  if (id === 'GEN-02' && scenario === 'GENERATOR_FAILURE') {
    const p = Math.min(1, Math.max(0, scenarioProgress));
    // Target failure values: temp up to 94.5°C, vibration up to 4.2mm/s, oil pressure down to 1.3bar
    const targetTemp = 78.0 + p * 16.5;
    const targetVib = 2.0 + p * 2.2;
    const targetPress = 4.2 - p * 2.9;
    const targetLoad = 74.0 + p * 18.0;

    // Smooth asymptotic approach toward target
    state.temperature += (targetTemp - state.temperature) * 0.15 + tempDelta * 0.5;
    state.vibration += (targetVib - state.vibration) * 0.15 + vibDelta * 0.5;
    state.oilPressure += (targetPress - state.oilPressure) * 0.15 + pressDelta * 0.5;
    state.load += (targetLoad - state.load) * 0.15 + loadDelta * 0.5;
    state.fuelConsumption += (15.5 - state.fuelConsumption) * 0.1;
    state.rpm = 1500 + Math.round((Math.random() - 0.5) * 12);
  } else if (id === 'GEN-01' && scenario === 'GENERATOR_FAILURE') {
    // GEN-01 takes over load
    state.load += (88.0 - state.load) * 0.1 + loadDelta * 0.5;
    state.temperature += (82.0 - state.temperature) * 0.1 + tempDelta * 0.5;
    state.vibration += (2.4 - state.vibration) * 0.1 + vibDelta * 0.5;
    state.oilPressure += (4.0 - state.oilPressure) * 0.05 + pressDelta;
    state.fuelConsumption += (14.2 - state.fuelConsumption) * 0.1;
  } else {
    // Nominal gradual oscillation around baseline
    const baseTemp = 78.0;
    const baseVib = 2.0;
    const baseLoad = 74.0;
    const basePress = 4.2;

    // Gentle pull to center + random walk = realistic realistic fluctuation
    state.temperature += (baseTemp - state.temperature) * 0.08 + tempDelta;
    state.vibration += (baseVib - state.vibration) * 0.08 + vibDelta;
    state.load += (baseLoad - state.load) * 0.08 + loadDelta;
    state.oilPressure += (basePress - state.oilPressure) * 0.08 + pressDelta;
    state.fuelConsumption += (11.8 - state.fuelConsumption) * 0.08 + fuelDelta;
    state.rpm = 1500 + rpmDelta;
  }

  return {
    stationCode: code,
    assetId: id,
    parameter: 'telemetry_bundle',
    temperature: +state.temperature.toFixed(1),
    vibration: +state.vibration.toFixed(2),
    load: +state.load.toFixed(1),
    oilPressure: +state.oilPressure.toFixed(1),
    fuelConsumption: +state.fuelConsumption.toFixed(1),
    rpm: state.rpm,
    unit: 'bundle',
    sourceType: 'SIMULATED',
    timestamp: new Date().toISOString(),
  };
}

export default generateAssetTelemetry;
