import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Radio,
  Clock,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useAlertStore from '../store/alertStore.js';
import useStationStore from '../store/stationStore.js';

export function Alerts() {
  const { currentStationCode } = useStationStore();
  const { alerts, acknowledge, resolve, activeCount } = useAlertStore();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    const matchSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchStat = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSev && matchStat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mission Control Alert Center"
        subtitle="Intelligent rule-based anomaly detection with automated deduplication & lifecycle management"
        badge={
          <Badge variant={activeCount > 0 ? 'critical' : 'healthy'} size="sm">
            {activeCount} ACTIVE ANOMALIES
          </Badge>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
            Severity:
          </span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Status:
          </span>
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === stat
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="text-center p-12">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-heading font-bold text-slate-800 text-base">
              No Operational Anomaly Alerts Found
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All infrastructure subsystems, microgrids, and environmental metrics are operating within certified baseline limits.
            </p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <Card
                key={alert._id || alert.title}
                className={`border transition-all ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/15'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {isCritical ? (
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Radio className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={isCritical ? 'critical' : isWarning ? 'warning' : 'info'}
                          size="sm"
                        >
                          {alert.severity}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {alert.assetId || 'Station Wide'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-slate-900 text-base">
                        {alert.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Reason & Action Boxes */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                            Diagnostic Reason:
                          </span>
                          <span className="text-slate-800 font-medium">
                            {alert.reason || 'Telemetry threshold variance detected.'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-200/80 text-sky-950">
                          <span className="text-[10px] font-bold uppercase text-sky-700 block mb-0.5">
                            Prescriptive Action:
                          </span>
                          <span className="font-medium">
                            {alert.recommendedAction || 'Monitor subsequent sensor cycle.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                        alert.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      }`}
                    >
                      ● {alert.status}
                    </span>

                    <div className="flex items-center gap-2 mt-2">
                      {alert.status === 'ACTIVE' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => acknowledge(alert._id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Check}
                          onClick={() => resolve(alert._id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Alerts;
