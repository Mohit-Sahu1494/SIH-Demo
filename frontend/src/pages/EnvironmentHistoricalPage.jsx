import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Thermometer, Wind, Compass, Gauge, Droplets, Calendar } from 'lucide-react';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import environmentService from '../services/environmentService.js';

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Atmospheric & Meteorological Observatory
            </h1>
            <DataSourceBadge type="LIVE · NCPOR" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical observational telemetry from {station.name} Station Met Mast Array
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          {[
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRange(r.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedRange === r.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {metricsConfig.map((m) => {
          const isSelected = selectedMetric === m.id;
          const IconComp = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-white border-sky-800 shadow-xs ring-1 ring-sky-800'
                  : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-sky-800' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono">{m.unit}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900">{m.label}</div>
            </button>
          );
        })}
      </div>

      {/* Primary Scientific Chart Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        {/* Statistics Bar: Average, Minimum, Maximum */}
        <div className="grid grid-cols-3 gap-4 pb-5 border-b border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Mean Average
            </span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              {series.stats.average} {series.stats.unit}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Minimum Recorded
            </span>
            <div className="text-xl font-bold text-sky-800 mt-1 font-mono">
              {series.stats.minimum} {series.stats.unit}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Maximum Peak
            </span>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
              {series.stats.maximum} {series.stats.unit}
            </div>
          </div>
        </div>

        {/* Recharts Scientific Line Plot */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                formatter={(val) => [`${val} ${series.stats.unit}`, metricsConfig.find((m) => m.id === selectedMetric)?.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0284C7"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#0284C7' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Source: NCPOR Automatic Weather Station (AWS) Array</span>
          <span>Calibrated against WMO Antarctic Baseline</span>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentHistoricalPage;
