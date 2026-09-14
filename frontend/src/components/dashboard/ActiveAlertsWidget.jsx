import React from 'react';
import { AlertTriangle, CheckCircle, Radio, Clock, ShieldAlert } from 'lucide-react';
import Card, { CardHeader } from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import useAlertStore from '../../store/alertStore.js';

export function ActiveAlertsWidget() {
  const { alerts, activeCount, acknowledge, resolve } = useAlertStore();

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Live Alert Feed"
        subtitle="Deduplicated anomaly detections pushed in real time"
        badge={
          <Badge variant={activeCount > 0 ? 'critical' : 'healthy'} size="sm">
            {activeCount} Active
          </Badge>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1">
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="font-medium text-xs text-slate-700">All station systems nominal</p>
            <span className="text-[11px] text-slate-400 mt-0.5">No active warnings or critical thresholds exceeded</span>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert._id || alert.title}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isCritical ? 'text-rose-600 animate-pulse' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isCritical ? 'critical' : 'warning'} size="sm">
                    {alert.severity}
                  </Badge>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-500">
                    {alert.assetId || 'Station Core'} • {alert.status}
                  </span>
                  <div className="flex items-center gap-2">
                    {alert.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledge(alert._id)}
                        className="text-xs text-sky-700 hover:text-sky-900 py-0.5 px-2"
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => resolve(alert._id)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 py-0.5 px-2"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Lifecycle: Active → Acknowledged → Resolved</span>
        <span className="text-emerald-600 font-medium">Socket.IO Push Link: Online</span>
      </div>
    </Card>
  );
}

export default ActiveAlertsWidget;
