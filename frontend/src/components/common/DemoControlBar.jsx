import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, Radio, Snowflake, Fuel, Wrench, ShieldAlert } from 'lucide-react';
import telemetryEngine from '../../simulation/telemetryEngine.js';

/**
 * Presentation-Ready Demo Failure Injection Control Bar
 * Enables quick one-click scenario triggers for SIH jury presentations
 */
export function DemoControlBar({ currentStation = 'Bharati' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeInjections, setActiveInjections] = useState({ ...telemetryEngine.injections });

  const toggleInjection = (key, customVal = null) => {
    const nextVal = customVal !== null ? customVal : !activeInjections[key];
    telemetryEngine.injectFailure(key, nextVal);
    setActiveInjections({ ...telemetryEngine.injections });
  };

  const handleReset = () => {
    telemetryEngine.resetFailures();
    setActiveInjections({ ...telemetryEngine.injections });
  };

  const activeCount = Object.values(activeInjections).filter(Boolean).length;

  return (
    <div className="border-b border-slate-200/90 bg-slate-50/90 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Toggle trigger */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors border ${
              activeCount > 0
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulation Demo Controller</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Inject operational stresses to test Digital Twin dependency cascades
          </span>
        </div>

        {/* Quick actions bar */}
        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
              title="Reset all failure injections back to baseline"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Reset Baseline</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Control Palette */}
      {isOpen && (
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 shadow-inner">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* 1. CHP Failure */}
            <button
              type="button"
              onClick={() => toggleInjection('chpFailure')}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.chpFailure
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <AlertTriangle className={`w-3.5 h-3.5 ${activeInjections.chpFailure ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.chpFailure ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">CHP Overheat/Trip</div>
              <div className="text-[10px] text-slate-500">Drops 120 kVA generation</div>
            </button>

            {/* 2. Pump Failure */}
            <button
              type="button"
              onClick={() => toggleInjection('pumpFailure')}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.pumpFailure
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Wrench className={`w-3.5 h-3.5 ${activeInjections.pumpFailure ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.pumpFailure ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">Water Pump Freeze</div>
              <div className="text-[10px] text-slate-500">Flow drops to 0 L/h</div>
            </button>

            {/* 3. Satellite Blackout */}
            <button
              type="button"
              onClick={() => toggleInjection('satelliteFailure')}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.satelliteFailure
                  ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Radio className={`w-3.5 h-3.5 ${activeInjections.satelliteFailure ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.satelliteFailure ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">Satellite Link Lost</div>
              <div className="text-[10px] text-slate-500">Forces STALE DATA state</div>
            </button>

            {/* 4. Extreme Cold Polar Blast */}
            <button
              type="button"
              onClick={() => toggleInjection('extremeCold')}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.extremeCold
                  ? 'bg-sky-50 border-sky-400 text-sky-900 ring-1 ring-sky-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Snowflake className={`w-3.5 h-3.5 ${activeInjections.extremeCold ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.extremeCold ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">Extreme Cold (-42°C)</div>
              <div className="text-[10px] text-slate-500">+31% heating demand</div>
            </button>

            {/* 5. Low Fuel Reserve */}
            <button
              type="button"
              onClick={() => toggleInjection('lowFuel')}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.lowFuel
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Fuel className={`w-3.5 h-3.5 ${activeInjections.lowFuel ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.lowFuel ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">Low Fuel (28%)</div>
              <div className="text-[10px] text-slate-500">Runway drops below resupply</div>
            </button>

            {/* 6. Supply Delay (+14 days) */}
            <button
              type="button"
              onClick={() => toggleInjection('supplyDelayDays', activeInjections.supplyDelayDays ? 0 : 14)}
              className={`p-2 rounded-md border text-left flex flex-col justify-between transition-all ${
                activeInjections.supplyDelayDays > 0
                  ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <ShieldAlert className={`w-3.5 h-3.5 ${activeInjections.supplyDelayDays > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeInjections.supplyDelayDays > 0 ? '+14D' : 'READY'}
                </span>
              </div>
              <div className="mt-1 font-semibold text-xs">Ice-Lock Resupply Delay</div>
              <div className="text-[10px] text-slate-500">Postpones vessel arrival</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoControlBar;
