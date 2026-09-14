import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useConnectionStore from '../store/connectionStore.js';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';
import useAlertStore from '../store/alertStore.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const currentStationCode = useStationStore((s) => s.currentStationCode);
  const { setConnected, recordSync } = useConnectionStore();
  const { updateEnvironment, updateEnergy, updateAssetTelemetry } = useDashboardStore();
  const updateStationHealth = useStationStore((s) => s.updateStationHealth);
  const { handleNewAlert, handleAlertUpdated } = useAlertStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-station', currentStationCode);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setConnected(false);
    });

    // Real-time events
    socket.on('telemetry-update', (payload) => {
      recordSync();
      if (payload.stationCode === currentStationCode) {
        updateAssetTelemetry(payload.assetId, payload.telemetry, payload.status, payload.healthScore);
      }
    });

    socket.on('asset-update', (payload) => {
      recordSync();
      if (payload.stationCode === currentStationCode) {
        updateAssetTelemetry(payload.assetId, payload.currentTelemetry, payload.status, payload.healthScore);
      }
    });

    socket.on('environment-update', (payload) => {
      recordSync();
      if (payload.stationCode === currentStationCode) {
        updateEnvironment(payload.data);
      }
    });

    socket.on('energy-update', (payload) => {
      recordSync();
      if (payload.stationCode === currentStationCode) {
        updateEnergy(payload.data);
      }
    });

    socket.on('station-health-update', (payload) => {
      recordSync();
      updateStationHealth(payload);
    });

    socket.on('new-alert', (payload) => {
      recordSync();
      handleNewAlert(payload);
    });

    socket.on('alert-updated', (payload) => {
      recordSync();
      handleAlertUpdated(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update room when station changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-station', currentStationCode);
    }
  }, [currentStationCode]);

  return socketRef.current;
}

export default useSocket;
