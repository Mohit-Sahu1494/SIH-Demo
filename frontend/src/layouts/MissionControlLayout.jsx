import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Compass,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Wind,
  Gauge,
  Zap,
  Flame,
  Droplets,
  Radio,
  Boxes,
  AlertTriangle,
  Wrench,
  GitFork,
  Cpu,
  TrendingDown,
  Scale,
  Clock,
  ShieldCheck,
  Building,
  Ship,
  Bell,
} from 'lucide-react';
import StationSwitcher from '../components/common/StationSwitcher.jsx';
import DemoControlBar from '../components/common/DemoControlBar.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

export function MissionControlLayout() {
  const { stationId = 'bharati' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize station code
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const currentStation = STATIONS[currentStationCode] || STATIONS.BHT;

  // Real-time telemetry state subscription
  const [telemetryState, setTelemetryState] = useState(() => telemetryEngine.getState());
  const [antarcticTime, setAntarcticTime] = useState('');

  // Collapsible sidebar groups
  const [collapsedSections, setCollapsedSections] = useState({
    environment: false,
    infrastructure: false,
    operations: false,
    digitalTwin: false,
  });

  useEffect(() => {
    const unsubscribe = telemetryEngine.subscribe((state) => {
      setTelemetryState(state);
    });
    return () => unsubscribe();
  }, []);

  // Update Antarctic station local time (UTC+5 for Larsemann / UTC+0 for Maitri)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Bharati is UTC+5 (same as IST approx), Maitri is UTC+0
      const offsetHours = currentStationCode === 'BHT' ? 5 : 0;
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const stationDate = new Date(utc + 3600000 * offsetHours);

      const timeStr = stationDate.toTimeString().split(' ')[0];
      const dateStr = stationDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setAntarcticTime(`${timeStr} (UTC${offsetHours >= 0 ? `+${offsetHours}` : offsetHours}) · ${dateStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [currentStationCode]);

  const toggleSection = (sec) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const currentTel = telemetryState[currentStationCode] || telemetryState.BHT;
  const isSatelliteLost = currentTel?.satellite?.isLost;

  // Dynamically compute active alert count from telemetry state
  const activeAlertCount = useMemo(() => {
    let count = 2; // baseline alerts (CHP warning, water consumables)
    if (currentTel?.injections?.chpFailure) count += 1;
    if (currentTel?.injections?.pumpFailure) count += 1;
    if (currentTel?.injections?.satelliteFailure) count += 1;
    if (currentTel?.injections?.lowFuel) count += 1;
    return count;
  }, [currentTel?.injections]);

  const handleStationSwitch = (code) => {
    navigate(`/station/${code.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Demo Simulation Failure Injection Bar
      <DemoControlBar currentStation={currentStation.name} /> */}

      {/* Main Mission Control Header */}
      <header className="bg-[#0B2545] border-b border-white/10 sticky top-0 z-40 text-white">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Station Switcher + Operational Status */}
          <div className="flex items-center gap-3">
            <StationSwitcher
              currentStationCode={currentStationCode}
              onSelectStation={handleStationSwitch}
              status={currentTel?.stationStatus || 'Operational'}
            />

            {/* <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/20 text-xs text-slate-300">
              <span className="font-mono text-[11px] text-slate-300 font-medium">
                {currentStation.location.latitude}, {currentStation.location.longitude}
              </span>
              <span className="text-slate-500">•</span>
              <span>{currentStation.waterSource}</span>
            </div> */}
          </div>

          {/* Right Header Status Telemetry */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Quick Operational Alerts Link */}
            <Link
              to={`/station/${stationId}/alerts`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
                activeAlertCount > 2
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
              title="View Station Operational Alerts"
            >
              <Bell className={`w-3.5 h-3.5 ${activeAlertCount > 2 ? 'text-rose-400' : 'text-slate-300'}`} />
              <span className="hidden sm:inline font-semibold">Alerts</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                  activeAlertCount > 0 ? 'bg-rose-600 text-white' : 'bg-white/20 text-white'
                }`}
              >
                {activeAlertCount}
              </span>
            </Link>

            {/* Last update */}
            {/* <div className="hidden sm:flex flex-col text-right">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Telemetry Age</span>
              <span className={`font-mono font-medium ${isSatelliteLost ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                {isSatelliteLost ? '17 min ago (STALE)' : `Updated ${telemetryState.telemetryAgeSeconds}s ago`}
              </span>
            </div> */}

            {/* Antarctic Local Time */}
            {/* <div className="hidden lg:flex flex-col text-right">
              <span className="text-slate-400 text-[10px] uppercase font-medium">Station Time</span>
              <span className="font-mono text-slate-700 font-medium flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-slate-400" />
                {antarcticTime}
              </span>
            </div> */}

            {/* Satellite Link Status */}
           {/* <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-slate-50 border-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSatelliteLost ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Satellite Link</span>
                <span className={`text-xs font-semibold ${isSatelliteLost ? 'text-rose-700' : 'text-slate-800'}`}>
                  {isSatelliteLost ? 'LOST / OFFLINE' : 'Connected'}
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      {/* Body container with persistent scientific sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Sidebar */}
        <aside className="w-64 bg-[#0B2545] text-white border-r border-white/10 flex flex-col shrink-0 overflow-y-auto">
       
          <nav className="flex-1 mt-3 p-3 space-y-4 text-xs font-medium text-slate-300">
            {/* 1. Overview */}
            <div>
              <NavLink
                to={`/station/${stationId}`}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-white/10 text-slate-300 hover:text-white'
                  }`
                }
              >
                <Activity className="w-4 h-4 text-slate-300" />
                <span>Station Overview</span>
              </NavLink>
            </div>

            {/* 2. Environment Section */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('environment')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  Environment
                </span>
                {collapsedSections.environment ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {!collapsedSections.environment && (
                <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                  <NavLink
                    to={`/station/${stationId}/environment`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Thermometer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Live Conditions & Trends</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 3. Infrastructure Section */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('infrastructure')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  Infrastructure
                </span>
                {collapsedSections.infrastructure ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {!collapsedSections.infrastructure && (
                <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                  {currentStationCode === 'BHT' ? (
                    <>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-1`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-300" />
                        <span>CHP-1 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-2`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-300" />
                        <span>CHP-2 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-3`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>CHP-3 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/sea-water-pump`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Droplets className="w-3.5 h-3.5 text-slate-300" />
                        <span>Sea Water Pump</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to={`/station/${stationId}/systems/power-system`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-300" />
                        <span>Power System</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/lake-water-pump`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                          }`
                        }
                      >
                        <Droplets className="w-3.5 h-3.5 text-slate-300" />
                        <span>Lake Water Pump</span>
                      </NavLink>
                    </>
                  )}

                  <NavLink
                    to={`/station/${stationId}/systems/fuel-farm`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Flame className="w-3.5 h-3.5 text-slate-300" />
                    <span>Fuel Reserve</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/systems/satellite-communication`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Radio className="w-3.5 h-3.5 text-slate-300" />
                    <span>Satellite Link</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 4. Operations Section */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('operations')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Wrench className="w-3.5 h-3.5" />
                  Operations
                </span>
                {collapsedSections.operations ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {!collapsedSections.operations && (
                <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                  <NavLink
                    to={`/station/${stationId}/alerts`}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${activeAlertCount > 2 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                      <span>Alert Center</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                      activeAlertCount > 2 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeAlertCount}
                    </span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/tracking`}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Ship className="w-3.5 h-3.5 text-sky-400" />
                      <span>Vessel Tracking</span>
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/logistics`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Boxes className="w-3.5 h-3.5 text-slate-300" />
                    <span>Logistics Inventory</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 5. Digital Twin Section */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('digitalTwin')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <GitFork className="w-3.5 h-3.5" />
                  Digital Twin
                </span>
                {collapsedSections.digitalTwin ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {!collapsedSections.digitalTwin && (
                <div className="pl-4 space-y-0.5 border-l border-white/10 ml-3">
                  <NavLink
                    to={`/station/${stationId}/digital-twin`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <GitFork className="w-3.5 h-3.5 text-sky-400" />
                    <span>Dependency Map</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/simulator`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-300" />
                    <span>Scenario Simulator</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/forecast`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-white bg-sky-600 font-semibold' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-slate-300" />
                    <span>Resource Forecast</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 6. Overview Station Comparison */}
            <div className="pt-2 border-t border-white/10">
              <NavLink
                to="/operations/compare"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md ${
                    isActive ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                  }`
                }
              >
                <Scale className="w-4 h-4 text-slate-300" />
                <span>Station Comparison</span>
              </NavLink>
            </div>
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-3 border-t border-white/10 bg-white/5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Station Health</span>
              <span className="font-semibold text-white">{currentTel?.healthScore || 88} / 100</span>
            </div>
            <div className="mt-1.5 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentTel?.healthScore || 88}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#F8FAFC]">
          <Outlet context={{ telemetry: currentTel, stationConfig: currentStation }} />
        </main>
      </div>
    </div>
  );
}

export default MissionControlLayout;
