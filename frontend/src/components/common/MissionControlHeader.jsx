import React from 'react';
import { Clock } from 'lucide-react';
import StationSwitcher from './StationSwitcher.jsx';

export function MissionControlHeader({
  currentStationCode,
  currentStation,
  currentTel,
  antarcticTime,
  onStationSwitch,
}) {
  const isSatelliteLost = currentTel?.satellite?.isLost;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/25 px-4 sm:px-5 py-2.5 shadow-sm backdrop-blur-xl">

          {/* LEFT — Station */}
          <div className="flex items-center gap-3 min-w-0">
            <StationSwitcher
              currentStationCode={currentStationCode}
              onSelectStation={onStationSwitch}
              status={currentTel?.stationStatus || 'Operational'}
            />
          </div>

          {/* RIGHT — Telemetry */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs">

            {/* Telemetry Age */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-slate-700/60 text-[10px] uppercase font-semibold tracking-wide">
                Telemetry Age
              </span>

              <span
                className={`font-mono font-semibold ${
                  isSatelliteLost
                    ? 'text-rose-700'
                    : 'text-slate-800'
                }`}
              >
                {isSatelliteLost
                  ? '17 min ago (STALE)'
                  : `Updated ${currentTel?.telemetryAgeSeconds ?? 0}s ago`}
              </span>
            </div>

            {/* Station Time */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-slate-700/60 text-[10px] uppercase font-semibold tracking-wide">
                Station Time
              </span>

              <span className="font-mono text-slate-800 font-semibold flex items-center gap-1.5 justify-end">
                <Clock className="w-3 h-3 text-slate-600/70" />
                {antarcticTime}
              </span>
            </div>

            {/* Satellite Link */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md ${
                isSatelliteLost
                  ? 'bg-rose-50/45 border-rose-300/50'
                  : 'bg-white/30 border-white/50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isSatelliteLost
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-slate-700/60 uppercase font-semibold tracking-wide">
                  Satellite Link
                </span>

                <span
                  className={`text-xs font-semibold ${
                    isSatelliteLost
                      ? 'text-rose-700'
                      : 'text-slate-800'
                  }`}
                >
                  {isSatelliteLost
                    ? 'LOST / OFFLINE'
                    : 'Connected'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

export default MissionControlHeader;