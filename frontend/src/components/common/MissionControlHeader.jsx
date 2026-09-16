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
  transparent = false,
}) {
  const isSatelliteLost = currentTel?.satellite?.isLost;

  const headerBg = transparent
    ? 'bg-transparent'
    : 'bg-[#0B2545]';

  const innerBg = transparent
    ? 'bg-white/10 border border-white/20 backdrop-blur-xl shadow-sm'
    : 'bg-[#0B2545] shadow-md backdrop-blur-xl';

  return (
    <header className={`sticky top-0 z-40 w-full ${headerBg}`}>
      <div className="px-3 sm:px-6 py-2.5 sm:py-3">
        <div className={`flex items-center justify-between gap-3 sm:gap-4 rounded-2xl text-white px-3 sm:px-5 py-2 sm:py-2.5 ${innerBg}`}>

          {/* LEFT — Mobile Menu & Station */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label="Open Navigation"
                className="md:hidden p-1.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors shrink-0 shadow-xs cursor-pointer"
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

          {/* RIGHT — Telemetry & Clock */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs">
            {/* Current Time */}
            <div className="flex flex-col text-right">
              <span className="text-white/70 text-[9px] sm:text-[10px] uppercase font-semibold tracking-wide">
                Current Time
              </span>

              <span className="font-mono text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 justify-end">
                <Clock className="w-3 h-3 text-white/80 shrink-0" />
                {antarcticTime}
              </span>
            </div>
          </div>
            
        </div>
      </div>
    </header>
  );
}

export default MissionControlHeader;