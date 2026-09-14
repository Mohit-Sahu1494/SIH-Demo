export const lowInventoryScenario = {
  name: 'LOW_INVENTORY',
  label: 'Critical Medical & Spare Inventory Depletion',
  description: 'Simulates depletion of essential spare filters and critical pharmaceuticals, triggering inventory alerts and replenishment notices.',
  apply(context) {
    context.scenarioProgress = 1.0;
  },
};

export default lowInventoryScenario;
