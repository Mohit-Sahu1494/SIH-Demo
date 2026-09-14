import React from 'react';
import { X, Activity, Thermometer, Zap, AlertCircle, Wrench, ArrowRight } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore.js';
import StatusBadge from '../common/StatusBadge.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import ProgressBar from '../common/ProgressBar.jsx';

export function TelemetryInspectorDrawer() {
  const { selectedAssetId, isInspectorOpen, closeInspector, assetsTelemetry } = useDashboardStore();

  if (!isInspectorOpen || !selectedAssetId) return null;

  const current = assetsTelemetry[selectedAssetId] || {
    temperature: 78.4,
    vibration: 2.0,
    load: 72.0,
    status: 'HEALTHY',
    healthScore: 92,
  };

  const isGen02 = selectedAssetId === 'GEN-02';
  const isCritical = current.status === 'CRITICAL';
  const isWarning = current.status === 'WARNING';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-sky-600 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {selectedAssetId}
            </span>
            <StatusBadge status={current.status} size="sm" />
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-lg">
            {isGen02 ? 'Secondary Diesel Genset 02' : `${selectedAssetId} Infrastructure Unit`}
          </h3>
          <p className="text-xs text-slate-500">Live 3D Digital Twin Sensor Inspector</p>
        </div>
        <button
          onClick={closeInspector}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Asset Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Health Score Banner */}
        <div className={`p-4 rounded-xl border ${
          isCritical ? 'bg-rose-50 border-rose-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Asset Health Rating</span>
            <span className={`text-xl font-heading font-bold ${
              isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {current.healthScore || 92}%
            </span>
          </div>
          <ProgressBar
            value={current.healthScore || 92}
            color={isCritical ? 'rose' : isWarning ? 'amber' : 'emerald'}
            showPercentage={false}
          />
        </div>

        {/* Live Gauges */}
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">
            Real-time Operational Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                <span>Core Temp</span>
              </div>
              <div className="text-xl font-heading font-bold text-slate-900">
                {current.temperature !== undefined ? `${current.temperature}°C` : 'Nominal'}
              </div>
              <span className={`text-[10px] font-semibold ${current.temperature > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {current.temperature > 90 ? 'Critical Thermal Limit' : 'Safe Band < 85°C'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>Vibration</span>
              </div>
              <div className="text-xl font-heading font-bold text-slate-900">
                {current.vibration !== undefined ? `${current.vibration} mm/s` : '0.2 mm/s'}
              </div>
              <span className={`text-[10px] font-semibold ${current.vibration > 3.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {current.vibration > 3.5 ? 'Harmonic Spike' : 'Balanced < 2.5'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Current Load</span>
              </div>
              <div className="text-xl font-heading font-bold text-slate-900">
                {current.load !== undefined ? `${current.load}%` : '45%'}
              </div>
              <span className="text-[10px] text-slate-400">Microgrid duty</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Wrench className="w-3.5 h-3.5 text-slate-600" />
                <span>Maintenance</span>
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-1">
                {isCritical ? 'Immediate' : 'In 16 days'}
              </div>
              <span className="text-[10px] text-slate-400">KOEL 500-hr service</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Recommendation */}
        {isCritical && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Automated Prescriptive Action
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              Overheating detected on GEN-02. Transfer station electrical bus to reserve GEN-01 and inspect secondary glycol radiator fans.
            </p>
          </div>
        )}

        {/* Specifications */}
        <div className="border-t border-slate-100 pt-4 text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Manufacturer:</span>
            <span className="font-medium text-slate-900">Kirloskar Oil Engines Ltd</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Rated Output:</span>
            <span className="font-medium text-slate-900">100 kVA / 80 kW</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Telemetry Source:</span>
            <span className="font-mono text-purple-700 font-bold">SIMULATED (MQTT)</span>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={closeInspector}
        >
          Dismiss Inspector
        </Button>
      </div>
    </div>
  );
}

export default TelemetryInspectorDrawer;
