import { create } from 'zustand';
import alertService from '../services/alertService.js';

export const useAlertStore = create((set, get) => ({
  alerts: [],
  activeCount: 0,
  toast: null,
  isLoading: false,

  fetchAlerts: async (stationCode) => {
    set({ isLoading: true });
    try {
      const data = await alertService.getAll({ stationCode });
      const active = data?.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').length || 0;
      set({ alerts: data || [], activeCount: active, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  handleNewAlert: (alert) => {
    set((state) => {
      const exists = state.alerts.some((a) => a._id === alert._id || a.deduplicationKey === alert.deduplicationKey);
      let nextAlerts;
      if (exists) {
        nextAlerts = state.alerts.map((a) =>
          a._id === alert._id || (a.deduplicationKey && a.deduplicationKey === alert.deduplicationKey)
            ? { ...a, ...alert }
            : a
        );
      } else {
        nextAlerts = [alert, ...state.alerts];
      }

      const active = nextAlerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').length;

      return {
        alerts: nextAlerts,
        activeCount: active,
        toast: {
          id: alert._id || Math.random().toString(),
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          timestamp: new Date(),
        },
      };
    });
  },

  handleAlertUpdated: (updated) => {
    set((state) => {
      const nextAlerts = state.alerts.map((a) =>
        a._id === updated._id || (a.deduplicationKey && a.deduplicationKey === updated.deduplicationKey)
          ? { ...a, ...updated }
          : a
      );
      const active = nextAlerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').length;
      return { alerts: nextAlerts, activeCount: active };
    });
  },

  clearToast: () => set({ toast: null }),

  acknowledge: async (id) => {
    try {
      const updated = await alertService.acknowledge(id, 'Current Operator');
      get().handleAlertUpdated(updated);
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  },

  resolve: async (id) => {
    try {
      const updated = await alertService.resolve(id, 'Current Operator');
      get().handleAlertUpdated(updated);
    } catch (err) {
      console.error('Failed to resolve alert', err);
    }
  },
}));

export default useAlertStore;
