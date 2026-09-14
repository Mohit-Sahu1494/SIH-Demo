import React, { useState, useEffect } from 'react';
import {
  Zap,
  Battery,
  Fuel,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Cpu,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';
import Badge from '../components/common/Badge.jsx';

export function Energy() {
  const { currentStationCode, stations } = useStationStore();
  const { energy, assetsTelemetry } = useDashboardStore();
  const [range, setRange] = useState('24h');

  const currentStation =
    stations.find((s) => s.code === currentStationCode) || stations[0];

  // Dynamic calculations per requirement
  const gen = energy.generation || 168;
  const cons = energy.consumption || 144;
  const bat = energy.batteryLevel || 88;
  const fuel = energy.fuelLevel || 76.5;

  const balanceDelta = +(gen - cons).toFixed(1);
  const balancePercent = Math.round((balanceDelta / cons) * 100);
  const fuelDaysAutonomy = Math.round((fuel / 100) * 60); // 60 days full tank baseline

  // Generator 1 & 2 individual loads from asset telemetry
  const gen1Load = assetsTelemetry['GEN-01']?.load || 74.0;
  const gen2Load = assetsTelemetry['GEN-02']?.load || 74.5;
  const gen2Status = assetsTelemetry['GEN-02']?.status || 'HEALTHY';

  const chartData = [
    { time: '00:00', generation: 165, consumption: 140, battery: 90 },
    { time: '04:00', generation: 162, consumption: 138, battery: 89 },
    { time: '08:00', generation: 172, consumption: 148, battery: 88 },
    { time: '12:00', generation: 178, consumption: 154, battery: 87 },
    { time: '16:00', generation: 174, consumption: 150, battery: 88 },
    { time: '20:00', generation: 168, consumption: 145, battery: 88 },
    {
      time: 'Live',
      generation: gen,
      consumption: cons,
      battery: bat,
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200 uppercase">
              Microgrid Dispatch
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200 uppercase">
              SOURCE: SIMULATED MQTT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
            Energy Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Power generation, storage and fuel intelligence for {currentStation?.name || 'Bharati Station'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === r ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* Energy Hero with Clear Visual Hierarchy */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Metric: Generation Balance */}
          <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-8">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
              Grid Balance State
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-heading font-black font-mono tracking-tight text-white">
                {balanceDelta >= 0 ? `+${balanceDelta}` : `${balanceDelta}`}
              </span>
              <span className="text-xl font-mono text-slate-400">kW</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generation is currently <strong className="text-emerald-400 font-mono">{balancePercent}%</strong> {balanceDelta >= 0 ? 'above' : 'below'} active base demand.
            </p>
          </div>

          {/* Core Subsystem Split */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Gen
              </span>
              <div className="text-2xl font-heading font-black font-mono text-sky-400">
                {gen} <span className="text-xs font-normal text-slate-400">kW</span>
              </div>
              <span className="text-[10px] text-slate-400">G1 + G2 Active</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Base Demand
              </span>
              <div className="text-2xl font-heading font-black font-mono text-amber-400">
                {cons} <span className="text-xs font-normal text-slate-400">kW</span>
              </div>
              <span className="text-[10px] text-slate-400">Peak: {energy.peakLoad || 184} kW</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                LiFePO4 Storage
              </span>
              <div className="text-2xl font-heading font-black font-mono text-emerald-400">
                {bat}%
              </div>
              <span className="text-[10px] text-slate-400">Float Voltage 54.2V</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Fuel Reserves
              </span>
              <div className="text-2xl font-heading font-black font-mono text-purple-400">
                {fuel}%
              </div>
              <span className="text-[10px] text-slate-400">~{fuelDaysAutonomy} Days Buffer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Energy Flow Diagram (Section 49) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Synchronized Power Flow Topology
            </h3>
            <p className="text-xs text-slate-500">
              Live power distribution from primary gensets, storage banks, and central habitat load bus.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            ● Grid Synchronized
          </span>
        </div>

        {/* Animated Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-4">
          {/* Generation Sources */}
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-mono text-xs">
                  G1
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Primary Genset 01</div>
                  <div className="text-[10px] text-slate-500 font-mono">Load: {gen1Load}% • Nominal</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className={`rounded-xl p-4 border flex items-center justify-between transition-all ${
              gen2Status === 'CRITICAL' ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                  gen2Status === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : 'bg-sky-100 text-sky-700'
                }`}>
                  G2
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Secondary Genset 02</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Load: {gen2Load}% • {gen2Status}
                  </div>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${gen2Status === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            </div>
          </div>

          {/* Central Animated Bus Arrow */}
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              3-Phase AC Busbar
            </div>
            <div className="w-full flex items-center justify-center gap-2 text-sky-600">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-sky-400 to-sky-600" />
              <ArrowRight className="w-5 h-5 animate-pulse" />
              <div className="h-0.5 flex-1 bg-gradient-to-r from-sky-600 to-sky-400" />
            </div>
            <div className="text-xs font-mono font-bold text-slate-800">
              {gen} kW Total Output
            </div>
          </div>

          {/* Consumers & Storage */}
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Station Active Load</div>
                  <div className="text-[10px] text-slate-500 font-mono">{cons} kW • HVAC & Labs</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">86% Bus</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Battery className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">ESS Battery Buffer</div>
                  <div className="text-[10px] text-slate-500 font-mono">SOC: {bat}% • Float Mode</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600">+{Math.max(0, balanceDelta)} kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Right-Side Energy Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clean Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Generation vs. Consumption Profile
              </h3>
              <p className="text-xs text-slate-400">
                Continuous 24-hour balance with live telemetry interpolation.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500">5s Refresh</div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="generation"
                  name="Generation (kW)"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  name="Consumption (kW)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="battery"
                  name="Battery SOC (%)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Dynamic Energy Insights Panel (Section 51) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sky-600 mb-2">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                ENERGY INSIGHT
              </span>
            </div>

            <h4 className="font-heading font-bold text-slate-900 text-lg leading-tight">
              Microgrid Dispatch Assessment
            </h4>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-semibold text-slate-800 block mb-1">
                  Demand Headroom:
                </span>
                Generation is currently <strong className="text-slate-900 font-mono">{balancePercent}%</strong> above active station demand ({gen} kW vs {cons} kW).
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-semibold text-slate-800 block mb-1">
                  Storage Stability:
                </span>
                Battery storage bank is stable at <strong className="text-slate-900 font-mono">{bat}%</strong> capacity with zero thermal degradation.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-semibold text-slate-800 block mb-1">
                  Fuel Autonomy:
                </span>
                Jet A-1 fuel reserves ({fuel}%) are sufficient for approximately <strong className="text-slate-900 font-mono">{fuelDaysAutonomy} days</strong> under nominal polar loading.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              OPERATIONAL RECOMMENDATION:
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {gen2Status === 'CRITICAL'
                ? 'CRITICAL: Shed non-essential thermal load and inspect Genset 02 coolant line.'
                : 'Maintain current dual generator dispatch. Microgrid operating in optimal equilibrium.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Energy;
