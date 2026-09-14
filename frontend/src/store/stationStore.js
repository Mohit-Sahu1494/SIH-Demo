import { create } from 'zustand';
import stationService from '../services/stationService.js';

export const useStationStore = create((set, get) => ({
  currentStationCode: 'BHT',
  stations: [
    {
      name: 'Bharati Station',
      code: 'BHT',
      status: 'OPERATIONAL',
      healthScore: 91,
      healthBreakdown: { environment: 94, energy: 87, infrastructure: 91, logistics: 92 },
      location: { latitude: 69.4, longitude: 76.2, region: 'Larsemann Hills, East Antarctica' },
    },
    {
      name: 'Maitri Station',
      code: 'MTR',
      status: 'OPERATIONAL',
      healthScore: 89,
      healthBreakdown: { environment: 90, energy: 88, infrastructure: 89, logistics: 90 },
      location: { latitude: 70.76, longitude: 11.73, region: 'Schirmacher Oasis, Queen Maud Land' },
    },
  ],
  isLoading: false,

  setStationCode: (code) => {
    set({ currentStationCode: code.toUpperCase() });
  },

  fetchStations: async () => {
    set({ isLoading: true });
    try {
      const data = await stationService.getAll();
      if (data?.length > 0) {
        set({ stations: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      // keep fallback
      set({ isLoading: false });
    }
  },

  updateStationHealth: (healthData) => {
    set((state) => ({
      stations: state.stations.map((s) => {
        if (s.code === healthData.stationCode) {
          return {
            ...s,
            healthScore: healthData.overallHealth,
            healthBreakdown: healthData.breakdown,
            status: healthData.overallHealth < 50 ? 'CRITICAL' : healthData.overallHealth < 75 ? 'WARNING' : 'OPERATIONAL',
          };
        }
        return s;
      }),
    }));
  },
}));

export default useStationStore;
