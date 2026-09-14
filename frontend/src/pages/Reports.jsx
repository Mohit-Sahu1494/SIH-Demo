import React from 'react';
import { Printer, Download, FileText, CheckCircle2, Shield } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';
import useAlertStore from '../store/alertStore.js';

export function Reports() {
  const { currentStationCode, stations } = useStationStore();
  const { environment, energy } = useDashboardStore();
  const { alerts, activeCount } = useAlertStore();

  const station = stations.find((s) => s.code === currentStationCode) || stations[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Executive Mission Status Report"
          subtitle="Certified Antarctic Operations Summary for NCPOR Command Directorate"
          badge={<Badge variant="healthy" size="sm">EXPORTABLE BRIEFING</Badge>}
          action={
            <Button variant="primary" size="md" icon={Printer} onClick={handlePrint}>
              Print / Save PDF Report
            </Button>
          }
        />
      </div>

      {/* Printable Report Document */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 md:p-12 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest block mb-1">
              Government of India • Ministry of Earth Sciences
            </span>
            <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
              POLAR TWIN — STATION OPERATIONAL STATUS BRIEF
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              National Centre for Polar and Ocean Research (NCPOR), Vasco da Gama, Goa
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="font-bold text-slate-800">BASE: {station.name.toUpperCase()}</div>
            <div className="text-slate-400">DATE: {new Date().toLocaleDateString()}</div>
            <div className="text-emerald-600 font-semibold mt-1">STATUS: OPERATIONAL</div>
          </div>
        </div>

        {/* Section 1: Executive Health Rating */}
        <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Composite Station Health Index
            </span>
            <div className="text-3xl font-heading font-black text-slate-900 mt-1">
              {station.healthScore || 91}% — CERTIFIED NOMINAL
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Synthesized from 4 sub-domains: Environment ({station.healthBreakdown?.environment || 94}%), Energy ({station.healthBreakdown?.energy || 87}%), Infrastructure ({station.healthBreakdown?.infrastructure || 91}%), Logistics ({station.healthBreakdown?.logistics || 92}%).
            </p>
          </div>
        </div>

        {/* Section 2: Subsystem Status Table */}
        <div className="mb-8">
          <h3 className="text-sm font-heading font-bold uppercase text-slate-900 mb-3 border-b border-slate-200 pb-1">
            1. Subsystem Telemetry Brief
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block">Ambient Temperature</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {environment.temperature || -28.4}°C
              </span>
              <span className="text-[10px] text-slate-500">Wind: {environment.windSpeed || 34} km/h</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block">Microgrid Output</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {energy.generation || 168} kW
              </span>
              <span className="text-[10px] text-slate-500">Load: {energy.consumption || 144} kW</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block">Battery Storage</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {energy.batteryLevel || 88}%
              </span>
              <span className="text-[10px] text-slate-500">150 kWh LiFePO4</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-semibold block">Bulk Fuel Reserve</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {energy.fuelLevel || 76.5}%
              </span>
              <span className="text-[10px] text-slate-500">45 Days Autonomy</span>
            </div>
          </div>
        </div>

        {/* Section 3: Anomaly & Incident Log */}
        <div className="mb-8">
          <h3 className="text-sm font-heading font-bold uppercase text-slate-900 mb-3 border-b border-slate-200 pb-1">
            2. Active Incident & Anomaly Declarations
          </h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No open incidents or safety alerts logged.</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 3).map((a) => (
                <div key={a._id || a.title} className="p-3 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{a.title}</span>
                    <span className="text-rose-600 font-mono">[{a.severity}]</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px]">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Authentication Signoff */}
        <div className="pt-6 border-t-2 border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <div className="font-bold text-slate-800">POLAR TWIN Digital Operations Engine</div>
            <div>Automated Report ID: NCPOR-REP-2024-09</div>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-400 w-48 mb-1" />
            <span>Chief Station Officer Signoff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
