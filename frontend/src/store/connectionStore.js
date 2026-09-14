import { create } from 'zustand';

export const useConnectionStore = create((set) => ({
  isConnected: false,
  status: 'connecting', // 'connected' | 'disconnected' | 'connecting'
  lastSync: new Date(),
  activeSource: 'SIMULATED',

  setConnected: (connected) =>
    set({
      isConnected: connected,
      status: connected ? 'connected' : 'disconnected',
      lastSync: connected ? new Date() : new Date(),
    }),

  recordSync: () => set({ lastSync: new Date() }),

  setActiveSource: (source) => set({ activeSource: source }),
}));

export default useConnectionStore;
