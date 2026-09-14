import React from 'react';
import Card, { CardHeader } from '../common/Card.jsx';
import HealthScore from '../common/HealthScore.jsx';
import ProgressBar from '../common/ProgressBar.jsx';

export function HealthOverview({ breakdown, healthScore = 91 }) {
  const env = breakdown?.environment ?? 94;
  const energy = breakdown?.energy ?? 87;
  const infra = breakdown?.infrastructure ?? 91;
  const logistics = breakdown?.logistics ?? 92;

  const getColor = (val) => {
    if (val >= 85) return 'emerald';
    if (val >= 70) return 'amber';
    return 'rose';
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Station Health Index"
        subtitle="Dynamic composite score derived from operational telemetry streams"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2">
        {/* Left: Circular Health Indicator */}
        <div className="md:col-span-5 flex justify-center md:justify-start">
          <HealthScore score={healthScore} size="lg" showLabel={true} />
        </div>

        {/* Right: Sub-domain Health Breakdown */}
        <div className="md:col-span-7 space-y-3.5 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Environment Health (Weight: 20%)</span>
              <span className={`font-mono ${env < 75 ? 'text-rose-600' : 'text-slate-900'}`}>{env}%</span>
            </div>
            <ProgressBar value={env} color={getColor(env)} showPercentage={false} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Energy Systems Health (Weight: 25%)</span>
              <span className={`font-mono ${energy < 75 ? 'text-rose-600' : 'text-slate-900'}`}>{energy}%</span>
            </div>
            <ProgressBar value={energy} color={getColor(energy)} showPercentage={false} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Infrastructure & Assets (Weight: 35%)</span>
              <span className={`font-mono ${infra < 75 ? 'text-rose-600' : 'text-slate-900'}`}>{infra}%</span>
            </div>
            <ProgressBar value={infra} color={getColor(infra)} showPercentage={false} />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Logistics & Inventory (Weight: 20%)</span>
              <span className={`font-mono ${logistics < 75 ? 'text-rose-600' : 'text-slate-900'}`}>{logistics}%</span>
            </div>
            <ProgressBar value={logistics} color={getColor(logistics)} showPercentage={false} />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Dynamic Calculation Algorithm: ACTIVE</span>
        <span className="font-mono">Formula: 0.20·Env + 0.25·Eng + 0.35·Inf + 0.20·Log</span>
      </div>
    </Card>
  );
}

export default HealthOverview;
