import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Ship, Gauge } from 'lucide-react';
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

  // Classify each resource against the resupply horizon, for display styling only.
  const WATCH_BUFFER_DAYS = 15;
  const classify = (r) => {
    const gap = r.remainingDays - nextResupplyDays;
    if (gap < 0) return 'critical';
    if (gap < WATCH_BUFFER_DAYS) return 'watch';
    return 'healthy';
  };

  const maxScaleDays = 120;
  const targetPercent = Math.min(100, (nextResupplyDays / maxScaleDays) * 100);

  const statusStyles = {
    critical: {
      text: 'text-amber-700',
      stroke: '#d97706',
      fillFrom: 'rgba(217,119,6,.28)',
      fillTo: 'rgba(217,119,6,0)',
      chip: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Critical',
    },
    watch: {
      text: 'text-sky-700',
      stroke: '#0369a1',
      fillFrom: 'rgba(3,105,161,.22)',
      fillTo: 'rgba(3,105,161,0)',
      chip: 'bg-sky-50 text-sky-700 border-sky-200',
      label: 'Watch',
    },
    healthy: {
      text: 'text-emerald-700',
      stroke: '#334155',
      fillFrom: 'rgba(51,65,85,.16)',
      fillTo: 'rgba(51,65,85,0)',
      chip: 'bg-slate-50 text-slate-600 border-slate-200',
      label: 'Healthy',
    },
  };

  // Build a smooth depletion curve path (full today -> zero at remainingDays), normalized with pathLength=1
  const buildCurve = (remainingDays) => {
    const w = 100;
    const h = 34;
    const xEnd = Math.min(w, (remainingDays / maxScaleDays) * w);
    const yStart = 3;
    const yEnd = h - 2;
    const c1x = xEnd * 0.35;
    const c2x = xEnd * 0.7;
    return {
      line: `M0,${yStart} C${c1x},${yStart} ${c2x},${yEnd} ${xEnd},${yEnd}`,
      area: `M0,${yStart} C${c1x},${yStart} ${c2x},${yEnd} ${xEnd},${yEnd} L${xEnd},${h} L0,${h} Z`,
      endX: xEnd,
      endY: yEnd,
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-10 space-y-4">
      <style>{`
        @keyframes rf-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes rf-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rf-pulse { 0%,100% { opacity: .9; r: 2.6; } 50% { opacity: .35; r: 5; } }
        .rf-card { animation: rf-fade .5s ease-out both; }
        .rf-line { stroke-dasharray: 1; animation: rf-draw 1.1s ease-out both; }
        .rf-pulse { animation: rf-pulse 2.2s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .rf-card, .rf-line, .rf-pulse { animation: none; }
        }
      `}</style>

      {/* Header */}
      <div className="pt-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Resource Forecast</h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consumption trends projected against the next resupply arrival
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <Ship className="w-4 h-4 text-sky-800" />
          <div className="text-right leading-tight">
            <div className="text-[10px] text-slate-400">{station.resupply.vesselName}</div>
            <div className="text-xs font-bold text-slate-900">{nextResupplyDays}d out</div>
          </div>
        </div>
      </div>

      {/* Deficit alerts */}
      {/* {deficits.length > 0 && (
        <div className="rf-card space-y-2">
          {deficits.map((def) => {
            const gapDays = nextResupplyDays - def.remainingDays;
            return (
              <div
                key={def.key}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-900 leading-snug flex-1">
                  <span className="font-semibold">{def.name.split('(')[0].trim()}</span> runs
                  out{' '}
                  <span className="font-semibold">
                    {gapDays} day{gapDays === 1 ? '' : 's'}
                  </span>{' '}
                  before the ship arrives
                </div>
              </div>
            );
          })}
        </div>
      )} */}

      {/* Forecast cards */}
      <div className="space-y-3">
        {resources.map((res, i) => {
          const status = classify(res);
          const s = statusStyles[status];
          const curve = buildCurve(res.remainingDays);
          const gap = res.remainingDays - nextResupplyDays;

          return (
            <div
              key={res.key}
              className="rf-card rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* Card header */}
              <div className="px-4 sm:px-5 pt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {res.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{res.unit}</div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border ${s.chip}`}
                >
                  {s.label}
                </span>
              </div>

              {/* Animated forecast curve */}
              <div className="px-4 sm:px-5 pt-3">
                <div className="relative">
                  <svg
                    viewBox="0 0 100 34"
                    preserveAspectRatio="none"
                    className="w-full h-20"
                  >
                    <defs>
                      <linearGradient id={`fill-${res.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.fillFrom} />
                        <stop offset="100%" stopColor={s.fillTo} />
                      </linearGradient>
                    </defs>

                    {/* resupply marker */}
                    <line
                      x1={targetPercent}
                      x2={targetPercent}
                      y1="0"
                      y2="34"
                      stroke="#94a3b8"
                      strokeWidth="0.6"
                      strokeDasharray="1.5,1.5"
                    />

                    {/* area under curve */}
                    <path d={curve.area} fill={`url(#fill-${res.key})`} />

                    {/* depletion line */}
                    <path
                      d={curve.line}
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      pathLength="1"
                      className="rf-line"
                      style={{ animationDelay: `${i * 70 + 120}ms` }}
                    />

                    {/* current point, pulsing */}
                    <circle
                      cx={curve.endX}
                      cy={curve.endY}
                      r="2.6"
                      fill={s.stroke}
                      className="rf-pulse"
                    />
                  </svg>

                  <div className="flex justify-between text-[10px] text-slate-400 -mt-1">
                    <span>today</span>
                    <span>{maxScaleDays}d</span>
                  </div>
                </div>
              </div>

              {/* Detail grid — all figures visible */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-2 px-4 sm:px-5 py-4 mt-1 border-t border-slate-100 bg-slate-50/60">
                <div>
                  <div className="text-[10px] text-slate-400">Runway</div>
                  <div className={`text-sm font-bold tabular-nums ${s.text}`}>
                    {res.remainingDays}d
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Stock</div>
                  <div className="text-sm font-bold text-slate-800">{res.stock}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Capacity</div>
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {res.capacity}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Burn rate</div>
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {res.burnRate}
                  </div>
                </div>
              </div>

              {/* Gap vs resupply, only when meaningful */}
              {status !== 'healthy' && (
                <div
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-[11px] border-t ${
                    status === 'critical'
                      ? 'border-amber-100 bg-amber-50/60 text-amber-800'
                      : 'border-sky-100 bg-sky-50/60 text-sky-800'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 shrink-0" />
                  {status === 'critical'
                    ? `Depletes ${Math.abs(gap)} day${Math.abs(gap) === 1 ? '' : 's'} before the resupply vessel arrives`
                    : `${gap} day${gap === 1 ? '' : 's'} of buffer after resupply — worth monitoring`}
                </div>
              )}
              {status === 'healthy' && (
                <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-[11px] border-t border-slate-100 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  Comfortably covers the wait for resupply
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResourceForecastPage;