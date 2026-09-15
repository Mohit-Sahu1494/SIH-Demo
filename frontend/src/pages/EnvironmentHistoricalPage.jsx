import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Thermometer, Wind, Compass, Gauge, Droplets } from 'lucide-react';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import environmentService from '../services/environmentService.js';

function ChartTooltip({ active, payload, label, unit, metricLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-lg shadow-lg px-3 py-2 text-xs backdrop-blur-sm">
      <div className="text-slate-400">{label}</div>
      <div className="font-semibold text-white mt-0.5">
        {metricLabel}: {payload[0].value} {unit}
      </div>
    </div>
  );
}

export function EnvironmentHistoricalPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;

  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [selectedRange, setSelectedRange] = useState('24h'); // '24h' | '7d' | '30d'

  const series = environmentService.getHistoricalSeries(currentStationCode, selectedMetric, selectedRange);

  const metricsConfig = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C' },
    { id: 'windSpeed', label: 'Wind Speed', icon: Wind, unit: 'm/s' },
    { id: 'windDirection', label: 'Wind Direction', icon: Compass, unit: 'deg' },
    { id: 'pressure', label: 'Air Pressure', icon: Gauge, unit: 'hPa' },
    { id: 'humidity', label: 'Relative Humidity', icon: Droplets, unit: '%' },
  ];

  const activeMetric = metricsConfig.find((m) => m.id === selectedMetric);

  // Forces the chart to fully remount — and its fill/line to animate in from
  // zero — every time the metric or time range selection changes.
  const chartInstanceKey = `${currentStationCode}-${selectedMetric}-${selectedRange}`;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-10 space-y-4">
      <style>{`
        @keyframes eh-drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%, -4%) scale(1.08); } }
        @keyframes eh-drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-4%, 3%) scale(1.05); } }
        @keyframes eh-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .eh-glow-a { animation: eh-drift-a 16s ease-in-out infinite; }
        .eh-glow-b { animation: eh-drift-b 20s ease-in-out infinite; }
        .eh-panel-in { animation: eh-fade-up .5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .eh-glow-a, .eh-glow-b, .eh-panel-in { animation: none; }
        }
      `}</style>

      {/* Header */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Atmospheric Observatory</h1>
            <DataSourceBadge type="LIVE · NCPOR" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical met mast telemetry from {station.name} Station
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shrink-0">
          {[
            { id: '24h', label: '24H' },
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRange(r.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                selectedRange === r.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric selector — glass cards over a soft icy backdrop */}
      <div className="relative rounded-2xl overflow-hidden p-3 bg-gradient-to-br from-sky-100 via-slate-100 to-sky-50">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
          {metricsConfig.map((m) => {
            const isSelected = selectedMetric === m.id;
            const IconComp = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 backdrop-blur-md ${
                  isSelected
                    ? 'bg-white/70 border-sky-400 shadow-md ring-1 ring-sky-300'
                    : 'bg-white/40 border-white/60 hover:bg-white/60 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-sky-600 text-white' : 'bg-white/70 text-slate-500'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{m.unit}</span>
                </div>
                <div
                  className={`text-xs font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}
                >
                  {m.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart panel — dark, icy backdrop, filled area, replays on selection */}
      <div className="eh-panel-in relative rounded-2xl overflow-hidden shadow-lg" key={chartInstanceKey}>
        {/* Generated icy / aurora backdrop — decorative, no external image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d1c] via-[#0b1f3a] to-[#0e2a4d]">
          <div className="eh-glow-a absolute -top-16 -left-10 w-72 h-72 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="eh-glow-b absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl" />
          <svg
            className="absolute bottom-0 left-0 right-0 w-full opacity-25 blur-[1px]"
            viewBox="0 0 800 160"
            preserveAspectRatio="none"
          >
            <path
              d="M0,140 L80,90 L160,120 L240,60 L320,110 L420,40 L500,100 L600,70 L680,130 L760,85 L800,120 L800,160 L0,160 Z"
              fill="rgba(186,230,253,0.18)"
            />
            <path
              d="M0,150 L100,120 L220,145 L340,100 L460,140 L580,110 L700,150 L800,130 L800,160 L0,160 Z"
              fill="rgba(224,242,254,0.12)"
            />
          </svg>
        </div>

        <div className="relative px-4 sm:px-6 py-5 space-y-5">
          {/* Stats — glass chips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Average', value: series.stats.average, color: 'text-white' },
              { label: 'Minimum', value: series.stats.minimum, color: 'text-cyan-300' },
              { label: 'Maximum', value: series.stats.maximum, color: 'text-amber-300' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-3 py-2.5 bg-white/10 border border-white/10 backdrop-blur-md"
              >
                <div className="text-[10px] uppercase tracking-wide text-slate-300">{s.label}</div>
                <div className={`text-lg font-bold mt-0.5 tabular-nums font-mono ${s.color}`}>
                  {s.value} <span className="text-xs text-slate-300">{series.stats.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filled trend chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="eh-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(226,232,240,0.5)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="rgba(226,232,240,0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={
                    <ChartTooltip unit={series.stats.unit} metricLabel={activeMetric?.label} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7dd3fc"
                  strokeWidth={2.5}
                  fill="url(#eh-fill)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#7dd3fc', stroke: '#0b1f3a', strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={1300}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span>Source: NCPOR Automatic Weather Station (AWS) Array</span>
            <span>Calibrated against WMO Antarctic Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentHistoricalPage;