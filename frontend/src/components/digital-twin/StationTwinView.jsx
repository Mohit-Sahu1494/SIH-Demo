import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Maximize2,
  Radio,
  Zap,
  Flame,
  Battery,
  Shield,
  Eye,
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore.js';
import useStationStore from '../../store/stationStore.js';

const ASSET_HOTSPOTS = [
  {
    id: 'GEN-01',
    name: 'Primary Genset 01',
    category: 'POWER',
    x: 18.5,
    y: 58,
    icon: Zap,
  },
  {
    id: 'GEN-02',
    name: 'Secondary Genset 02',
    category: 'POWER',
    x: 24.5,
    y: 31,
    icon: Zap,
    isKeyDemo: true,
  },
  {
    id: 'BAT-01',
    name: 'Battery ESS Storage Module',
    category: 'POWER',
    x: 58,
    y: 79,
    icon: Battery,
  },
  {
    id: 'FUEL-01',
    name: 'Aviation Fuel Tank A',
    category: 'LOGISTICS',
    x: 69.5,
    y: 72,
    icon: Flame,
  },
  {
    id: 'FUEL-02',
    name: 'Aviation Fuel Tank B',
    category: 'LOGISTICS',
    x: 77.5,
    y: 65,
    icon: Flame,
  },
  {
    id: 'BLD-01',
    name: 'Main Mission Ops Complex',
    category: 'FACILITY',
    x: 52,
    y: 45,
    icon: Shield,
  },
  {
    id: 'LAB-01',
    name: 'Atmospheric Physics Laboratory',
    category: 'FACILITY',
    x: 51,
    y: 26,
    icon: Activity,
  },
  {
    id: 'COM-01',
    name: 'High-Gain Satellite Radome',
    category: 'COMMS',
    x: 73.5,
    y: 16,
    icon: Radio,
  },
  {
    id: 'WTR-01',
    name: 'Meteorological Science Mast',
    category: 'ENVIRONMENT',
    x: 88,
    y: 36,
    icon: Cpu,
  },
];

export function StationTwinView({ className = 'h-[540px] w-full' }) {
  const { assetsTelemetry, openInspector, selectedAssetId } = useDashboardStore();
  const currentStationCode = useStationStore((s) => s.currentStationCode);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hoveredAsset, setHoveredAsset] = useState(null);

  const filteredHotspots = ASSET_HOTSPOTS.filter(
    (h) => activeCategory === 'ALL' || h.category === activeCategory
  );

  return (
    <div
      className={`relative bg-slate-900 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl select-none ${className}`}
    >
      {/* Background Station Image Visual */}
      <img
        src="/images/bharati_station_twin.jpg"
        alt="Bharati Station Digital Twin"
        className="w-full h-full object-cover object-center opacity-95 transition-transform duration-700 hover:scale-[1.01]"
      />

      {/* Subtle Vignette & Dark Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Top Controls Header Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-heading font-bold text-xs tracking-wider">
            {currentStationCode === 'MTR' ? 'MAITRI DIGITAL TWIN' : 'BHARATI DIGITAL TWIN'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
            HIGH-FIDELITY TWIN
          </span>
        </div>

        {/* Subsystem Filter Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
          {['ALL', 'POWER', 'LOGISTICS', 'FACILITY', 'COMMS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Asset Hotspots Overlay */}
      {filteredHotspots.map((spot) => {
        const telemetry = assetsTelemetry[spot.id] || {};
        const status = telemetry.status || 'HEALTHY';
        const isSelected = selectedAssetId === spot.id;
        const isHovered = hoveredAsset === spot.id;
        const isCritical = status === 'CRITICAL';
        const isWarning = status === 'WARNING';

        let markerBorderColor = 'border-emerald-400 bg-emerald-500/90 text-white';
        let pulseRing = 'bg-emerald-400/40';

        if (isCritical) {
          markerBorderColor = 'border-rose-400 bg-rose-600 text-white animate-pulse';
          pulseRing = 'bg-rose-500/60 animate-ping';
        } else if (isWarning) {
          markerBorderColor = 'border-amber-400 bg-amber-500 text-white';
          pulseRing = 'bg-amber-400/50';
        }

        return (
          <div
            key={spot.id}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group"
            onClick={() => openInspector(spot.id)}
            onMouseEnter={() => setHoveredAsset(spot.id)}
            onMouseLeave={() => setHoveredAsset(null)}
          >
            {/* Animated Pulse Halo Ring */}
            <div
              className={`absolute -inset-2 rounded-full transition-all duration-300 pointer-events-none ${pulseRing}`}
            />

            {/* Hotspot Target Marker */}
            <div
              className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-xl transition-all duration-200 group-hover:scale-125 ${markerBorderColor} ${
                isSelected ? 'ring-4 ring-sky-400 scale-125' : ''
              }`}
            >
              <span className="font-mono text-[9px] font-bold tracking-tight">
                {spot.id.replace('GEN-0', 'G').replace('BAT-0', 'B').replace('FUEL-0', 'F').replace('COM-0', 'C').replace('LAB-0', 'L').replace('BLD-0', 'M').replace('WTR-0', 'W')}
              </span>
            </div>

            {/* Floating Live Telemetry Tooltip on Hover or when Selected or Critical */}
            {(isHovered || isSelected || isCritical) && (
              <div
                className={`absolute bottom-9 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md border text-xs whitespace-nowrap min-w-[170px] pointer-events-auto transition-all animate-in fade-in zoom-in duration-150 ${
                  isCritical
                    ? 'bg-rose-950/95 border-rose-500/80 text-rose-100 ring-2 ring-rose-500/40'
                    : isWarning
                    ? 'bg-amber-950/95 border-amber-500/80 text-amber-100'
                    : 'bg-slate-900/95 border-slate-700/90 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1.5 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sky-400">{spot.id}</span>
                    <span className="text-[11px] text-slate-200">{spot.name}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isCritical
                        ? 'bg-rose-500 text-white'
                        : isWarning
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-300">
                  {telemetry.temperature !== undefined && (
                    <div>
                      Temp: <strong className="text-white font-mono">{telemetry.temperature}°C</strong>
                    </div>
                  )}
                  {telemetry.vibration !== undefined && (
                    <div>
                      Vib: <strong className="text-white font-mono">{telemetry.vibration} mm/s</strong>
                    </div>
                  )}
                  {telemetry.load !== undefined && (
                    <div>
                      Load: <strong className="text-white font-mono">{telemetry.load}%</strong>
                    </div>
                  )}
                  {telemetry.healthScore !== undefined && (
                    <div>
                      Health: <strong className="text-white font-mono">{telemetry.healthScore}%</strong>
                    </div>
                  )}
                </div>

                <div className="mt-1.5 pt-1 border-t border-white/10 text-[9px] text-sky-400 font-semibold flex items-center justify-between">
                  <span>Click to open live diagnostics</span>
                  <span>→</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Mission Control Legend & Status Footer */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-4">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Subsystem Status:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Nominal</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Warning</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Critical</span>
          </span>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span>Interactive Telemetry Hotspots (9 Active Assets)</span>
        </div>
      </div>
    </div>
  );
}

export default StationTwinView;
