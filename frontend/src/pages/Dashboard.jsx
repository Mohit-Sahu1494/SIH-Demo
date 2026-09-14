import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Boxes, Zap, Package, CloudSnow, Bell, BarChart3, Wrench, ShieldCheck } from 'lucide-react';
import StationHero from '../components/dashboard/StationHero.jsx';
import KPISection from '../components/dashboard/KPISection.jsx';
import HealthOverview from '../components/dashboard/HealthOverview.jsx';
import AIInsightsCard from '../components/dashboard/AIInsightsCard.jsx';
import ActiveAlertsWidget from '../components/dashboard/ActiveAlertsWidget.jsx';
import StationCanvas from '../components/digital-twin/StationCanvas.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function Dashboard() {
  const { currentStationCode, stations } = useStationStore();
  const station = stations.find((s) => s.code === currentStationCode) || stations[0];

  return (
    <div className="space-y-6">
      {/* 1. Station Hero Banner */}
      <StationHero station={station} />

      {/* 2. Top-level KPI Cards */}
      <KPISection />

      {/* 3. Station Health Breakdown & AI Intelligence Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HealthOverview
            breakdown={station?.healthBreakdown}
            healthScore={station?.healthScore || 91}
          />
        </div>
        <div className="lg:col-span-6">
          <AIInsightsCard />
        </div>
      </div>

      {/* 4. 3D Digital Twin Visual Command Canvas */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-slate-900 text-lg">
                Digital Twin — Spatial Infrastructure Model
              </h3>
              <Badge variant="healthy" size="sm">3D VIRTUAL REPLICA</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive conceptual geometry synchronized with MongoDB live telemetry streams. Click any asset (e.g. <strong>GEN-02</strong>) to inspect.
            </p>
          </div>

          <NavLink to="/digital-twin">
            <Button variant="secondary" size="sm" icon={ArrowRight}>
              Full Screen 3D View
            </Button>
          </NavLink>
        </div>

        <div className="p-4 bg-slate-50">
          <StationCanvas className="h-[440px] w-full" />
        </div>
      </Card>

      {/* 5. Real-time Alerts & Operations Link Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ActiveAlertsWidget />
        </div>

        {/* Quick Operations Matrix */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Remote Operational Modules"
              subtitle="Quick navigation across mission-critical subsystems"
            />

            <div className="grid grid-cols-2 gap-3 my-2">
              <NavLink
                to="/infrastructure"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all text-left group"
              >
                <Boxes className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900">Infrastructure</div>
                <div className="text-[10px] text-slate-400 mt-0.5">20 Assets • Generators, Radome</div>
              </NavLink>

              <NavLink
                to="/energy"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all text-left group"
              >
                <Zap className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900">Energy Microgrid</div>
                <div className="text-[10px] text-slate-400 mt-0.5">168 kW Gen • 150 kWh Battery</div>
              </NavLink>

              <NavLink
                to="/logistics"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-left group"
              >
                <Package className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900">Logistics & Fuel</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Jet A-1 78% • 45 Days autonomy</div>
              </NavLink>

              <NavLink
                to="/environment"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all text-left group"
              >
                <CloudSnow className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-900">Antarctic Weather</div>
                <div className="text-[10px] text-slate-400 mt-0.5">-28.4°C • 34 km/h Katabatic</div>
              </NavLink>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>National Centre for Polar and Ocean Research</span>
              <span className="font-mono text-slate-700 font-bold">NCPOR-SIH-2024</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
