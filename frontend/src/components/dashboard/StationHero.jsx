import React from 'react';
import { MapPin, Radio, Calendar, Compass } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';
import Badge from '../common/Badge.jsx';

export function StationHero({ station }) {
  if (!station) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute top-0 right-0 w-96 h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              STATION CODE: {station.code}
            </span>
            <StatusBadge status={station.status} />
            <Badge variant="simulated" size="sm">
              DATA SOURCE: SIMULATED (MQTT)
            </Badge>
          </div>

          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            {station.name.toUpperCase()}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {station.location?.latitude?.toFixed(2)}°S, {station.location?.longitude?.toFixed(2)}°E
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>{station.location?.region || 'Larsemann Hills, East Antarctica'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Est. {station.commissionedYear || 2012}</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Telemetry Ingestion: Active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Overall Health Score Box */}
        <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
              Station Overall Health
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-heading font-black text-slate-900 tracking-tight">
                {station.healthScore || 91}%
              </span>
              <span className="text-xs font-semibold text-emerald-600">Operational</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Evaluated from 4 sub-domains
            </span>
          </div>

          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-heading font-bold text-xs text-slate-800">
            {station.healthScore || 91}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StationHero;
