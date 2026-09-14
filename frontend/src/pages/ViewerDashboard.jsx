import React from 'react';
import {
  Eye,
  Shield,
  Activity,
  Zap,
  Wind,
  Layers,
  CheckCircle2,
  Clock,
  Thermometer,
} from 'lucide-react';
import useDashboardStore from '../store/dashboardStore.js';
import useStationStore from '../store/stationStore.js';
import StationTwinView from '../components/digital-twin/StationTwinView.jsx';
import HealthOverview from '../components/dashboard/HealthOverview.jsx';
import StationHero from '../components/dashboard/StationHero.jsx';

export function ViewerDashboard() {
  const { environment, energy, assetsTelemetry } = useDashboardStore();
  const { currentStationCode, stations } = useStationStore();

  const currentStation =
    stations.find((s) => s.code === currentStationCode) || stations[0];

  return (
    <div className="space-y-6 select-none">
      {/* Viewer Mode Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Scientific Observer Mode (Read-Only)
            </div>
            <div className="text-sm font-heading font-semibold text-slate-200">
              Monitoring telemetry and environmental science metrics for {currentStation?.name || 'Bharati Station'}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Role: VIEWER
        </div>
      </div>

      {/* Station Status & Top Metrics */}
      <StationHero />

      {/* Main Grid: Health & Environmental Surveillance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-4">
          <HealthOverview />
        </div>

        {/* Environmental & Energy Read-only Summary */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Environment Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Atmospheric Profile
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                {environment.sourceType || 'WEATHER MODEL'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">TEMPERATURE</span>
                <span className="text-2xl font-heading font-black text-slate-900 font-mono">
                  {environment.temperature}°C
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">WIND VELOCITY</span>
                <span className="text-2xl font-heading font-black text-slate-900 font-mono">
                  {environment.windSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">PRESSURE</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {environment.pressure} hPa
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">HUMIDITY</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {environment.humidity}%
                </span>
              </div>
            </div>
          </div>

          {/* Energy Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Microgrid Generation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                SIMULATED MQTT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">GENERATION</span>
                <span className="text-2xl font-heading font-black text-slate-900 font-mono">
                  {energy.generation} <span className="text-xs font-normal text-slate-400">kW</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">CONSUMPTION</span>
                <span className="text-2xl font-heading font-black text-slate-900 font-mono">
                  {energy.consumption} <span className="text-xs font-normal text-slate-400">kW</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">BATTERY BUFFER</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {energy.batteryLevel}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">FUEL RESERVE</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {energy.fuelLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Twin Visualization */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Station Digital Twin & Spatial Layout
            </h3>
            <p className="text-xs text-slate-400">
              Interactive asset hotspots showing real-time temperature, vibration, and subsystem status.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any marker to inspect telemetry
          </span>
        </div>

        <StationTwinView className="h-[480px]" />
      </div>
    </div>
  );
}

export default ViewerDashboard;
