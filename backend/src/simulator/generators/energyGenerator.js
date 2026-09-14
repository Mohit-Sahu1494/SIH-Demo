// Continuous energy metrics tracking per station
const energyStateStore = {
  BHT: {
    generation: 168.4,
    consumption: 144.2,
    batteryLevel: 88.5,
    fuelLevel: 76.5,
    generatorLoad: 72.4,
    efficiency: 91,
    peakLoad: 184,
  },
  MTR: {
    generation: 155.0,
    consumption: 138.0,
    batteryLevel: 84.0,
    fuelLevel: 72.0,
    generatorLoad: 70.0,
    efficiency: 89,
    peakLoad: 175,
  },
};

export function generateEnergy(stationCode, scenario = 'NORMAL', tick = 0) {
  const code = stationCode.toUpperCase();
  if (!energyStateStore[code]) {
    energyStateStore[code] = {
      generation: 168.0,
      consumption: 144.0,
      batteryLevel: 88.0,
      fuelLevel: 76.5,
      generatorLoad: 72.0,
      efficiency: 91,
      peakLoad: 184,
    };
  }

  const state = energyStateStore[code];

  if (scenario === 'LOW_FUEL') {
    // Fuel drops toward critical threshold (< 18%)
    state.fuelLevel = Math.max(12.4, state.fuelLevel - 0.2);
    state.generation += (140 - state.generation) * 0.05;
    state.generatorLoad = 68.0;
  } else if (scenario === 'HIGH_ENERGY_CONSUMPTION') {
    // Station demand spikes, batteries buffer load
    state.consumption += (214.0 - state.consumption) * 0.12 + (Math.random() - 0.5) * 2;
    state.generatorLoad += (96.5 - state.generatorLoad) * 0.1;
    state.batteryLevel = Math.max(18.0, state.batteryLevel - 0.35); // Battery draining
    state.efficiency = 82;
  } else {
    // Normal gradual drift
    const genDelta = (Math.random() - 0.5) * 1.2;
    const consDelta = (Math.random() - 0.5) * 1.0;
    const batDelta = (Math.random() - 0.5) * 0.2;

    // Pull toward nominal operating baseline
    state.generation += (168.0 - state.generation) * 0.06 + genDelta;
    state.consumption += (144.0 - state.consumption) * 0.06 + consDelta;
    state.batteryLevel = Math.min(96, Math.max(65, state.batteryLevel + batDelta));
    // Slow natural fuel consumption (0.01% per tick)
    state.fuelLevel = Math.max(20, state.fuelLevel - 0.01);
    state.generatorLoad = +( (state.generation / 230) * 100 ).toFixed(1);
    state.efficiency = 91;
  }

  return {
    stationCode: code,
    generation: +state.generation.toFixed(1),
    consumption: +state.consumption.toFixed(1),
    batteryLevel: +state.batteryLevel.toFixed(1),
    fuelLevel: +state.fuelLevel.toFixed(1),
    generatorLoad: +state.generatorLoad.toFixed(1),
    peakLoad: state.peakLoad,
    efficiency: state.efficiency,
    timestamp: new Date().toISOString(),
    sourceType: 'SIMULATED',
  };
}

export default generateEnergy;
