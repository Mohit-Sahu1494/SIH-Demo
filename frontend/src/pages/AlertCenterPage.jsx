import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CheckCheck,
  Zap,
  Droplets,
  Flame,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

export function AlertCenterPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const isBharati = currentStationCode === 'BHT';

  // Subscribe to live telemetry
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

  const acknowledge = (id) =>
    setAlertStates((p) => ({ ...p, [id]: 'ACKNOWLEDGED' }));
  const resolve = (id) =>
    setAlertStates((p) => ({ ...p, [id]: 'RESOLVED' }));

  // Build alert list from live telemetry injections
  const alerts = useMemo(() => {
    const inj = telemetry.injections || {};
    const list = [];

    // Power
    if (inj.chpFailure) {
      list.push({
        id: 'chp-fail',
        severity: 'Critical',
        icon: Zap,
        title: isBharati ? 'CHP-3 Unit Trip — Thermal Overheat' : 'DG-2 Genset Trip Emergency',
        subsystem: isBharati ? 'CHP-3 · Power & Energy' : 'DG-2 Genset · Power',
        systemId: isBharati ? 'chp-3' : 'power-system',
        message: 'Unit tripped due to overheating. 120 kVA generating capacity lost. Load redistributed.',
        action: 'Inspect cooling circuit and start standby generator immediately.',
        time: 'Just now',
      });
    } else {
      list.push({
        id: 'chp-warn',
        severity: 'Warning',
        icon: Zap,
        title: isBharati ? 'CHP-3 Temperature Rising (94°C)' : 'DG-2 Cooling Temperature Elevated',
        subsystem: isBharati ? 'CHP-3 · Power & Energy' : 'DG-2 · Power',
        systemId: isBharati ? 'chp-3' : 'power-system',
        message: 'Cylinder head temperature above safe limit of 88°C. Trending upward.',
        action: 'Reduce lab electrical loads and check coolant flow.',
        time: '6 min ago',
      });
    }

    // Water
    if (inj.pumpFailure) {
      list.push({
        id: 'pump-fail',
        severity: 'Critical',
        icon: Droplets,
        title: isBharati ? 'Sea Water Intake Frozen — Flow Zero' : 'Lake Intake Line Frozen',
        subsystem: isBharati ? 'Sea Water Pump' : 'Lake Water Pump',
        systemId: isBharati ? 'sea-water-pump' : 'lake-water-pump',
        message: 'Water flow has dropped to 0 L/h. Frazil ice blocking intake line.',
        action: 'Activate high-current trace heating pulse on intake conduit.',
        time: '1 min ago',
      });
    } else {
      list.push({
        id: 'pump-warn',
        severity: 'Warning',
        icon: Droplets,
        title: isBharati ? 'Sea Water Trace Heating Below Setpoint' : 'Lake Intake Trace Sensor Drift',
        subsystem: isBharati ? 'Sea Water Pump' : 'Lake Water Pump',
        systemId: isBharati ? 'sea-water-pump' : 'lake-water-pump',
        message: 'Line temperature at +2.1°C — setpoint is +4.0°C. Risk of ice crystallization.',
        action: 'Switch trace heating to redundant Circuit B.',
        time: '22 min ago',
      });
    }

    // Satellite
    if (inj.satelliteFailure) {
      list.push({
        id: 'sat-fail',
        severity: 'Critical',
        icon: Radio,
        title: 'Satellite Link Lost — Telemetry Blackout',
        subsystem: 'Satellite Communication',
        systemId: 'satellite-communication',
        message: '100% packet loss. Station operating without remote telemetry sync.',
        action: 'Switch to Iridium fallback and cycle azimuth servo drives.',
        time: 'Just now',
      });
    }

    // Fuel
    if (inj.lowFuel || telemetry.fuel?.isDeficit) {
      list.push({
        id: 'fuel-crit',
        severity: 'Critical',
        icon: Flame,
        title: 'Fuel Runway Below Resupply Window',
        subsystem: 'Automated Fuel Farm',
        systemId: 'fuel-farm',
        message: `Reserve at ${telemetry.fuel?.reservePercent}%. Only ${telemetry.fuel?.runwayDays} days left — resupply ship arrives in ${telemetry.fuel?.nextResupplyDays} days.`,
        action: 'Activate Conservation Protocol Level-3. Reduce heating setpoint by 2°C.',
        time: '3 min ago',
      });
    }

    // Water consumables (always present as baseline)
    list.push({
      id: 'water-consumables',
      severity: 'Warning',
      icon: Droplets,
      title: 'RO Filter Consumables Running Low',
      subsystem: 'Water Treatment Plant',
      systemId: 'water-treatment',
      message: '29 days of cartridges remaining. Resupply ship arrives in 38 days — 9-day deficit.',
      action: 'Enforce water recycling and backwash pre-sediment strainers.',
      time: '1 hr ago',
    });

    // Resolved baseline
    list.push({
      id: 'sat-ok',
      severity: 'Resolved',
      icon: CheckCircle2,
      title: 'Satellite Radome Azimuth Drive Restored',
      subsystem: 'Satellite Communication',
      systemId: 'satellite-communication',
      message: 'Self-remediated. Latency 742 ms, 0% packet loss. Link stable.',
      action: 'Log motor torque telemetry for preventive review.',
      time: '3 hr ago',
    });

    return list;
  }, [telemetry, isBharati]);

  // Merge local state into alerts
  const mergedAlerts = useMemo(() =>
    alerts.map((a) => ({
      ...a,
      status: alertStates[a.id] || (a.severity === 'Resolved' ? 'RESOLVED' : 'ACTIVE'),
    })),
    [alerts, alertStates]
  );

  // Filter
  const filtered = useMemo(() => {
    if (filter === 'Critical') return mergedAlerts.filter((a) => a.severity === 'Critical');
    if (filter === 'Warning') return mergedAlerts.filter((a) => a.severity === 'Warning');
    if (filter === 'Resolved') return mergedAlerts.filter((a) => a.status === 'RESOLVED');
    return mergedAlerts;
  }, [mergedAlerts, filter]);

  // Counts
  const critCount = mergedAlerts.filter((a) => a.severity === 'Critical' && a.status !== 'RESOLVED').length;
  const warnCount = mergedAlerts.filter((a) => a.severity === 'Warning' && a.status !== 'RESOLVED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-rose-600" />
            Alert Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live operational alerts for {currentStationCode === 'BHT' ? 'Bharati' : 'Maitri'} Station
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {critCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {critCount} Critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {warnCount} Warning
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200 w-fit text-xs font-semibold">
        {['All', 'Critical', 'Warning', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Sab kuch theek hai! Koi alert nahi.</p>
          </div>
        )}

        {filtered.map((alert) => {
          const Icon = alert.icon;
          const isResolved = alert.status === 'RESOLVED';
          const isAcknowledged = alert.status === 'ACKNOWLEDGED';
          const isCritical = alert.severity === 'Critical';
          const isWarning = alert.severity === 'Warning';

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border transition-all shadow-xs ${
                isResolved
                  ? 'border-slate-200 opacity-70'
                  : isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-amber-200'
              }`}
            >
              <div className="p-4 space-y-3">

                {/* Top row: icon + title + time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isResolved ? 'bg-slate-100' :
                      isCritical ? 'bg-rose-100' : 'bg-amber-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isResolved ? 'text-slate-500' :
                        isCritical ? 'text-rose-600' : 'text-amber-700'
                      }`} />
                    </div>
                    <div>
                      {/* Severity + Subsystem */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isResolved ? 'bg-slate-100 text-slate-600' :
                          isCritical ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {isResolved ? 'Resolved' : alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{alert.subsystem}</span>
                      </div>
                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {alert.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{alert.time}</span>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-600 pl-12">{alert.message}</p>

                {/* Recommended Action */}
                {!isResolved && (
                  <div className="pl-12 text-xs bg-sky-50 border border-sky-100 rounded-lg p-2.5 text-sky-900">
                    <span className="font-bold">Recommended: </span>
                    {alert.action}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pl-12 flex items-center gap-2 pt-1">
                  {!isResolved && !isAcknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Acknowledge
                    </button>
                  )}
                  {!isResolved && (
                    <button
                      onClick={() => resolve(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                  {isAcknowledged && (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                      ✓ Acknowledged
                    </span>
                  )}
                  {alert.systemId && (
                    <Link
                      to={`/station/${stationId}/systems/${alert.systemId}`}
                      className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700 transition-colors"
                    >
                      View System
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertCenterPage;
