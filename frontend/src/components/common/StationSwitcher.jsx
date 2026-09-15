import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Building2, Radio } from 'lucide-react';
import { STATIONS } from '../../data/stationConfig.js';
import StatusBadge from './StatusBadge.jsx';

export function StationSwitcher({ currentStationCode = 'BHT', onSelectStation, status = 'Operational' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentStation = STATIONS[currentStationCode.toUpperCase()] || STATIONS.BHT;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setIsOpen(false);
    if (onSelectStation) {
      onSelectStation(code);
    } else {
      navigate(`/station/${code.toLowerCase()}`);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-white">
            {currentStation.name} Station
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} size="sm" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-lg bg-[#0B2545] shadow-2xl border border-white/10 py-1.5 z-50 focus:outline-none">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Research Station
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            {Object.values(STATIONS).map((station) => {
              const isSelected = station.code === currentStationCode.toUpperCase();
              return (
                <button
                  key={station.code}
                  onClick={() => handleSelect(station.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors text-left ${
                    isSelected ? 'bg-sky-600 text-white font-medium' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-white font-medium">{station.name} Station</div>
                      <div className="text-xs text-slate-400">{station.location.region}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-white/10 bg-white/5 rounded-b-lg">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-slate-400" />
              Direct telemetry stream switch
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationSwitcher;
