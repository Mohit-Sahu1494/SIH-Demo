import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Thermometer,
  Zap,
  Flame,
  TrendingDown,
  Filter,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

export function AlertCenterPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const isBharati = currentStationCode === 'BHT';

  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedWhyAlertId, setExpandedWhyAlertId] = useState('alert-1');

  // Realistic operational alerts
  const alerts = [
    {
      id: 'alert-1',
      title: isBharati ? 'CHP-3 CYLINDER HEAD TEMPERATURE RISING' : 'DG-2 COOLING JACKET TEMPERATURE ELEVATED',
      subsystem: isBharati ? 'CHP-3 (Combined Heat & Power)' : 'DG-2 Primary Genset',
      severity: 'Warning',
      currentReading: '94°C',
      trend: '+7°C in last 10 minutes',
      potentialImpact: 'Reduced power redundancy; reduced heating cogenerative redundancy during blizzard',
      recommendedAction: 'Reduce non-critical laboratory electrical loads, inspect cooling jacket circuit, and prepare standby unit.',
      timestamp: '6 minutes ago',
      hasRootCause: true,
      rootCauseChain: [
        {
          stage: '1. Meteorological Trigger',
          title: 'Outside Temperature Decreased',
          change: '-18°C → -31°C',
          note: 'Severe katabatic wind event recorded by Met Mast',
          icon: Thermometer,
        },
        {
          stage: '2. Thermal Demand Cascade',
          title: 'Heating Demand Increased',
          change: '+23% increase',
          note: 'Hydronic heat loops operating at peak throughput',
          icon: Flame,
        },
        {
          stage: '3. Machine Mechanical Stress',
          title: 'CHP-3 Utilization Surged',
          change: '74% → 91% continuous',
          note: 'Elevated thermal exhaust backpressure detected',
          icon: Zap,
        },
        {
          stage: '4. Fuel Logistics Burn Impact',
          title: 'Fuel Consumption Rate',
          change: '+14% burn rate (4,730 L/day)',
          note: 'Accelerated depletion of daily service day-tank',
          icon: Flame,
        },
        {
          stage: '5. Operational Runway Projection',
          title: 'Fuel Runway Compressed',
          change: '47 days → 41 days',
          note: 'Buffer before scheduled polar resupply vessel shortened',
          icon: TrendingDown,
        },
      ],
    },
    {
      id: 'alert-2',
      title: isBharati ? 'SEA WATER INTAKE PIPELINE TRACE HEATER WARNING' : 'LAKE PRIYADARSHINI HEATED LINE SENSOR DRIFT',
      subsystem: isBharati ? 'Sea Water Pump Trace Line' : 'Lake Priyadarshini 2.4km Intake Line',
      severity: 'Warning',
      currentReading: '+2.1°C (Setpoint: +4.0°C)',
      trend: '-1.4°C over 2 hours',
      potentialImpact: 'Risk of frazil ice crystallization in sub-surface seawater intake line',
      recommendedAction: 'Switch trace heating controller to redundant circuit B and verify current draw.',
      timestamp: '24 minutes ago',
      hasRootCause: false,
    },
    {
      id: 'alert-3',
      title: 'WATER TREATMENT RO CONSUMABLES RUNWAY DEFICIT',
      subsystem: 'Water Treatment Plant (RO Desalination)',
      severity: 'Critical',
      currentReading: '29 Days Remaining',
      trend: 'Resupply in 38 Days (-9 Day Deficit)',
      potentialImpact: 'Cartridge filter exhaustion prior to MV Vasiliy Golovnin expedition arrival',
      recommendedAction: 'Enforce water conservation protocol B-2 and backwash pre-sediment strainers.',
      timestamp: '1 hour ago',
      hasRootCause: false,
    },
    {
      id: 'alert-4',
      title: 'SATELLITE KU-BAND RADOME AZIMUTH DRIVE NOMINAL RESTORATION',
      subsystem: 'Satellite Communication Terminal',
      severity: 'Resolved',
      currentReading: 'Latency 742 ms, 0% Packet Loss',
      trend: 'Tracking lock maintained',
      potentialImpact: 'None (Self-remediated)',
      recommendedAction: 'Log radome motor torque calibration telemetry for preventive review.',
      timestamp: '3 hours ago',
      hasRootCause: false,
    },
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'All') return true;
    return a.severity.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Station Alert Center
            </h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time diagnostic advisories and root-cause analysis for {station.name} Station
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          {['All', 'Critical', 'Warning', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isExpanded = expandedWhyAlertId === alert.id;

          return (
            <div
              key={alert.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Alert Card Main Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="text-xs text-slate-500 font-medium">{alert.subsystem}</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5">
                      {alert.title}
                    </h2>
                  </div>

                  <span className="text-xs text-slate-400 shrink-0 font-mono">
                    {alert.timestamp}
                  </span>
                </div>

                {/* Structured diagnostic metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Current Reading</span>
                    <div className="font-bold text-slate-900 mt-0.5">{alert.currentReading}</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">10-Min Trend</span>
                    <div className="font-bold text-amber-900 mt-0.5">{alert.trend}</div>
                  </div>

                  <div className="sm:col-span-2 p-2.5 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Potential Impact</span>
                    <div className="text-slate-700 mt-0.5">{alert.potentialImpact}</div>
                  </div>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-100 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-sky-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sky-900">Recommended Action:</span>
                    <span className="text-sky-900/90 ml-1.5">{alert.recommendedAction}</span>
                  </div>
                </div>

                {/* Trigger "Why is this happening?" View */}
                {alert.hasRootCause && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedWhyAlertId(isExpanded ? null : alert.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 hover:text-sky-900 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{isExpanded ? 'Hide Root Cause Analysis' : 'Why is this happening? (Root Cause)'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* WHY / ROOT CAUSE CONNECTED VIEW */}
              {alert.hasRootCause && isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Root Cause & Dependency Chain
                      </h3>
                      <p className="text-xs text-slate-500">
                        Traced from initial meteorological sensor reading down to logistics fuel runway compression
                      </p>
                    </div>
                    <DataSourceBadge type="DERIVED" />
                  </div>

                  {/* Connected visual cards with downward arrows */}
                  <div className="space-y-2 max-w-2xl mx-auto">
                    {alert.rootCauseChain.map((step, idx) => {
                      const IconComp = step.icon;
                      return (
                        <React.Fragment key={idx}>
                          <div className="bg-white rounded-lg border border-slate-200/90 p-3.5 shadow-xs flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {step.stage}
                              </span>
                              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                                <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                                <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                                  {step.change}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">{step.note}</p>
                            </div>
                          </div>

                          {idx < alert.rootCauseChain.length - 1 && (
                            <div className="flex justify-center text-slate-400 py-0.5">
                              <ArrowDown className="w-4 h-4" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertCenterPage;
