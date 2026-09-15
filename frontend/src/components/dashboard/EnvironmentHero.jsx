import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import DataSourceBadge from '../common/DataSourceBadge.jsx';

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
  // Keep existing data/logic unchanged
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
    <div className="w-full bg-transparent rounded-2xl border-0 shadow-none overflow-hidden">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Location-style icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
            <svg
              className="h-6 w-6 text-sky-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate">
                {stationName} — Current Environment
              </h2>

              <DataSourceBadge type={sourceBadge} />
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>Updated {updatedText}</span>
            </div>
          </div>
        </div>

        {isStale && (
          <span className="ml-3 shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-rose-700">
            STALE TELEMETRY
          </span>
        )}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.4fr] gap-6">
          
          {/* ================= TEMPERATURE ================= */}
          <div className="flex min-h-[190px] flex-col justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-sm px-6 py-5">
            
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Temperature
            </span>

            <div className="mt-2 flex items-start">
              <span className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
                {temperature > 0 ? `+${temperature}` : temperature}
              </span>

              <span className="mt-2 ml-1 text-2xl font-medium text-slate-500">
                °C
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {/* Weather-style decorative icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md border border-white/30 shadow-sm">
                <svg
                  className="h-5 w-5 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Surface 2m sensor
                </p>
                <p className="text-xs text-slate-400">
                  Live environmental reading
                </p>
              </div>
            </div>
          </div>

          {/* ================= 4 METRIC CARDS ================= */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Wind Speed */}
            <div className="group rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-4 shadow-sm transition hover:bg-white/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-sm">
                  <svg
                    className="h-5 w-5 text-violet-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 8h11a3 3 0 1 0-3-3" />
                    <path d="M3 12h15a3 3 0 1 1-3 3" />
                    <path d="M3 16h8" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Wind speed
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-slate-900">
                    {windSpeed}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      m/s
                    </span>
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-slate-400">
                Ultrasonic anemometer
              </p>
            </div>

            {/* Humidity */}
            <div className="group rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-4 shadow-sm transition hover:bg-white/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-sm">
                  <svg
                    className="h-5 w-5 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Z" />
                    <path d="M9.5 15.5a2.5 2.5 0 0 0 2.5 2.5" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Humidity
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-slate-900">
                    {humidity}%
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-slate-400">
                Capacitive hygrometer
              </p>
            </div>

            {/* Pressure */}
            <div className="group rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-4 shadow-sm transition hover:bg-white/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md border border-white/30 shadow-sm">
                  <svg
                    className="h-5 w-5 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 17a8 8 0 1 1 16 0" />
                    <path d="M12 13l4-4" />
                    <path d="M4 17h2M18 17h2" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pressure
                  </p>

                  <p className="mt-0.5 text-lg font-semibold text-slate-900">
                    {pressure}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      hPa
                    </span>
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-slate-400">
                Barometric sensor
              </p>
            </div>

            {/* Trend */}
            <div className="group rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-4 shadow-sm transition hover:bg-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Temperature trend
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    Live trend
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/30 backdrop-blur-md border border-white/30 shadow-sm">
                  <svg
                    className="h-4 w-4 text-sky-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 17l6-6 4 4 8-9" />
                    <path d="M17 6h4v4" />
                  </svg>
                </div>
              </div>

              <div className="mt-2 h-8 w-full opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <YAxis domain={['auto', 'auto']} hide />

                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#0284C7"
                      strokeWidth={1.8}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default EnvironmentHero;