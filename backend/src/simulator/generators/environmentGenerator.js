// Continuous environmental state tracking per station
const envStateStore = {
  BHT: {
    temperature: -26.4,
    humidity: 68,
    pressure: 988,
    windSpeed: 32.4,
    windDirection: 'ESE',
    visibility: 18,
    snow: 'Light Flurries',
  },
  MTR: {
    temperature: -29.6,
    humidity: 65,
    pressure: 982,
    windSpeed: 41.2,
    windDirection: 'SE',
    visibility: 15,
    snow: 'Clear Polar Sky',
  },
};

const WIND_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function generateEnvironment(stationCode, scenario = 'NORMAL', tick = 0) {
  const code = stationCode.toUpperCase();
  if (!envStateStore[code]) {
    envStateStore[code] = {
      temperature: code === 'BHT' ? -26.4 : -29.6,
      humidity: 68,
      pressure: 988,
      windSpeed: 32.0,
      windDirection: 'ESE',
      visibility: 18,
      snow: 'Light Flurries',
    };
  }

  const state = envStateStore[code];
  const isBharati = code === 'BHT';
  const baselineTemp = isBharati ? -26.5 : -30.0;
  const baselineWind = isBharati ? 32.0 : 42.0;
  const baselinePressure = isBharati ? 988.0 : 982.0;

  if (scenario === 'EXTREME_WEATHER') {
    // Extreme Blizzard conditions
    state.temperature += (-46.5 - state.temperature) * 0.12 + (Math.random() - 0.5) * 0.4;
    state.windSpeed += (94.0 - state.windSpeed) * 0.15 + (Math.random() - 0.5) * 2.0;
    state.pressure += (958.0 - state.pressure) * 0.1 + (Math.random() - 0.5) * 0.8;
    state.humidity += (88.0 - state.humidity) * 0.1;
    state.visibility = 0.3;
    state.snow = 'Severe Blizzard';
    state.windDirection = 'SSW';
  } else {
    // Gradual natural polar atmosphere changes (steps of 0.1 - 0.3°C, e.g. -18.2 -> -18.4 -> -18.1)
    const tempDelta = (Math.random() - 0.5) * 0.25;
    const windDelta = (Math.random() - 0.5) * 1.2;
    const pressDelta = (Math.random() - 0.5) * 0.4;
    const humDelta = (Math.random() - 0.5) * 0.6;

    // Pull toward baseline gently to prevent unbounded divergence
    state.temperature += (baselineTemp - state.temperature) * 0.05 + tempDelta;
    state.windSpeed += (baselineWind - state.windSpeed) * 0.05 + windDelta;
    state.pressure += (baselinePressure - state.pressure) * 0.05 + pressDelta;
    state.humidity += (68.0 - state.humidity) * 0.05 + humDelta;

    state.windSpeed = Math.max(2, state.windSpeed);
    state.visibility = 18;
    state.snow = state.windSpeed > 45 ? 'Blowing Snow' : 'Light Flurries';
  }

  return {
    stationCode: code,
    temperature: +state.temperature.toFixed(1),
    humidity: Math.round(Math.min(100, Math.max(20, state.humidity))),
    pressure: Math.round(state.pressure),
    windSpeed: +state.windSpeed.toFixed(1),
    windDirection: state.windDirection,
    visibility: state.visibility,
    snow: state.snow,
    timestamp: new Date().toISOString(),
    sourceType: 'SIMULATED',
  };
}

export default generateEnvironment;
