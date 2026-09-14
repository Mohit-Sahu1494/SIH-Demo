import { create } from 'zustand';
import api from '../services/api.js';

export const useDashboardStore = create((set, get) => ({
  // Environment state (fetched from backend API)
  environment: {
    temperature: -26.4,
    humidity: 68,
    pressure: 988,
    windSpeed: 32.4,
    windDirection: 'ESE',
    visibility: 18,
    snow: 'Light Flurries',
    sourceType: 'SIMULATED',
  },
  isEnvironmentLoading: false,

  // Energy state (fetched from backend API)
  energy: {
    generation: 168.0,
    consumption: 144.0,
    batteryLevel: 88.0,
    fuelLevel: 76.5,
    generatorLoad: 72.0,
    peakLoad: 184,
    efficiency: 91,
    sourceType: 'SIMULATED',
  },
  isEnergyLoading: false,

  // Asset live telemetry store
  assetsTelemetry: {
    'GEN-01': { temperature: 78.2, vibration: 2.01, load: 74.0, status: 'HEALTHY', healthScore: 94 },
    'GEN-02': { temperature: 78.4, vibration: 2.05, load: 74.5, status: 'HEALTHY', healthScore: 92 },
    'BAT-01': { temperature: 21.5, load: 45.0, status: 'HEALTHY', healthScore: 96 },
    'FUEL-01': { load: 76.5, status: 'HEALTHY', healthScore: 91 },
    'FUEL-02': { load: 82.0, status: 'HEALTHY', healthScore: 93 },
    'BLD-01': { temperature: 20.4, status: 'HEALTHY', healthScore: 95 },
    'LAB-01': { temperature: 19.8, status: 'HEALTHY', healthScore: 96 },
    'COM-01': { signalStrength: 98, status: 'HEALTHY', healthScore: 98 },
    'WTR-01': { status: 'HEALTHY', healthScore: 94 },
  },

  aiInsights: [],
  selectedAssetId: null,
  isInspectorOpen: false,

  // Active Scenario state
  activeScenario: 'NORMAL',
  scenarioProgress: 0,
  scenarioStatus: 'Running',

  // Fetch initial data from backend APIs
  fetchInitialData: async (stationCode = 'BHT') => {
    const code = stationCode.toUpperCase();
    set({ isEnvironmentLoading: true, isEnergyLoading: true });

    try {
      const [envRes, energyRes, assetsRes, insightsRes] = await Promise.all([
        api.get(`/environment?stationCode=${code}`).catch(() => null),
        api.get(`/energy?stationCode=${code}`).catch(() => null),
        api.get(`/assets?stationCode=${code}`).catch(() => null),
        api.get(`/analytics/insights?stationCode=${code}`).catch(() => null),
      ]);

      if (envRes?.data?.data) {
        set((state) => ({ environment: { ...state.environment, ...envRes.data.data } }));
      }
      if (energyRes?.data?.data) {
        set((state) => ({ energy: { ...state.energy, ...energyRes.data.data } }));
      }
      if (assetsRes?.data?.data && Array.isArray(assetsRes.data.data)) {
        const telemetryMap = {};
        for (const asset of assetsRes.data.data) {
          telemetryMap[asset.assetId] = {
            ...(asset.currentTelemetry || {}),
            status: asset.status,
            healthScore: asset.healthScore,
          };
        }
        set((state) => ({
          assetsTelemetry: { ...state.assetsTelemetry, ...telemetryMap },
        }));
      }
      if (insightsRes?.data?.data) {
        set({ aiInsights: insightsRes.data.data });
      }
    } catch (err) {
      console.warn('[DashboardStore] Notice fetching initial data:', err.message);
    } finally {
      set({ isEnvironmentLoading: false, isEnergyLoading: false });
    }
  },

  updateEnvironment: (data) => set((state) => ({ environment: { ...state.environment, ...data } })),
  updateEnergy: (data) => set((state) => ({ energy: { ...state.energy, ...data } })),

  updateAssetTelemetry: (assetId, telemetry, status, healthScore) =>
    set((state) => ({
      assetsTelemetry: {
        ...state.assetsTelemetry,
        [assetId]: {
          ...state.assetsTelemetry[assetId],
          ...telemetry,
          ...(status && { status }),
          ...(typeof healthScore === 'number' && { healthScore }),
        },
      },
    })),

  setInsights: (insights) => set({ aiInsights: insights }),

  openInspector: (assetId) => set({ selectedAssetId: assetId, isInspectorOpen: true }),
  closeInspector: () => set({ isInspectorOpen: false }),

  // Trigger demo scenario
  triggerScenario: async (scenarioName) => {
    try {
      const res = await api.post('/scenarios/trigger', { scenarioName });
      set({ activeScenario: scenarioName, scenarioProgress: 0 });
      return res.data;
    } catch (err) {
      set({ activeScenario: scenarioName });
    }
  },

  resetScenario: async () => {
    try {
      await api.post('/scenarios/reset');
      set({ activeScenario: 'NORMAL', scenarioProgress: 0 });
    } catch (err) {
      set({ activeScenario: 'NORMAL' });
    }
  },
}));

export default useDashboardStore;
