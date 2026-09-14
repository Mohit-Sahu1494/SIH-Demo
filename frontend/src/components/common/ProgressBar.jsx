import React from 'react';

const colorMap = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-400',
};

export function ProgressBar({
  value = 0,
  max = 100,
  color = 'sky',
  showPercentage = true,
  size = 'md',
  className = '',
  animated = false,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = colorMap[color] || colorMap.sky;

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full ${heights[size] || heights.md} bg-slate-100 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-right text-[11px] font-mono text-slate-500 mt-0.5">
          {pct.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
