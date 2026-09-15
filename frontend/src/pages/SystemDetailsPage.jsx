import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Zap,
  Flame,
  Droplets,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  GitFork,
  Radio,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-xs space-y-1">
      <div className="font-semibold text-slate-700">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-slate-500">{p.dataKey === 'load' ? 'Load' : 'Temp'}</span>
          <span className="font-semibold text-slate-800 ml-auto">
            {p.value}
            {p.dataKey === 'load' ? '%' : '°C'}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SystemDetailsPage() {
  const { stationId = 'bharati', systemId = 'chp-2' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;

  // Find system definition
  const system = station.systems.find((s) => s.id === systemId) || station.systems[0];
  const telemetry = telemetryEngine.calculateTelemetry(currentStationCode);

  // Time-series mock data for performance trend chart
  const trendData = [
    { time: '08:00', load: 68, temp: 72 },
    { time: '09:00', load: 70, temp: 73 },
    { time: '10:00', load: 74, temp: 75 },
    { time: '11:00', load: 72, temp: 74 },
    { time: '12:00', load: 76, temp: 77 },
    { time: '13:00', load: 75, temp: 76 },
    { time: '14:00', load: 71, temp: 74 },
    { time: '15:00', load: 73, temp: 75 },
  ];

  // If CHP-3 is selected and failure is active, adjust values
  const isChp3Tripped = system.id === 'chp-3' && telemetry.injections?.chpFailure;
  const currentStatus = isChp3Tripped ? 'Critical' : system.status;
  const currentHealth = isChp3Tripped ? 32 : system.healthScore;

  // Unique per station+system so the chart fully remounts (and its draw-in
  // animation replays from zero) every time the user switches pages/systems.
  const chartInstanceKey = `${currentStationCode}-${system.id}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to={`/station/${stationId}`} className="hover:text-slate-900 transition-colors">
          {station.name} Station
        </Link>
        <span>/</span>
        <span className="text-slate-400">Infrastructure</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{system.name}</span>
      </nav>

      {/* Header section */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {system.name}
            </h1>
            <StatusBadge status={currentStatus} />
            <DataSourceBadge type="SIMULATED" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {system.type}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Category</span>
            <div className="font-semibold text-slate-800">{system.category}</div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(system.specs).slice(0, 5).map(([key, val]) => (
          <div key={key} className="bg-white rounded-lg border border-slate-200/90 p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {val}
            </div>
            <div className="mt-1">
              <DataSourceBadge type="SIMULATED" className="text-[9px] px-1.5 py-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trend — animated overlaid area chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Performance Trend
            </h2>
            <p className="text-xs text-slate-500">
              Operational load and thermal curve over previous 8 hours
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Load (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Temperature (°C)</span>
            </div>
          </div>
        </div>

        {/* key={chartInstanceKey} forces a fresh mount (and animation replay)
            every time the station or system changes, instead of the chart
            silently reusing its old DOM/animation state across navigations. */}
        <div className="h-64 w-full" key={chartInstanceKey}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`fillLoad-${chartInstanceKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`fillTemp-${chartInstanceKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#fb7185"
                strokeWidth={2}
                fill={`url(#fillTemp-${chartInstanceKey})`}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive
                animationDuration={1400}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="load"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill={`url(#fillLoad-${chartInstanceKey})`}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health & Degradation — full width */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Health & Degradation
          </h2>
          <DataSourceBadge type="DERIVED" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-2xl text-slate-900 border-t-emerald-600 shrink-0">
            {currentHealth}%
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              Overall Equipment Health
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md">
              Vibration index, thermal stress accumulation, and lube oil quality within acceptable parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Maintenance & Associated Alerts */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Maintenance & Inspection Log
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Last Service: <strong>{system.maintenance?.lastServiceDays} days ago</strong></span>
            <span>•</span>
            <span>Next Inspection: <strong className="text-sky-800">{system.maintenance?.nextInspectionDays} days</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          {system.maintenance?.recentLogs?.map((log, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-slate-800">{log.date}</span>
                <p className="text-slate-600 mt-0.5">{log.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemDetailsPage;