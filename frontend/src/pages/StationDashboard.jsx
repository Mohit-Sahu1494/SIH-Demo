import React from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import EnvironmentHero from '../components/dashboard/EnvironmentHero.jsx';
import SystemCard from '../components/dashboard/SystemCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import { ArrowRight, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export function StationDashboard() {
  const { stationId = 'bharati' } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const telemetry = context.telemetry || {};

  // Extract environmental values from telemetry engine
  const env = telemetry.environment || {
    temperature: -16.4,
    windSpeed: 22.3,
    humidity: 26.3,
    pressure: 973,
    updatedAt: '8 seconds ago',
    source: 'LIVE · NCPOR',
    isStale: false,
  };

  // Systems list specific to the current station
  const systems = station.systems || [];

  // Determine dynamic metric value if affected by simulation failure injection
  const getDynamicMetric = (sys) => {
    if (sys.id === 'chp-1' && telemetry.power?.chp1) {
      return { label: 'Load', value: telemetry.power.chp1.load };
    }
    if (sys.id === 'chp-2' && telemetry.power?.chp2) {
      return { label: 'Load', value: telemetry.power.chp2.load };
    }
    if (sys.id === 'chp-3' && telemetry.power?.chp3) {
      return { label: 'Load', value: telemetry.power.chp3.load };
    }
    if (sys.id === 'fuel-farm' && telemetry.fuel) {
      return { label: 'Remaining', value: `${telemetry.fuel.reservePercent}%` };
    }
    if (sys.id === 'hvac' && telemetry.heating) {
      return { label: 'Heating Load', value: `${telemetry.heating.demandPercent}%` };
    }
    if ((sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') && telemetry.water) {
      return { label: 'Intake Flow', value: `${telemetry.water.pumpFlowLh.toLocaleString()} L/h` };
    }
    if (sys.id === 'satellite-communication' && telemetry.satellite) {
      return {
        label: 'Status',
        value: telemetry.satellite.isLost ? 'LINK LOST' : `${telemetry.satellite.latencyMs} ms`,
      };
    }
    return sys.primaryMetric;
  };

  const getDynamicStatus = (sys) => {
    if (sys.id === 'chp-3' && telemetry.power?.chp3) {
      return telemetry.power.chp3.status;
    }
    if ((sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') && telemetry.water) {
      return telemetry.water.pumpStatus;
    }
    if (sys.id === 'satellite-communication' && telemetry.satellite?.isLost) {
      return 'Critical';
    }
    if (sys.id === 'fuel-farm' && telemetry.fuel?.reservePercent < 35) {
      return 'Warning';
    }
    return sys.status;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Main Environment Card (approx 60-70% content width) */}
      <section className="flex flex-col lg:flex-row gap-6 items-start">
        <EnvironmentHero
          stationName={station.name}
          temperature={env.temperature}
          windSpeed={env.windSpeed}
          humidity={env.humidity}
          pressure={env.pressure}
          updatedText={env.updatedAt}
          sourceBadge={env.source}
          isStale={env.isStale}
        />

        {/* Supplementary Health & Resupply Card */}
        <div className="w-full lg:w-[32%] bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Station Health
              </span>
              <StatusBadge status={telemetry.stationStatus || 'Operational'} size="sm" />
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {telemetry.healthScore || 88}
                </span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Composite score across energy, water, infrastructure, and satellite telemetry links.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Next Resupply Vessel</span>
              <span className="font-semibold text-slate-800 font-mono">
                {station.resupply.daysUntilNext} days
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Water Source Mode</span>
              <span className="font-medium text-slate-800">
                {currentStationCode === 'BHT' ? 'Seawater RO' : 'Lake Intake'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Station Systems Grid (Strict Two-Column Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Station Systems
            </h2>
          </div>

        
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systems.map((sys) => {
            const status = getDynamicStatus(sys);
            const metric = getDynamicMetric(sys);

            return (
              <SystemCard
                key={sys.id}
                name={sys.name}
                status={status}
                primaryMetric={metric}
                onClick={() => navigate(`/station/${stationId}/systems/${sys.id}`)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default StationDashboard;
