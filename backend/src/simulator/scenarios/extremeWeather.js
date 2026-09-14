export const extremeWeatherScenario = {
  name: 'EXTREME_WEATHER',
  label: 'Category-3 Katabatic Blizzard',
  description: 'Simulates Antarctic storm front bringing sustained katabatic winds over 90 km/h and temperatures falling below -45°C.',
  apply(context) {
    context.scenarioProgress = 1.0;
  },
};

export default extremeWeatherScenario;
