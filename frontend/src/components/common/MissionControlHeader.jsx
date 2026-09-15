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
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StationSwitcher
            currentStationCode={currentStationCode}
            onSelectStation={onStationSwitch}
            status={currentTel?.stationStatus || 'Operational'}
          />
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-slate-400 text-[10px] uppercase font-medium">
              Telemetry Age
            </span>
            <span
              className={`font-mono font-medium ${
                isSatelliteLost
                  ? 'text-rose-600 font-bold'
                  : 'text-slate-700'
              }`}
            >
              {isSatelliteLost
                ? '17 min ago (STALE)'
                : `Updated ${currentTel?.telemetryAgeSeconds ?? 0}s ago`}
            </span>
          </div>

          <div className="hidden lg:flex flex-col text-right">
            <span className="text-slate-400 text-[10px] uppercase font-medium">
              Station Time
            </span>
            <span className="font-mono text-slate-700 font-medium flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-slate-400" />
              {antarcticTime}
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-slate-50 border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isSatelliteLost
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-500'
              }`}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                Satellite Link
              </span>
              <span
                className={`text-xs font-semibold ${
                  isSatelliteLost ? 'text-rose-700' : 'text-slate-800'
                }`}
              >
                {isSatelliteLost ? 'LOST / OFFLINE' : 'Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default MissionControlHeader;