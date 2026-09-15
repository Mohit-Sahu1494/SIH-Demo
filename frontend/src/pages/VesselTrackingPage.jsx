import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Ship, Anchor, MapPin } from 'lucide-react';
import { VESSELS, calculateRemainingEta } from '../data/vesselTrackingData.js';

export function VesselTrackingPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode =
    stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';

  const defaultVesselId =
    currentStationCode === 'MTR' ? 'sa-agulhas-ii' : 'mv-vasiliy-golovnin';

  const [selectedVesselId, setSelectedVesselId] = useState(defaultVesselId);

  // Live countdown tick
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const vessel = useMemo(
    () => VESSELS.find((v) => v.id === selectedVesselId) || VESSELS[0],
    [selectedVesselId]
  );

  const eta = useMemo(
    () => calculateRemainingEta(vessel.scheduledArrivalDate),
    [vessel, now]
  );

  const progress = Math.min(100, Math.max(0, vessel.voyageProgressPercent));

  const currentWaypoint =
    vessel.waypoints.find((wp) => wp.status === 'CURRENT') ||
    vessel.waypoints.find((wp) => wp.status === 'UPCOMING') ||
    vessel.waypoints[vessel.waypoints.length - 1];

  const nextWaypoint =
    vessel.waypoints.find((wp) => wp.status === 'UPCOMING') || currentWaypoint;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-10 space-y-4">
      <style>{`
        @keyframes vt-bob {
          0%, 100% { transform: translate(-50%, 0) rotate(-3deg); }
          50%      { transform: translate(-50%, -7px) rotate(3deg); }
        }
        @keyframes vt-drift {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes vt-ripple {
          0%   { transform: translateX(-50%) scaleX(.6); opacity: .55; }
          100% { transform: translateX(-50%) scaleX(1.6); opacity: 0; }
        }
        .vt-ship  { animation: vt-bob 3.4s ease-in-out infinite; }
        .vt-wave  { animation: vt-drift 14s linear infinite; }
        .vt-wave2 { animation: vt-drift 9s linear infinite reverse; }
        .vt-ripple{ animation: vt-ripple 2.6s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .vt-ship, .vt-wave, .vt-wave2, .vt-ripple { animation: none; }
          .vt-ship { transform: translate(-50%, 0); }
        }
      `}</style>

      {/* Title */}
      <div className="pt-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
          <Ship className="w-5 h-5 text-sky-800" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Vessel Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Resupply ship abhi kahan hai
          </p>
        </div>
      </div>

      {/* Vessel selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {VESSELS.map((v) => {
          const active = selectedVesselId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVesselId(v.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {v.name}
              {v.stationCode === currentStationCode && (
                <span
                  className={`ml-1.5 ${
                    active ? 'text-sky-300' : 'text-sky-600'
                  }`}
                >
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main card */}
      <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        {/* ---------- Ocean scene ---------- */}
        <div className="relative h-52 bg-gradient-to-b from-[#0b2239] via-[#134063] to-[#1b6188] overflow-hidden">
          {/* vessel name + status */}
          <div className="absolute top-4 left-5 right-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {vessel.name}
              </div>
              <div className="text-[11px] text-sky-300/80 truncate">
                {vessel.expedition}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-white/10 rounded-full pl-2 pr-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-semibold text-white">
                {vessel.voyageStatus}
              </span>
            </div>
          </div>

          {/* ship + track */}
          <div className="absolute left-6 right-6 top-[54%]">
            {/* track */}
            <div className="relative h-5 rounded-full bg-white/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />

              {/* waypoint dots */}
              {vessel.waypoints.map((wp, i) => {
                const pos =
                  vessel.waypoints.length > 1
                    ? (i / (vessel.waypoints.length - 1)) * 100
                    : 0;
                return (
                  <span
                    key={wp.id}
                    title={wp.name}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ${
                      wp.status === 'PASSED'
                        ? 'w-1.5 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/30'
                    }`}
                    style={{ left: `${pos}%` }}
                  />
                );
              })}

              {/* ship */}
              <div
                className="absolute -top-6 transition-all duration-700"
                style={{ left: `${progress}%` }}
              >
                <div className="vt-ship">
                  <Ship
                    className="w-7 h-7 text-white"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.45))' }}
                  />
                </div>
                <span className="vt-ripple absolute left-1/2 top-8 w-10 h-1 rounded-full bg-white/50" />
              </div>
            </div>

            {/* ports */}
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-sky-200/80 truncate max-w-[38%]">
                <Anchor className="w-3 h-3 shrink-0" />
                {vessel.departurePort.split(',')[0]}
              </span>
              <span className="font-bold text-white tabular-nums">
                {progress}%
              </span>
              <span className="flex items-center gap-1 text-sky-200/80 truncate max-w-[38%] justify-end">
                <MapPin className="w-3 h-3 shrink-0" />
                {vessel.destinationStation}
              </span>
            </div>
          </div>

          {/* waves */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
            <svg
              className="vt-wave absolute bottom-0 h-16"
              style={{ width: '200%' }}
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C180,110 360,10 720,60 C1080,110 1260,10 1440,60 L1440,120 L0,120 Z"
                fill="rgba(255,255,255,.14)"
              />
            </svg>
            <svg
              className="vt-wave2 absolute bottom-0 h-12"
              style={{ width: '200%' }}
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,70 C240,20 480,110 720,70 C960,30 1200,110 1440,70 L1440,120 L0,120 Z"
                fill="rgba(255,255,255,.1)"
              />
            </svg>
          </div>
        </div>

        {/* ---------- Countdown ---------- */}
        <div className="px-5 py-5 border-b border-slate-100">
          {eta.isArrived ? (
            <div className="text-center text-lg font-bold text-emerald-600">
              Pahunch gaya
            </div>
          ) : (
            <>
              <div className="text-center text-[11px] text-slate-400 mb-2.5">
                Arrives in
              </div>
              <div className="flex items-end justify-center gap-1.5">
                {[
                  { val: eta.days, lbl: 'days' },
                  { val: eta.hours, lbl: 'hrs' },
                  { val: eta.minutes, lbl: 'min' },
                  { val: eta.seconds, lbl: 'sec' },
                ].map(({ val, lbl }, i) => (
                  <React.Fragment key={lbl}>
                    {i > 0 && (
                      <span className="pb-4 text-slate-300 font-light">:</span>
                    )}
                    <div className="text-center w-14">
                      <div className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
                        {String(val).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        {lbl}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ---------- Minimal facts ---------- */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="py-4 px-2">
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              {vessel.currentPosition.distanceRemainingNm}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">NM to go</div>
          </div>
          <div className="py-4 px-2">
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              {vessel.currentPosition.speedKnots}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">knots</div>
          </div>
          <div className="py-4 px-2">
            <div className="text-sm font-bold text-slate-900">
              {new Date(vessel.scheduledArrivalDate).toLocaleDateString(
                'en-GB',
                { day: '2-digit', month: 'short', timeZone: 'UTC' }
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">arrival</div>
          </div>
        </div>

        {/* ---------- Where it is right now ---------- */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {vessel.currentPosition.zoneName}
            </div>
            <div className="text-[11px] text-slate-400 tabular-nums truncate">
              {vessel.currentPosition.latitude},{' '}
              {vessel.currentPosition.longitude}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400">Next stop</div>
            <div className="text-xs font-semibold text-sky-800 truncate max-w-[9rem]">
              {nextWaypoint?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VesselTrackingPage;