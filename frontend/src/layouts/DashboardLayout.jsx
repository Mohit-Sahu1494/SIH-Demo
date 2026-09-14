import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import TopBar from '../components/common/TopBar.jsx';
import NotificationToast from '../components/common/NotificationToast.jsx';
import ScenarioControlDrawer from '../components/common/ScenarioControlDrawer.jsx';
import TelemetryInspectorDrawer from '../components/digital-twin/TelemetryInspectorDrawer.jsx';
import useSocket from '../hooks/useSocket.js';
import useStationStore from '../store/stationStore.js';
import useAlertStore from '../store/alertStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function DashboardLayout() {
  const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false);
  const fetchStations = useStationStore((s) => s.fetchStations);
  const currentStationCode = useStationStore((s) => s.currentStationCode);
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts);
  const fetchInitialData = useDashboardStore((s) => s.fetchInitialData);

  // Initialize real-time WebSocket connection
  useSocket();

  useEffect(() => {
    fetchStations();
    fetchAlerts(currentStationCode);
    fetchInitialData(currentStationCode);
  }, [currentStationCode]);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <TopBar onOpenScenarioDrawer={() => setIsScenarioDrawerOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Real-time Alerts Toast */}
      <NotificationToast />

      {/* Scenario Control Drawer (SIH Demo Panel) */}
      <ScenarioControlDrawer
        isOpen={isScenarioDrawerOpen}
        onClose={() => setIsScenarioDrawerOpen(false)}
      />

      {/* 3D Asset Telemetry Inspector Drawer */}
      <TelemetryInspectorDrawer />
    </div>
  );
}

export default DashboardLayout;
