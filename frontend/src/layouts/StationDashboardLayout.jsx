import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  GitFork,
  AlertTriangle,
  Boxes,
  TrendingDown,
  Scale,
  Thermometer,
  X,
  ChevronRight
} from 'lucide-react';
import MissionControlHeader from '../components/common/MissionControlHeader.jsx';
import StationDashboard from '../pages/StationDashboard.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';
import Bg from '../assets/Bg.png';

export function StationDashboardLayout() {
  const { stationId = 'bharati' } = useParams();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentStationCode =
    stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';

  const currentStation =
    STATIONS[currentStationCode] || STATIONS.BHT;

  // Real-time telemetry state
  const [telemetryState, setTelemetryState] = useState(() =>
    telemetryEngine.getState()
  );

  // Antarctic station local time
  const [antarcticTime, setAntarcticTime] = useState('');

  // Subscribe to telemetry engine
  useEffect(() => {
    const unsubscribe = telemetryEngine.subscribe((state) => {
      setTelemetryState(state);
    });

    return () => unsubscribe();
  }, []);

  // Update live current local time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      setAntarcticTime(`${timeStr} · ${dateStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTel =
    telemetryState[currentStationCode] ||
    telemetryState.BHT ||
    {};

  const handleStationSwitch = (code) => {
    navigate(`/station/${code.toLowerCase()}`);
  };

  const navLinks = [
    { to: `/station/${stationId}`, label: 'Station Overview', icon: Activity, exact: true },
    { to: `/station/${stationId}/simulator`, label: 'Scenario Simulator', icon: Cpu },
    { to: `/station/${stationId}/digital-twin`, label: 'Dependency Map', icon: GitFork },
    { to: `/station/${stationId}/alerts`, label: 'Alert Center & Why', icon: AlertTriangle },
    { to: `/station/${stationId}/forecast`, label: 'Resource Forecast', icon: TrendingDown },
    { to: `/station/${stationId}/logistics`, label: 'Logistics Inventory', icon: Boxes },
    { to: `/station/${stationId}/environment`, label: 'Environment & Weather', icon: Thermometer },
    { to: `/operations/compare`, label: 'Station Comparison', icon: Scale },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{ backgroundImage: `url(${Bg})` }}
      />
      <div className="fixed inset-0 bg-white/10 backdrop-blur-xs pointer-events-none -z-10" />

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B2545] text-white border-r border-white/10 h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">Station Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-white/70" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                  </Link>
                );
              })}
            </nav>

            <div className="p-3.5 border-t border-white/10 bg-black/20">
              <div className="text-[11px] text-white/70 flex items-center justify-between">
                <span>Station Health</span>
                <span className="font-semibold text-white">{currentTel?.healthScore || 88} / 100</span>
              </div>
              <div className="mt-1.5 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${currentTel?.healthScore || 88}%` }}
                />
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <MissionControlHeader
          currentStationCode={currentStationCode}
          currentStation={currentStation}
          currentTel={currentTel}
          antarcticTime={antarcticTime}
          onStationSwitch={handleStationSwitch}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          transparent={true}
        />

        {/* Station Dashboard */}
        <main className="flex-1">
          <StationDashboard telemetry={currentTel} />
        </main>
      </div>
    </div>
  );
}

export default StationDashboardLayout;