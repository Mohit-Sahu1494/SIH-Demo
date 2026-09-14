import React from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/common/Badge.jsx';
import StationCanvas from '../components/digital-twin/StationCanvas.jsx';
import Card from '../components/common/Card.jsx';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function DigitalTwinPage() {
  const { currentStationCode } = useStationStore();
  const { assetsTelemetry, openInspector } = useDashboardStore();

  const primaryAssets = [
    { id: 'GEN-01', name: 'Primary Diesel Genset 01', category: 'Power' },
    { id: 'GEN-02', name: 'Secondary Diesel Genset 02', category: 'Power', highlight: true },
    { id: 'BAT-01', name: 'Central Battery ESS Bank', category: 'Power' },
    { id: 'FUEL-01', name: 'Primary Jet A-1 Fuel Tank 01', category: 'Logistics' },
    { id: 'BLD-01', name: 'Main Station Living Complex', category: 'Buildings' },
    { id: 'LAB-01', name: 'Atmospheric Physics Lab', category: 'Buildings' },
    { id: 'COM-01', name: 'Satellite Ground Radome', category: 'Communication' },
    { id: 'WTR-01', name: 'RO Water Treatment Plant', category: 'Utilities' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antarctic Digital Twin — Spatial Operations"
        subtitle={`Interactive 3D structural model & live telemetry binding for ${
          currentStationCode === 'BHT' ? 'Bharati Station (Larsemann Hills)' : 'Maitri Station (Schirmacher Oasis)'
        }`}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="healthy" size="sm">REAL-TIME TELEMETRY BOUND</Badge>
            <Badge variant="simulated" size="sm">SOURCE: SIMULATED (MQTT)</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 3D Canvas */}
        <div className="lg:col-span-9">
          <Card className="p-2 overflow-hidden border-slate-200">
            <StationCanvas className="h-[620px] w-full" />
          </Card>
        </div>

        {/* 3D Asset Roster / Quick Select */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Spatial Asset Roster
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Click any asset below or directly on the 3D model to open its telemetry inspector.
            </p>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {primaryAssets.map((asset) => {
                const telem = assetsTelemetry[asset.id] || {};
                const status = telem.status || 'HEALTHY';
                const isCritical = status === 'CRITICAL';
                const isWarning = status === 'WARNING';

                return (
                  <button
                    key={asset.id}
                    onClick={() => openInspector(asset.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isCritical
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                        : isWarning
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <span className="font-mono text-sky-700">{asset.id}</span>
                        {asset.highlight && isCritical && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5">
                        {asset.name}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold uppercase block ${
                        isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {status}
                      </span>
                      {telem.temperature !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {telem.temperature}°C
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Color Coding Legend */}
          <Card className="text-xs space-y-2">
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px] block">
              3D Status Shader Palette
            </span>
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Healthy / Nominal</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">&gt; 85%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Warning Advisory</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">70 - 85%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500 animate-pulse" />
                <span>Critical Anomaly</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">&lt; 70%</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DigitalTwinPage;
