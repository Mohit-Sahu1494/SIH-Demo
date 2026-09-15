import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Check,
  Building2,
} from 'lucide-react';

import { STATIONS } from '../../data/stationConfig.js';
import StatusBadge from './StatusBadge.jsx';

export function StationSwitcher({
  currentStationCode = 'BHT',
  onSelectStation,
  status = 'Operational',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const currentStation =
    STATIONS[currentStationCode.toUpperCase()] ||
    STATIONS.BHT;

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // SELECT STATION
  // =========================================================

  const handleSelect = (code) => {
    setIsOpen(false);

    if (onSelectStation) {
      onSelectStation(code);
    } else {
      navigate(
        `/station/${code.toLowerCase()}`
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
    >

      {/* =====================================================
          STATION BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex
          items-center
          gap-3
          py-1.5
          px-2.5
          rounded-xl

          bg-white/10
          backdrop-blur-md

          border
          border-transparent

          hover:bg-white/20
          hover:border-white/30

          transition-all
          duration-200

          focus:outline-none
          focus:ring-2
          focus:ring-white/30
        "
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >

        {/* Station Name */}
        <div className="flex items-center gap-2">

          <span
            className="
              text-xl
              font-semibold
              tracking-tight
              text-slate-900
              whitespace-nowrap
            "
          >
            {currentStation.name} Station
          </span>

          <ChevronDown
            className={`
              w-4
              h-4
              text-slate-600
              transition-transform
              duration-200
              ${
                isOpen
                  ? 'rotate-180'
                  : ''
              }
            `}
          />

        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusBadge
            status={status}
            size="sm"
          />
        </div>

      </button>

      {/* =====================================================
          DROPDOWN
      ====================================================== */}

      {isOpen && (
        <div
          className="
            absolute
            left-0
            mt-2
            w-72
            origin-top-left
            z-50

            rounded-2xl

            bg-white/55
            backdrop-blur-2xl

            border
            border-white/60

            shadow-xl

            overflow-hidden

            focus:outline-none
          "
          role="menu"
        >

          {/* =================================================
              DROPDOWN HEADER
          ================================================== */}

          <div
            className="
              px-4
              py-3

              border-b
              border-white/40

              bg-white/10
            "
          >
            <p
              className="
                text-[10px]
                font-semibold
                text-slate-600/70
                uppercase
                tracking-[0.12em]
              "
            >
              Switch Research Station
            </p>
          </div>

          {/* =================================================
              STATION LIST
          ================================================== */}

          <div className="p-1.5 space-y-1">

            {Object.values(STATIONS).map(
              (station) => {
                const isSelected =
                  station.code ===
                  currentStationCode.toUpperCase();

                return (
                  <button
                    key={station.code}
                    type="button"
                    onClick={() =>
                      handleSelect(station.name)
                    }
                    className={` 
                      w-full flex items-center justify-between px-3 py-3 text-sm rounded-xl text-left transition-all duration-150
                      ${
                        isSelected
                          ? `
                            bg-white/45
                            border
                            border-white/50
                          `
                          : `
                            border
                            border-transparent
                            hover:bg-white/30
                            hover:border-white/30
                          `
                      }
                    `}
                    role="menuitem"
                  >

                    {/* Station Info */}
                    <div className="flex items-center gap-3">

                      {/* Icon */}
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center

                          rounded-lg

                          bg-white/35
                          backdrop-blur-md

                          border
                          border-white/40
                        "
                      >
                        <Building2
                          className={`
                            w-4
                            h-4
                            ${
                              isSelected
                                ? 'text-sky-700'
                                : 'text-slate-500'
                            }
                          `}
                        />
                      </div>

                      {/* Name + Location */}
                      <div className="min-w-0">

                        <div
                          className={`
                            font-medium
                            ${
                              isSelected
                                ? 'text-slate-900'
                                : 'text-slate-800'
                            }
                          `}
                        >
                          {station.name} Station
                        </div>

                        <div
                          className="
                            text-xs
                            text-slate-500
                            truncate
                          "
                        >
                          {station.location.region}
                        </div>

                      </div>

                    </div>

                    {/* Selected */}
                    {isSelected && (
                      <Check
                        className="
                          w-4
                          h-4
                          shrink-0
                          text-sky-700
                        "
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default StationSwitcher;