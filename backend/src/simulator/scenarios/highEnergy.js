export const highEnergyScenario = {
  name: 'HIGH_ENERGY_CONSUMPTION',
  label: 'Grid Surge & Battery Depletion',
  description: 'Simulates scientific equipment power surge draining the battery bank to 20% and forcing generator load above 95%.',
  apply(context) {
    context.scenarioProgress = 1.0;
  },
};

export default highEnergyScenario;
