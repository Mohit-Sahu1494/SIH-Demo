import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  Building,
} from 'lucide-react';
import DemoControlBar from '../components/common/DemoControlBar.jsx';
import MissionControlHeader from '../components/common/MissionControlHeader.jsx';
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

  const handleStationSwitch = (code) => {
    navigate(`/station/${code.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Main Mission Control Header */}
      <MissionControlHeader
        currentStationCode={currentStationCode}
        currentStation={currentStation}
        currentTel={currentTel}
        antarcticTime={antarcticTime}
        onStationSwitch={handleStationSwitch}
      />


      {/* Body container with persistent scientific sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 overflow-y-auto">
          {/* Institutional Badge */}
         
          <nav className="flex-1 p-3 space-y-4 text-xs font-medium text-slate-600">
            {/* 1. Overview */}
            <div>
              <NavLink
                to={`/station/${stationId}`}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-900 font-semibold border-l-2 border-sky-800'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`
                }
              >
                <Activity className="w-4 h-4 text-slate-500" />
                <span>Station Overview</span>
              </NavLink>
            </div>

            {/* 2. Environment Section */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection('environment')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-600"
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
                <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-3">
                  <NavLink
                    to={`/station/${stationId}/environment`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
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
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-600"
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
                <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-3">
                  {currentStationCode === 'BHT' ? (
                    <>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-1`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>CHP-1 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-2`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>CHP-2 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/chp-3`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>CHP-3 Unit</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/sea-water-pump`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Droplets className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sea Water Pump</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to={`/station/${stationId}/systems/power-system`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Power System</span>
                      </NavLink>
                      <NavLink
                        to={`/station/${stationId}/systems/lake-water-pump`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                            isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                          }`
                        }
                      >
                        <Droplets className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lake Water Pump</span>
                      </NavLink>
                    </>
                  )}

                  <NavLink
                    to={`/station/${stationId}/systems/fuel-farm`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <Flame className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fuel Reserve</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/systems/satellite-communication`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <Radio className="w-3.5 h-3.5 text-slate-400" />
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
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-600"
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
                <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-3">
                  <NavLink
                    to={`/station/${stationId}/alerts`}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Alert Center & Why</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                      3
                    </span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/logistics`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
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
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 hover:text-slate-600"
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
                <div className="pl-4 space-y-0.5 border-l border-slate-100 ml-3">
                  <NavLink
                    to={`/station/${stationId}/digital-twin`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <GitFork className="w-3.5 h-3.5 text-sky-700" />
                    <span>Dependency Map</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/simulator`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Scenario Simulator</span>
                  </NavLink>

                  <NavLink
                    to={`/station/${stationId}/forecast`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded ${
                        isActive ? 'text-sky-900 bg-sky-50/70 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                      }`
                    }
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resource Forecast</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* 6. Overview Station Comparison */}
            <div className="pt-2 border-t border-slate-100">
              <NavLink
                to="/operations/compare"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md ${
                    isActive ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                  }`
                }
              >
                <Scale className="w-4 h-4 text-slate-500" />
                <span>Station Comparison</span>
              </NavLink>
            </div>
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Station Health</span>
              <span className="font-semibold text-slate-900">{currentTel?.healthScore || 88} / 100</span>
            </div>
            <div className="mt-1.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
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