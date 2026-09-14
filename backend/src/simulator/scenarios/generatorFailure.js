export const generatorFailureScenario = {
  name: 'GENERATOR_FAILURE',
  label: 'Generator GEN-02 Thermal & Vibration Failure',
  description: 'Simulates coolant leak on GEN-02, causing thermal runaway (78°C -> 94°C) and harmonic bearing vibration spike (2.0 -> 4.2 mm/s).',
  apply(context) {
    if (context.scenarioProgress < 1.0) {
      // Step up progress by 0.2 each tick so changes are visible within 10-15 seconds
      context.scenarioProgress = Math.min(1.0, context.scenarioProgress + 0.2);
    }
  },
};

export default generatorFailureScenario;
