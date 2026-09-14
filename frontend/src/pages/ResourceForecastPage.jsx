import React from 'react';
import { useParams } from 'react-router-dom';
import { TrendingDown, AlertTriangle, ShieldCheck, Ship, Calendar } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

export function ResourceForecastPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const isBharati = currentStationCode === 'BHT';

  const telemetry = telemetryEngine.calculateTelemetry(currentStationCode);
  const nextResupplyDays = telemetry.fuel.nextResupplyDays;

  // Resources monitored for runway
  const resources = [
    {
      name: 'Polar Diesel Fuel (CHP & Boilers)',
      key: 'fuel',
      remainingDays: telemetry.fuel.runwayDays,
      unit: 'Days of Continuous Operation',
      stock: `${telemetry.fuel.reservePercent}%`,
      capacity: `${telemetry.fuel.currentLiters.toLocaleString()} L`,
      burnRate: `${telemetry.fuel.dailyBurnLiters.toLocaleString()} L/day`,
    },
    {
      name: 'Food Provisions & Cold Rations',
      key: 'food',
      remainingDays: isBharati ? 72 : 73,
      unit: 'Days of Crew Caloric Reserve',
      stock: isBharati ? '72%' : '76%',
      capacity: isBharati ? '5,180 kg' : '4,800 kg',
      burnRate: isBharati ? '72 kg/day' : '65 kg/day',
    },
    {
      name: 'Medical & Emergency Life Support Supplies',
      key: 'medical',
      remainingDays: isBharati ? 103 : 110,
      unit: 'Certified Expedition Standard Days',
      stock: 'Full Stock',
      capacity: 'Level 3 Polar Trauma Kit',
      burnRate: 'Routine / Contingency',
    },
    {
      name: 'Water Treatment Consumables & RO Cartridges',
      key: 'water_treatment',
      remainingDays: 29,
      unit: 'Filtration Membrane Life',
      stock: '37%',
      capacity: '87 cartridges remaining',
      burnRate: '3 replacements / day',
    },
    {
      name: 'Critical Machine Spare Parts & Seal Kits',
      key: 'spares',
      remainingDays: isBharati ? 85 : 90,
      unit: 'Operational Integrity Buffer',
      stock: '79%',
      capacity: '142 critical modules',
      burnRate: 'Predictive Scheduled',
    },
  ];

  // Find any deficits where days remaining < nextResupplyDays
  const deficits = resources.filter((r) => r.remainingDays < nextResupplyDays);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resource Runway Forecast
            </h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive consumption models evaluated against scheduled polar resupply vessel arrivals
          </p>
        </div>

        {/* Resupply vessel milestone badge */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center gap-3 text-xs">
          <Ship className="w-5 h-5 text-sky-800" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Next Resupply Vessel</div>
            <div className="font-bold text-slate-900">{station.resupply.vesselName}</div>
            <div className="text-slate-500 font-mono">Arrival in {nextResupplyDays} days</div>
          </div>
        </div>
      </div>

      {/* Automatic Resupply Deficit Warnings */}
      {deficits.length > 0 && (
        <div className="space-y-3">
          {deficits.map((def) => {
            const gapDays = nextResupplyDays - def.remainingDays;
            return (
              <div
                key={def.name}
                className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs shadow-xs"
              >
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-950">
                      CRITICAL RESOURCE DEFICIT PROJECTED: {def.name}
                    </span>
                    <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      {gapDays} Day Deficit
                    </span>
                  </div>
                  <p className="mt-1 text-amber-900">
                    {def.name} will be depleted <strong>{gapDays} days before</strong> the scheduled resupply vessel ({nextResupplyDays} days remaining).
                    Initiate rationing protocols or arrange expedited emergency aerial resupply.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Horizontal Runway Visualization */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Operational Runway vs Resupply Horizon (120-Day Baseline)
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-800" />
              <span>Resupply Target ({nextResupplyDays}d)</span>
            </span>
          </div>
        </div>

        {/* List of Resource Horizontal Runways */}
        <div className="space-y-6">
          {resources.map((res) => {
            const maxScaleDays = 120;
            const runwayPercent = Math.min(100, Math.round((res.remainingDays / maxScaleDays) * 100));
            const targetPercent = Math.min(100, Math.round((nextResupplyDays / maxScaleDays) * 100));
            const isDeficit = res.remainingDays < nextResupplyDays;

            return (
              <div key={res.name} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{res.name}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">
                      (Stock: {res.stock} · {res.capacity})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${isDeficit ? 'text-amber-800' : 'text-slate-900'}`}>
                      {res.remainingDays} days
                    </span>
                    <span className="text-[11px] text-slate-400">({res.burnRate})</span>
                  </div>
                </div>

                {/* Horizontal Bar Track */}
                <div className="relative w-full h-4 bg-slate-100 rounded-md overflow-hidden">
                  {/* Resupply vertical line milestone */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
                    style={{ left: `${targetPercent}%` }}
                    title={`Resupply target: ${nextResupplyDays} days`}
                  />

                  {/* Filled Runway Bar */}
                  <div
                    className={`h-full rounded-md transition-all duration-300 ${
                      isDeficit ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${runwayPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 days</span>
                  <span className="text-slate-600 font-semibold">Resupply: {nextResupplyDays}d</span>
                  <span>120 days</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ResourceForecastPage;
