import React from 'react';

export function HealthScore({ score = 91, size = 'lg', showLabel = true }) {
  const getScoreColor = (val) => {
    if (val >= 85) return { stroke: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Optimal' };
    if (val >= 70) return { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Advisory' };
    return { stroke: '#EF4444', text: 'text-rose-600', bg: 'bg-rose-50', label: 'Degraded' };
  };

  const theme = getScoreColor(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading font-bold text-2xl text-slate-900 tracking-tight leading-none">
            {score}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Health
          </span>
        </div>
      </div>

      {showLabel && (
        <div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
            {theme.label} Status
          </span>
          <p className="text-xs text-slate-500 mt-1 max-w-[150px]">
            Dynamic operational rating synthesized from 4 telemetry streams.
          </p>
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ value = 0, max = 100, label, color = 'emerald', showPercentage = true }) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>{label}</span>
          {showPercentage && <span className="font-semibold text-slate-800">{percent}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color] || colors.emerald}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default HealthScore;
