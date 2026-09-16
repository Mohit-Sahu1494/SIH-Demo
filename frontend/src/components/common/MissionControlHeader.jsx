import React from 'react';
import { Clock, Menu } from 'lucide-react';
import StationSwitcher from './StationSwitcher.jsx';

export function MissionControlHeader({
  currentStationCode,
  currentStation,
  currentTel,
  antarcticTime,
  onStationSwitch,
  onToggleMobileMenu,
}) {
  const isSatelliteLost = currentTel?.satellite?.isLost;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-white/40 bg-white/30 px-3 sm:px-5 py-2 sm:py-2.5 shadow-sm backdrop-blur-xl">

          {/* LEFT — Mobile Menu & Station */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label="Open Navigation"
                className="md:hidden p-1.5 rounded-lg bg-white/60 border border-slate-200/60 text-slate-700 hover:bg-white transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <StationSwitcher
              currentStationCode={currentStationCode}
              onSelectStation={onStationSwitch}
              status={currentTel?.stationStatus || 'Operational'}
            />
          </div>

          {/* RIGHT — Telemetry */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs">
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
            
             
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

export default MissionControlHeader;