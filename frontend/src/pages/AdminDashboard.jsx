import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Database,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Radio,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useDashboardStore from '../store/dashboardStore.js';
import useStationStore from '../store/stationStore.js';

export function AdminDashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { activeScenario, triggerScenario, resetScenario } = useDashboardStore();
  const currentStationCode = useStationStore((s) => s.currentStationCode);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [healthRes, dsRes, usersRes] = await Promise.all([
          api.get('/health'),
          api.get('/data-sources').catch(() => ({ data: { data: [] } })),
          api.get('/admin/users').catch(() => ({ data: { data: [] } })),
        ]);
        setHealthStatus(healthRes.data);
        setDataSources(dsRes.data?.data || []);
        setUserList(usersRes.data?.data || []);
      } catch (e) {
        console.warn('Notice loading admin data:', e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>EXECUTIVE MISSION ADMINISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
            System Administration & Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global governance of station network parameters, data pipelines, credentials, and SIH demonstration scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/operator/dashboard"
            className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Switch to Mission Operations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Subsystem Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">API Gateway</span>
            <Server className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-heading font-bold text-slate-900">
              {healthStatus?.status === 'healthy' ? 'ONLINE (HEALTHY)' : 'ACTIVE'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Uptime: {healthStatus?.uptimeSeconds ? `${Math.floor(healthStatus.uptimeSeconds / 60)}m ${healthStatus.uptimeSeconds % 60}s` : '18m 42s'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">MongoDB Persistence</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-lg font-heading font-bold text-slate-900">
              {healthStatus?.database === 'connected' ? 'CONNECTED' : 'IN-MEMORY DB'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">13 Collections Mounted</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">MQTT Telemetry Bus</span>
            <Radio className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-heading font-bold text-slate-900">
              5s INTERVAL LOOP
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Aedes Broker Port 1883</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Authorized Personnel</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-heading font-black text-slate-900">
              {userList.length || 3}
            </span>
            <span className="text-xs text-slate-400">Station Users</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Role: ADMIN | OPERATOR | VIEWER</div>
        </div>
      </div>

      {/* Scenario Control Panel (Admin capability) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600">
              SIH SIMULATION ENGINE
            </span>
            <h3 className="text-lg font-heading font-bold text-slate-900">
              Live Scenario Injection Controls
            </h3>
            <p className="text-xs text-slate-500">
              Inject mission-critical failure scenarios to demonstrate real-time telemetry updates, anomaly alerting, and digital twin reaction.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">Active State:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              {activeScenario}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'GENERATOR_FAILURE',
              title: 'Genset 02 Failure (SIH Key Demo)',
              desc: 'Ramps temperature to 94.2°C and vibration to 4.2 mm/s, triggering thermal anomaly and emergency alert.',
              color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50',
              btn: 'bg-rose-600 hover:bg-rose-500 text-white',
            },
            {
              name: 'LOW_FUEL',
              title: 'Critical Fuel Depletion',
              desc: 'Drops Jet A-1 reserve below 18% safety buffer, triggering logistics replenishment alert.',
              color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50',
              btn: 'bg-amber-600 hover:bg-amber-500 text-white',
            },
            {
              name: 'EXTREME_WEATHER',
              title: 'Severe Antarctic Blizzard',
              desc: 'Wind gusts exceed 94 km/h with -46°C surface temp, triggering habitat exterior lockdown.',
              color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50',
              btn: 'bg-cyan-600 hover:bg-cyan-500 text-white',
            },
            {
              name: 'HIGH_ENERGY_CONSUMPTION',
              title: 'Microgrid Overload Surge',
              desc: 'Station load spikes above 215 kW, testing battery storage buffer and load-shedding intelligence.',
              color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
              btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
            },
            {
              name: 'NORMAL',
              title: 'Reset to Nominal Operations',
              desc: 'Restores all sensors and generators to calibrated nominal baseline and resolves active alerts.',
              color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
              btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
            },
          ].map((sc) => (
            <div
              key={sc.name}
              className={`p-4 rounded-xl border ${sc.color} flex flex-col justify-between space-y-3 transition-all`}
            >
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900">{sc.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sc.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => (sc.name === 'NORMAL' ? resetScenario() : triggerScenario(sc.name))}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${sc.btn}`}
              >
                {activeScenario === sc.name ? 'Active (Running)' : `Trigger ${sc.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Data Sources List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-heading font-bold text-slate-900">
              Operational Data Sources
            </h3>
            <p className="text-xs text-slate-400">
              Verified data sources feeding environmental observations and IoT telemetry.
            </p>
          </div>
          <Link
            to="/admin/data-sources"
            className="text-xs text-sky-600 hover:underline font-semibold"
          >
            Manage Data Sources →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {dataSources.map((ds) => (
            <div key={ds.code} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <span>{ds.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {ds.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{ds.description}</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200">
                  {ds.status} ({ds.reliabilityScore}%)
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Type: {ds.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
