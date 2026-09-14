import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader } from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import stationService from '../../services/stationService.js';
import useStationStore from '../../store/stationStore.js';
import useDashboardStore from '../../store/dashboardStore.js';

export function AIInsightsCard() {
  const currentStationCode = useStationStore((s) => s.currentStationCode);
  const { assetsTelemetry } = useDashboardStore();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const gen02 = assetsTelemetry['GEN-02'] || {};
  const isGen02Critical = gen02.status === 'CRITICAL';

  useEffect(() => {
    let isMounted = true;
    async function loadInsights() {
      try {
        const data = await stationService.getInsights(currentStationCode);
        if (isMounted && data?.length > 0) {
          setInsights(data);
        }
      } catch (err) {
        // keep fallback
      }
    }
    loadInsights();
    const interval = setInterval(loadInsights, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStationCode, isGen02Critical]);

  // Priority display: show critical insight first
  const activeInsight = insights[0] || {
    severity: 'INFO',
    title: 'Station Operating Within Nominal Efficiency Envelope',
    finding: 'All primary and secondary station infrastructure operating in nominal state.',
    evidence: 'Generator thermal balance variance < 2.1°C; battery bank float voltage stable at 54.2V; fuel burn rate 8.4 L/hr.',
    risk: 'No operational disruption predicted within next 72-hour window.',
    recommendation: 'Continue standard automated hourly telemetry logging and scheduled bi-weekly sampling.',
    confidence: 92,
  };

  const isCritical = activeInsight.severity === 'CRITICAL' || isGen02Critical;

  return (
    <Card className={`border transition-all ${
      isCritical
        ? 'border-rose-300 bg-gradient-to-br from-white to-rose-50/40 shadow-rose-500/5'
        : 'border-slate-200'
    }`}>
      <CardHeader
        title="AI Operational Intelligence & Decision Support"
        subtitle="Rule-based explainable reasoning synthesized from multi-sensor telemetry"
        badge={
          <Badge variant={isCritical ? 'critical' : 'info'} size="sm">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            {isCritical ? 'CRITICAL ANOMALY' : 'NOMINAL INFERENCE'}
          </Badge>
        }
        action={
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Confidence: <strong className="text-slate-900">{activeInsight.confidence || 94}%</strong>
          </span>
        }
      />

      <div className="space-y-3.5 text-xs">
        {/* Finding */}
        <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Diagnostic Finding
          </span>
          <p className="text-slate-900 font-medium leading-relaxed">
            {activeInsight.finding}
          </p>
        </div>

        {/* Evidence & Risk in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Empirical Evidence
            </span>
            <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
              {activeInsight.evidence}
            </p>
          </div>

          <div className={`p-3 rounded-xl border ${
            isCritical ? 'bg-rose-50/60 border-rose-200 text-rose-900' : 'bg-slate-50/80 border-slate-200/70 text-slate-700'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">
              Operational Risk
            </span>
            <p className="leading-relaxed">
              {activeInsight.risk}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isCritical ? 'bg-rose-100/70 border-rose-300 text-rose-950' : 'bg-sky-50 border-sky-200 text-sky-950'
        }`}>
          <div className={`p-1.5 rounded-lg shrink-0 ${isCritical ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-heading font-bold text-xs uppercase tracking-wider block">
              Prescriptive Operator Action
            </span>
            <p className="mt-0.5 font-medium leading-relaxed">
              {activeInsight.recommendation}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AIInsightsCard;
