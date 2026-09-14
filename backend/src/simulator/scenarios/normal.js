export const normalScenario = {
  name: 'NORMAL',
  label: 'Normal Baseline Operations',
  description: 'Station operating within nominal design parameters. All generators, battery banks, and heating grids healthy.',
  apply(context) {
    context.scenarioProgress = 0;
  },
};

export default normalScenario;
