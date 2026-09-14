import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MissionControlLayout from './layouts/MissionControlLayout.jsx';

// Dedicated Mission Control Pages
import LandingPage from './pages/LandingPage.jsx';
import StationDashboard from './pages/StationDashboard.jsx';
import SystemDetailsPage from './pages/SystemDetailsPage.jsx';
import DependencyMapPage from './pages/DependencyMapPage.jsx';
import ScenarioSimulatorPage from './pages/ScenarioSimulatorPage.jsx';
import AlertCenterPage from './pages/AlertCenterPage.jsx';
import ResourceForecastPage from './pages/ResourceForecastPage.jsx';
import LogisticsPage from './pages/LogisticsPage.jsx';
import EnvironmentHistoricalPage from './pages/EnvironmentHistoricalPage.jsx';
import StationComparisonPage from './pages/StationComparisonPage.jsx';

// Secondary / Auth pages if needed
import Login from './pages/Login.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. First Screen — Station Selection (Bharati or Maitri) */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Station Remote Operations Mission Control Shell */}
        <Route path="/station/:stationId" element={<MissionControlLayout />}>
          {/* Main Station Dashboard Overview */}
          <Route index element={<StationDashboard />} />

          {/* Dedicated System Details (e.g. CHP-2, Water Pump) */}
          <Route path="systems/:systemId" element={<SystemDetailsPage />} />

          {/* Digital Twin Features */}
          <Route path="digital-twin" element={<DependencyMapPage />} />
          <Route path="simulator" element={<ScenarioSimulatorPage />} />
          <Route path="forecast" element={<ResourceForecastPage />} />

          {/* Operations Features */}
          <Route path="alerts" element={<AlertCenterPage />} />
          <Route path="logistics" element={<LogisticsPage />} />
          <Route path="environment" element={<EnvironmentHistoricalPage />} />
        </Route>

        {/* 3. Global Indian Antarctic Operations Comparison */}
        <Route path="/operations" element={<MissionControlLayout />}>
          <Route path="compare" element={<StationComparisonPage />} />
        </Route>

        {/* Optional Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Fallback redirects */}
        <Route path="/dashboard" element={<Navigate to="/station/bharati" replace />} />
        <Route path="/operator/dashboard" element={<Navigate to="/station/bharati" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/station/bharati" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
