import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Building2, Radio, Shield, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

/**
 * FIRST SCREEN — STATION SELECTION
 * Clean, distraction-free institutional landing screen.
 * Displays only:
 * - Indian Antarctic Mission Control
 * - Digital Twin & Remote Operations Platform
 * - Two large station choices: BHARATI and MAITRI
 * - Clean institutional attribution
 */
export function LandingPage() {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState(() => telemetryEngine.getState());

  useEffect(() => {
    const unsub = telemetryEngine.subscribe((state) => {
      setTelemetry(state);
    });
    return () => unsub();
  }, []);

  const bhtTel = telemetry.BHT || {};
  const mtrTel = telemetry.MTR || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Institutional Top Strip */}
      <div className="w-full bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-semibold text-slate-800">National Centre for Polar and Ocean Research (NCPOR)</span>
          <span className="text-slate-300">•</span>
          <span>Ministry of Earth Sciences, Govt. of India</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>Antarctic Treaty System Protocol Compliant</span>
        </div>
      </div>

      {/* Main Centered Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        {/* Top Header */}
        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200">
            <Compass className="w-3.5 h-3.5" />
            Polar Operations Directorate
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Indian Antarctic Mission Control
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Digital Twin & Remote Operations Platform
          </p>
        </div>

        {/* Center of page: Two Large Station Choices */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto text-left">
          {/* 1. BHARATI STATION CARD */}
          <div
            onClick={() => navigate('/station/bharati')}
            className="group relative bg-white rounded-xl border border-slate-200/90 p-6 md:p-8 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-sky-800 tracking-wider uppercase">
                    East Antarctica · 69°S
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 group-hover:text-sky-900 transition-colors">
                    BHARATI
                  </h2>
                </div>
                <StatusBadge status={bhtTel.stationStatus || 'Operational'} size="md" />
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Indian Antarctic Research Station
              </p>

              <div className="space-y-2 text-xs text-slate-500 py-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium text-slate-700">Larsemann Hills</span>
                </div>
                <div className="flex justify-between">
                  <span>Water Supply</span>
                  <span className="font-medium text-slate-700">Sea Water Pump (Desalination)</span>
                </div>
                <div className="flex justify-between">
                  <span>Power System</span>
                  <span className="font-medium text-slate-700">3x Combined Heat & Power (CHP)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-800 transition-colors">
                Enter Bharati Mission Control
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center text-slate-400 group-hover:text-sky-800 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. MAITRI STATION CARD */}
          <div
            onClick={() => navigate('/station/maitri')}
            className="group relative bg-white rounded-xl border border-slate-200/90 p-6 md:p-8 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-sky-800 tracking-wider uppercase">
                    Queen Maud Land · 70°S
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 group-hover:text-sky-900 transition-colors">
                    MAITRI
                  </h2>
                </div>
                <StatusBadge status={mtrTel.stationStatus || 'Operational'} size="md" />
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Indian Antarctic Research Station
              </p>

              <div className="space-y-2 text-xs text-slate-500 py-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium text-slate-700">Schirmacher Oasis</span>
                </div>
                <div className="flex justify-between">
                  <span>Water Supply</span>
                  <span className="font-medium text-slate-700">Lake Priyadarshini (Lake Pump)</span>
                </div>
                <div className="flex justify-between">
                  <span>Power System</span>
                  <span className="font-medium text-slate-700">Polar Diesel Genset Station</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-800 transition-colors">
                Enter Maitri Mission Control
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center text-slate-400 group-hover:text-sky-800 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational software disclaimer */}
        <div className="mt-12 text-xs text-slate-400 max-w-xl">
          Authorized personnel only. Live telemetry streams synchronized via polar satellite tracking relays.
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} National Centre for Polar and Ocean Research, Goa, India.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">System Version 2.4-PROD</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            Telemetry Link Active
          </span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
