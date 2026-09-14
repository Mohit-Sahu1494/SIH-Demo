export const lowFuelScenario = {
  name: 'LOW_FUEL',
  label: 'Critical Fuel Depletion Scenario',
  description: 'Simulates bulk fuel tank levels falling below 15% due to harsh winter weather consumption and delayed supply tanker transit.',
  apply(context) {
    context.scenarioProgress = 1.0;
  },
};

export default lowFuelScenario;
