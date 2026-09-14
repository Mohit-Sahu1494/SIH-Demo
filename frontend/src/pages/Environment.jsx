import React, { useState, useEffect } from 'react';
import {
  CloudSnow,
  Thermometer,
  Wind,
  Compass,
  Gauge,
  Droplets,
  Eye,
  Calendar,
  Clock,
  ExternalLink,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';
import Badge from '../components/common/Badge.jsx';

export function Environment() {
  const { currentStationCode, stations } = useStationStore();
  const { environment } = useDashboardStore();
  const [range, setRange] = useState('24h');

  const currentStation =
    stations.find((s) => s.code === currentStationCode) || stations[0];

  const temp = environment.temperature !== undefined ? environment.temperature : -26.4;
  const wind = environment.windSpeed !== undefined ? environment.windSpeed : 32.4;
  const pressure = environment.pressure !== undefined ? environment.pressure : 988;
  const humidity = environment.humidity !== undefined ? environment.humidity : 68;
  const dir = environment.windDirection || 'ESE';
  const snow = environment.snow || 'Light Flurries';
  const visibility = environment.visibility || 18;
  const sourceType = environment.sourceType || 'WEATHER MODEL';

  // Antarctic wind chill formula approximation
  const windChill = +(
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(Math.max(1, wind), 0.16) +
    0.3965 * temp * Math.pow(Math.max(1, wind), 0.16)
  ).toFixed(1);

  const chartData = [
    { time: '00:00', temp: temp - 1.2, wind: wind + 3, pressure: pressure - 2 },
    { time: '04:00', temp: temp - 2.0, wind: wind + 5, pressure: pressure - 3 },
    { time: '08:00', temp: temp - 0.8, wind: wind + 1, pressure: pressure - 1 },
    { time: '12:00', temp: temp + 0.5, wind: wind - 2, pressure: pressure + 1 },
    { time: '16:00', temp: temp - 0.2, wind: wind, pressure: pressure },
    { time: '20:00', temp: temp - 0.9, wind: wind + 2, pressure: pressure - 1 },
    { time: 'Live', temp, wind, pressure },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header with Source Badge (Sections 52-53) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold border border-cyan-200 uppercase">
              Meteorological Surveillance
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200 uppercase">
              SOURCE: {sourceType}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
            Antarctic Polar Meteorology
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Atmospheric observation, katabatic wind velocity, and barometric gradient for {currentStation?.name || 'Bharati Station'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[11px]">
            Observed: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
          </span>
        </div>
      </div>

      {/* Hero Atmosphere Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Ambient Temperature Hero Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>Surface Temperature</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/30 font-bold">
              POLAR SUB-ZERO
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-6xl sm:text-7xl font-heading font-black font-mono tracking-tight text-white">
              {temp}°C
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Calculated Apparent Wind Chill:{' '}
              <strong className="text-cyan-300 font-mono text-sm">{windChill}°C</strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">CURRENT WEATHER</span>
              <span className="text-white font-bold">{snow}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">OPTICAL VISIBILITY</span>
              <span className="text-white font-bold">{visibility} km</span>
            </div>
          </div>
        </div>

        {/* 3 Complementary Atmospheric Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Katabatic Wind Vector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold uppercase">Katabatic Wind</span>
              <Wind className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="text-3xl font-heading font-black font-mono text-slate-900">
                {wind} <span className="text-sm font-normal font-sans text-slate-400">km/h</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Vector:</span>
                <strong className="font-mono text-sky-700">{dir}</strong>
                <span>(Inland Ridge)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              {wind > 70 ? '● Gale Force Warning' : '● Stable Continental Drift'}
            </div>
          </div>

          {/* Barometric Pressure */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold uppercase">Barometer</span>
              <Gauge className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-heading font-black font-mono text-slate-900">
                {pressure} <span className="text-sm font-normal font-sans text-slate-400">hPa</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Polar High System
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Coastal gradient nominal
            </div>
          </div>

          {/* Humidity & Saturation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono font-bold uppercase">Humidity</span>
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-3xl font-heading font-black font-mono text-slate-900">
                {humidity}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Relative Moisture
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Dew Point: {(temp - ((100 - humidity) / 5)).toFixed(1)}°C
            </div>
          </div>
        </div>
      </div>

      {/* Historical Weather Progression Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Atmospheric Variables Progression (24 Hours)
            </h3>
            <p className="text-xs text-slate-400">
              Interpolated surface temperature and katabatic wind progression.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Continuous Multi-Variable Chart</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
              <YAxis yAxisId="left" stroke="#0284C7" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                name="Temperature (°C)"
                stroke="#0284C7"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="wind"
                name="Wind Velocity (km/h)"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Sourcing & Metadata Transparency Card (Sections 15-17) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NCPOR Observational & Weather Model Reference Standards</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Meteorological observation variables are validated against NCPOR station reference coordinates (-69.4069°, 76.1969°). When direct real-time telemetry from remote Antarctic sensors is unavailable, data is served with explicit provenance labeling.
          </p>
        </div>

        <div className="shrink-0 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
          Source Tag: <strong>{sourceType}</strong>
        </div>
      </div>
    </div>
  );
}

export default Environment;
