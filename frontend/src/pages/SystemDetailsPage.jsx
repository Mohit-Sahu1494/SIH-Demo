import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

      {/* Performance Trend Line Chart */}
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
              <span className="w-2.5 h-0.5 bg-sky-700 rounded-full" />
              <span>Load (%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-0.5 bg-amber-600 rounded-full" />
              <span>Temperature (°C)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="load" stroke="#0284C7" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="temp" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health & Dependencies Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Section */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Health & Degradation
            </h2>
            <DataSourceBadge type="DERIVED" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-xl text-slate-900 border-t-emerald-600">
              {currentHealth}%
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Overall Equipment Health
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vibration index, thermal stress accumulation, and lube oil quality within acceptable parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Dependencies Section */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Subsystem Dependencies
            </h2>
            <GitFork className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-medium text-slate-400 uppercase text-[10px] tracking-wider">
                Directly Supplies / Affects:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {system.dependencies?.supplies?.map((dep) => (
                  <span
                    key={dep}
                    className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-medium"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-slate-400 uppercase text-[10px] tracking-wider">
                Upstream Feed:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {system.dependencies?.affectedBy?.map((up) => (
                  <span
                    key={up}
                    className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium"
                  >
                    {up}
                  </span>
                ))}
              </div>
            </div>
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
