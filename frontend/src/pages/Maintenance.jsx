import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import maintenanceService from '../services/maintenanceService.js';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function Maintenance() {
  const { currentStationCode } = useStationStore();
  const { assetsTelemetry } = useDashboardStore();
  const [records, setRecords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [recList, recoList] = await Promise.all([
          maintenanceService.getAll(currentStationCode),
          maintenanceService.getRecommendations(currentStationCode),
        ]);
        setRecords(recList || []);
        setRecommendations(recoList || []);
      } catch (err) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentStationCode]);

  const gen02 = assetsTelemetry['GEN-02'] || {};
  const isGen02Critical = gen02.status === 'CRITICAL';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive & Preventive Maintenance"
        subtitle={`Asset lifecycle scheduling, automated telemetry wear triggers, and work orders for ${currentStationCode}`}
        badge={<Badge variant="healthy" size="sm">PREDICTIVE MAINTENANCE SUITE</Badge>}
      />

      {/* AI Telemetry-driven Maintenance Advisory */}
      {isGen02Critical && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-300 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-rose-600 text-white shrink-0">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-rose-950 text-sm">
                Automated Predictive Work Order Recommendation
              </span>
              <Badge variant="critical" size="sm">CRITICAL WEAR TRIGGER</Badge>
            </div>
            <p className="text-xs text-rose-900 mt-1 leading-relaxed">
              Continuous thermal elevation (94°C) and harmonic vibration (4.2 mm/s) on <strong>GEN-02</strong> indicate cooling loop restriction and impending bearing seizure.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-rose-800">
                Action: Dispatch mechanical team to flush glycol exchanger and inspect sleeve mounts.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Work Orders List */}
      <Card>
        <CardHeader
          title="Scheduled Station Work Orders"
          subtitle="Preventive maintenance routines and emergency repair dispatches"
        />

        <div className="divide-y divide-slate-100">
          {records.map((rec) => (
            <div key={rec._id || rec.title} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {rec.assetId}
                    </span>
                    <Badge
                      variant={rec.priority === 'CRITICAL' ? 'critical' : rec.priority === 'HIGH' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {rec.priority} PRIORITY
                    </Badge>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      Assigned: {rec.assignedTo || 'Chief Engineer'}
                    </span>
                  </div>

                  <h4 className="font-heading font-semibold text-sm text-slate-900">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">
                    {new Date(rec.scheduledAt).toLocaleDateString()}
                  </div>
                  <span className="text-[10px] text-slate-400">Scheduled Date</span>
                </div>

                <Badge
                  variant={rec.status === 'COMPLETED' ? 'healthy' : 'info'}
                  size="md"
                >
                  {rec.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Maintenance;
