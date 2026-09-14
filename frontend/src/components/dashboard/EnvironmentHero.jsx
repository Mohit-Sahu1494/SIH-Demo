import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import DataSourceBadge from '../common/DataSourceBadge.jsx';

/**
 * Main Environmental Hero Card
 * Occupies 60-70% content width, showing the 4 primary meteorological parameters:
 * Temperature, Wind Speed, Relative Humidity, Air Pressure
 * With 'LIVE · NCPOR' badge and subtle trend sparkline
 */
export function EnvironmentHero({
  stationName = 'Bharati',
  temperature = -16.4,
  windSpeed = 22.3,
  humidity = 26.3,
  pressure = 973,
  updatedText = '8 seconds ago',
  sourceBadge = 'LIVE · NCPOR',
  isStale = false,
}) {
  // 12-point subtle sparkline trend data
  const trendData = [
    { v: temperature - 1.2 },
    { v: temperature - 0.8 },
    { v: temperature - 1.5 },
    { v: temperature - 1.1 },
    { v: temperature - 0.5 },
    { v: temperature - 0.2 },
    { v: temperature - 0.4 },
    { v: temperature + 0.1 },
    { v: temperature - 0.1 },
    { v: temperature + 0.3 },
    { v: temperature + 0.1 },
    { v: temperature },
  ];

  return (
    <div className="w-full lg:w-[68%] bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-xs relative overflow-hidden">
      {/* Header bar of Environment Card */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-base md:text-lg font-semibold text-slate-900 tracking-tight">
            {stationName} — Current Environment
          </h2>
          <DataSourceBadge type={sourceBadge} />
        </div>

        {isStale && (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase bg-rose-50 text-rose-800 border border-rose-200">
            STALE TELEMETRY
          </span>
        )}
      </div>

      {/* Primary 4-Value Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5">
        {/* Temperature */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Temperature
          </span>
          <div className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {temperature > 0 ? `+${temperature}` : temperature}°C
          </div>
          <span className="text-[11px] text-slate-400">Surface 2m sensor</span>
        </div>

        {/* Wind Speed */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Wind Speed
          </span>
          <div className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {windSpeed} <span className="text-base font-normal text-slate-600">m/s</span>
          </div>
          <span className="text-[11px] text-slate-400">Ultrasonic anemometer</span>
        </div>

        {/* Relative Humidity */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Humidity
          </span>
          <div className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {humidity}%
          </div>
          <span className="text-[11px] text-slate-400">Capacitive hygrometer</span>
        </div>

        {/* Air Pressure */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pressure
          </span>
          <div className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {pressure} <span className="text-base font-normal text-slate-600">hPa</span>
          </div>
          <span className="text-[11px] text-slate-400">Barometric sensor</span>
        </div>
      </div>

      {/* Subtle Trend Line & Timestamp Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Updated {updatedText}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">Station Met Mast Tower</span>
        </div>

        {/* Subtle trend sparkline */}
        <div className="w-32 h-6 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#0284C7"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentHero;
