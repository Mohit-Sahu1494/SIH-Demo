import React, { useState } from 'react';
import {
  Bell,
  Radio,
  ChevronDown,
  User,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Flame,
  Shield,
  Clock,
} from 'lucide-react';
import useStationStore from '../../store/stationStore.js';
import useConnectionStore from '../../store/connectionStore.js';
import useAlertStore from '../../store/alertStore.js';
import useAuthStore from '../../store/authStore.js';
import useDashboardStore from '../../store/dashboardStore.js';
import Badge from './Badge.jsx';

export function TopBar({ onOpenScenarioDrawer }) {
  const { currentStationCode, setStationCode, stations } = useStationStore();
  const { isConnected, lastSync } = useConnectionStore();
  const { alerts, activeCount, acknowledge, resolve } = useAlertStore();
  const { user } = useAuthStore();
  const activeScenario = useDashboardStore((s) => s.activeScenario);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);

  const formatLastSync = (date) => {
    if (!date) return 'Just now';
    const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (sec < 5) return 'Live';
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)}m ago`;
  };

  const currentStation = stations.find((s) => s.code === currentStationCode) || stations[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Station Selector & Live Sync */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-sm font-semibold text-slate-800"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="font-heading tracking-wide uppercase">{currentStation?.name || 'Bharati Station'}</span>
            <span className="text-xs text-slate-400 font-mono">({currentStationCode})</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isStationMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Select Antarctic Base
              </div>
              {stations.map((st) => (
                <button
                  key={st.code}
                  onClick={() => {
                    setStationCode(st.code);
                    setIsStationMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                    currentStationCode === st.code
                      ? 'bg-sky-50 text-sky-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-400">{st.location?.region || 'East Antarctica'}</div>
                  </div>
                  <Badge variant={st.healthScore >= 85 ? 'healthy' : 'warning'} size="sm">
                    {st.healthScore}%
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Connection Indicator */}
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-rose-500'
              }`}
            />
            <span className="font-medium text-slate-700">
              {isConnected ? 'Telemetry Online' : 'Telemetry Link Lost'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Sync: {formatLastSync(lastSync)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Demo Launcher, Alerts, User */}
      <div className="flex items-center gap-3.5">
        {/* Active Scenario Indicator & Demo Trigger */}
        <button
          onClick={onOpenScenarioDrawer}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            activeScenario !== 'NORMAL'
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Open SIH Scenario Simulation Controller"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Scenario: <strong className="font-mono">{activeScenario}</strong></span>
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            className="relative p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-600"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pulse-critical">
                {activeCount}
              </span>
            )}
          </button>

          {isAlertOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm text-slate-900">Alert Center</span>
                  <Badge variant={activeCount > 0 ? 'critical' : 'healthy'} size="sm">
                    {activeCount} Active
                  </Badge>
                </div>
                <button
                  onClick={() => setIsAlertOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    All telemetry operating within safe nominal parameters.
                  </div>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div key={a._id || a.title} className="p-3.5 hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          {a.severity === 'CRITICAL' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <Radio className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="truncate">{a.title}</span>
                        </div>
                        <Badge
                          variant={a.severity === 'CRITICAL' ? 'critical' : a.severity === 'WARNING' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {a.severity}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{a.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{a.assetId || 'Station Wide'}</span>
                        <div className="flex gap-2">
                          {a.status === 'ACTIVE' && (
                            <button
                              onClick={() => acknowledge(a._id)}
                              className="text-sky-600 hover:underline font-medium"
                            >
                              Acknowledge
                            </button>
                          )}
                          {a.status !== 'RESOLVED' && (
                            <button
                              onClick={() => resolve(a._id)}
                              className="text-emerald-600 hover:underline font-medium"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || 'Operator On Duty'}
            </div>
            <div className="text-[10px] font-mono text-sky-600 uppercase font-semibold">
              {user?.role || 'OPERATOR'}
            </div>
          </div>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/';
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors text-xs ml-1"
            title="Sign Out / Disconnect Session"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
