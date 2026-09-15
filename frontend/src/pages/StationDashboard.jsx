import React from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import EnvironmentHero from '../components/dashboard/EnvironmentHero.jsx';
import SystemCard from '../components/dashboard/SystemCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import { ArrowRight, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

// ADD THIS
import Bg from '../assets/bg.png';

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
    if (
      (sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') &&
      telemetry.water
    ) {
      return {
        label: 'Intake Flow',
        value: `${telemetry.water.pumpFlowLh.toLocaleString()} L/h`,
      };
    }
    if (sys.id === 'satellite-communication' && telemetry.satellite) {
      return {
        label: 'Status',
        value: telemetry.satellite.isLost
          ? 'LINK LOST'
          : `${telemetry.satellite.latencyMs} ms`,
      };
    }
    return sys.primaryMetric;
  };

  const getDynamicStatus = (sys) => {
    if (sys.id === 'chp-3' && telemetry.power?.chp3) {
      return telemetry.power.chp3.status;
    }
    if (
      (sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') &&
      telemetry.water
    ) {
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
    // BACKGROUND CONTAINER
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${Bg})`,
      }}
    >
      {/* Optional white overlay for readability */}
      <div className="absolute inset-0 bg-white/35 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative max-w-6xl mx-auto space-y-8 p-4 md:p-6">
        
        {/* 1. Main Environment Card */}
        <section className="flex flex-col lg:flex-row gap-6 items-start justify-center">
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
        </section>

        {/* 2. Station Systems Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                Station Systems
              </h2>

              <p className="text-xs text-slate-500">
                Primary operational modules ({systems.length} systems registered)
              </p>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Click any system to view telemetry, dependencies & maintenance history
            </span>
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
                  onClick={() =>
                    navigate(`/station/${stationId}/systems/${sys.id}`)
                  }
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default StationDashboard;