import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, Check, Zap, Droplets, Flame, Radio, 
  ArrowRight, Activity, ShieldCheck, Thermometer, ChevronRight, AlertTriangle,Clock
} from 'lucide-react';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

export function AlertCenterPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const isBharati = currentStationCode === 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;

  // Live Telemetry Subscription
  const [telemetry, setTelemetry] = useState(() =>
    telemetryEngine.calculateTelemetry(currentStationCode)
  );
  useEffect(() => {
    const unsub = telemetryEngine.subscribe((state) => {
      setTelemetry(state[currentStationCode] || state.BHT);
    });
    return () => unsub();
  }, [currentStationCode]);

  // Local per-alert states: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  const [alertStates, setAlertStates] = useState({});
  const [filter, setFilter] = useState('All');

  const acknowledge = (id) => setAlertStates((p) => ({ ...p, [id]: 'ACKNOWLEDGED' }));
  const resolve = (id) => setAlertStates((p) => ({ ...p, [id]: 'RESOLVED' }));

  // Build Alert List
  const alerts = useMemo(() => {
    const inj = telemetry.injections || {};
    const list = [];

    if (inj.chpFailure) {
      list.push({
        id: 'ALR-PWR-01', severity: 'Critical', icon: Zap,
        title: isBharati ? 'CHP-3 Trip — Thermal Overload' : 'DG-2 Genset Trip Emergency',
        systemId: isBharati ? 'chp-3' : 'power-system',
        sysName: isBharati ? 'SYS-CHP-03 (Power)' : 'SYS-DG-02 (Power)',
        message: 'Unit tripped due to operating temperature exceeding 94°C. 120 kVA generating capacity lost.',
        action: 'Inspect cooling circuit. Initiate manual start of standby unit.',
        time: 'T-00:00',
      });
    } else {
      list.push({
        id: 'ALR-PWR-02', severity: 'Warning', icon: Activity,
        title: isBharati ? 'CHP-3 Core Temp Abnormal (94°C)' : 'DG-2 Coolant Temp Elevated',
        systemId: isBharati ? 'chp-3' : 'power-system',
        sysName: isBharati ? 'SYS-CHP-03 (Power)' : 'SYS-DG-02 (Power)',
        message: 'Cylinder head temperature trending above 85°C limit. Redundancy at risk.',
        action: 'Shed non-essential lab electrical loads. Verify coolant pump flow.',
        time: 'T-00:06',
      });
    }

    if (inj.pumpFailure) {
      list.push({
        id: 'ALR-WTR-01', severity: 'Critical', icon: Droplets,
        title: isBharati ? 'Sea Intake Frozen — Zero Flow' : 'Lake Intake Blockage Detected',
        systemId: isBharati ? 'sea-water-pump' : 'lake-water-pump',
        sysName: isBharati ? 'SYS-SWP-01 (Water)' : 'SYS-LWP-01 (Water)',
        message: 'Intake flow rate dropped to 0 L/s. Frazil ice accumulation confirmed in primary conduit.',
        action: 'Activate high-current trace heating pulse sequence on intake line.',
        time: 'T-00:01',
      });
    } else {
      list.push({
        id: 'ALR-WTR-02', severity: 'Warning', icon: Thermometer,
        title: isBharati ? 'Trace Heating Output Deficit' : 'Intake Trace Sensor Drift',
        systemId: isBharati ? 'sea-water-pump' : 'lake-water-pump',
        sysName: isBharati ? 'SYS-SWP-01 (Water)' : 'SYS-LWP-01 (Water)',
        message: 'Line surface temp at +2.1°C (Setpoint: +4.0°C). Increased risk of ice crystallization.',
        action: 'Switch trace heating controller to redundant Circuit B.',
        time: 'T-00:22',
      });
    }

    if (inj.satelliteFailure) {
      list.push({
        id: 'ALR-COM-01', severity: 'Critical', icon: Radio,
        title: 'Satellite Link Lost — Blackout',
        systemId: 'satellite-communication',
        sysName: 'SYS-SAT-01 (Comm)',
        message: '100% packet loss detected. Station operating without remote telemetry synchronization.',
        action: 'Switch to Iridium fallback channel. Cycle azimuth servo drives.',
        time: 'T-00:00',
      });
    }

    if (inj.lowFuel || telemetry.fuel?.isDeficit) {
      list.push({
        id: 'ALR-FUL-01', severity: 'Critical', icon: Flame,
        title: 'Fuel Reserve Critical Violation',
        systemId: 'fuel-farm',
        sysName: 'SYS-FF-01 (Fuel Farm)',
        message: `Reserve volume at ${telemetry.fuel?.reservePercent}%. Runway: ${telemetry.fuel?.runwayDays} days. Resupply deficit: ${telemetry.fuel?.nextResupplyDays - telemetry.fuel?.runwayDays} days.`,
        action: 'Enforce Conservation Protocol Level-3. Reduce global HVAC setpoint by 2°C.',
        time: 'T-00:03',
      });
    }

    list.push({
      id: 'ALR-WTR-03', severity: 'Warning', icon: AlertTriangle,
      title: 'RO Filter Consumables Depleted',
      systemId: 'water-treatment',
      sysName: 'SYS-WTP-01 (Water)',
      message: 'Cartridge inventory sufficient for 29 days. Next scheduled resupply in 38 days.',
      action: 'Implement mandatory water recycling policies. Backwash pre-sediment strainers.',
      time: 'T-01:12',
    });

    list.push({
      id: 'ALR-COM-02', severity: 'Resolved', icon: ShieldCheck,
      title: 'Satellite Azimuth Drive Restored',
      systemId: 'satellite-communication',
      sysName: 'SYS-SAT-01 (Comm)',
      message: 'Drive recalibrated automatically. Latency stabilized at 742ms. Link nominal.',
      action: 'Log motor torque telemetry for next predictive maintenance review.',
      time: 'T-03:45',
    });

    return list;
  }, [telemetry, isBharati]);

  const mergedAlerts = useMemo(() =>
    alerts.map((a) => ({
      ...a,
      status: alertStates[a.id] || (a.severity === 'Resolved' ? 'RESOLVED' : 'ACTIVE'),
    })),
    [alerts, alertStates]
  );

  const filtered = useMemo(() => {
    if (filter === 'Critical') return mergedAlerts.filter((a) => a.severity === 'Critical');
    if (filter === 'Warning') return mergedAlerts.filter((a) => a.severity === 'Warning');
    if (filter === 'Resolved') return mergedAlerts.filter((a) => a.status === 'RESOLVED');
    return mergedAlerts;
  }, [mergedAlerts, filter]);

  const critCount = mergedAlerts.filter((a) => a.severity === 'Critical' && a.status !== 'RESOLVED').length;
  const warnCount = mergedAlerts.filter((a) => a.severity === 'Warning' && a.status !== 'RESOLVED').length;
  const unackCount = mergedAlerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* 1. PREMIUM HEADER */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -top-8 opacity-[0.03] pointer-events-none">
            <Bell className="w-56 h-56 text-slate-900" />
          </div>

          <div className="relative z-10">
            <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              <Link to={`/station/${stationId}`} className="hover:text-sky-600 transition-colors">{station.name}</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-slate-700">Alert Center</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Event Console</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">Real-time anomaly detection and response tracking.</p>
          </div>

          <div className="relative z-10 flex gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2">
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Critical</p>
              <p className={`font-mono text-xl font-bold ${critCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>{critCount}</p>
            </div>
            <div className="w-px bg-slate-200 mx-1"></div>
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Warning</p>
              <p className={`font-mono text-xl font-bold ${warnCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{warnCount}</p>
            </div>
            <div className="w-px bg-slate-200 mx-1"></div>
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Un-Ack</p>
              <p className="font-mono text-xl font-bold text-slate-700">{unackCount}</p>
            </div>
          </div>
        </div>

        {/* 2. PREMIUM FILTER TABS */}
        <div className="flex gap-1.5 bg-white rounded-xl border border-slate-200/80 shadow-sm p-1.5 w-fit">
          {['All', 'Critical', 'Warning', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                filter === tab
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3. ALERT CARDS LIST */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">System Nominal</p>
              <p className="text-xs text-slate-500 mt-1">No active alerts match current criteria.</p>
            </div>
          )}

          {filtered.map((alert) => {
            const Icon = alert.icon;
            const isResolved = alert.status === 'RESOLVED';
            const isAcknowledged = alert.status === 'ACKNOWLEDGED';
            const isCritical = alert.severity === 'Critical';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md ${
                  isResolved ? 'opacity-70' : ''
                }`}
              >
                {/* Left Colored Status Indicator */}
                <div className={`w-1.5 md:w-2 shrink-0 ${
                  isResolved ? 'bg-slate-300' :
                  isCritical ? 'bg-rose-500' : 'bg-amber-500'
                }`} />

                {/* Main Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top Row: Badges & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        isResolved ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isResolved ? 'Resolved' : alert.severity}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {alert.id}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isResolved ? 'bg-slate-50 border-slate-200' :
                      isCritical ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isResolved ? 'text-slate-400' :
                        isCritical ? 'text-rose-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{alert.title}</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 mb-1.5">{alert.sysName}</p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                    </div>
                  </div>

                  {/* Standard Operating Procedure (SOP) Box */}
                  {!isResolved && (
                    <div className="mt-auto bg-slate-50/50 border border-slate-100 rounded-lg p-3 ml-14">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended SOP</p>
                      <p className="text-xs text-slate-700 font-medium">{alert.action}</p>
                    </div>
                  )}
                </div>

                {/* Right Action Panel */}
                <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-5 flex flex-col justify-center gap-3 w-full md:w-56 shrink-0">
                  {!isResolved && !isAcknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="w-full py-2 bg-white border border-slate-200 shadow-sm text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Acknowledge
                    </button>
                  )}
                  
                  {!isResolved && (
                    <button
                      onClick={() => resolve(alert.id)}
                      className="w-full py-2 bg-emerald-50 border border-emerald-200 shadow-sm text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Resolve
                    </button>
                  )}

                  {isAcknowledged && !isResolved && (
                    <div className="w-full py-2 bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest text-center rounded-lg">
                      Acknowledged
                    </div>
                  )}

                  {alert.systemId && (
                    <Link
                      to={`/station/${stationId}/systems/${alert.systemId}`}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest bg-sky-50/50 py-1.5 rounded-lg transition-colors"
                    >
                      View System <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default AlertCenterPage;