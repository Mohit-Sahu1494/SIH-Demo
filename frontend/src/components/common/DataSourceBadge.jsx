import React from 'react';

/**
 * Professional, subtle data provenance badge
 * Explicitly marks whether data is LIVE, SIMULATED, or DERIVED
 */
export function DataSourceBadge({ type = 'SIMULATED', customLabel = null, className = '' }) {
  const normType = type.toUpperCase();

  if (normType.includes('LIVE') || normType.includes('NCPOR')) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        title="Live atmospheric observational telemetry from NCPOR / IMD station array"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {customLabel || 'LIVE · NCPOR'}
      </span>
    );
  }

  if (normType === 'DERIVED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-sky-50 text-sky-800 border border-sky-200/80 ${className}`}
        title="Mathematically derived operational projection based on physical burn & reserve rates"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        {customLabel || 'DERIVED'}
      </span>
    );
  }

  // Default: SIMULATED
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-300/70 ${className}`}
      title="Coupled Digital Twin operational simulation model for research prototype"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      {customLabel || 'SIMULATED'}
    </span>
  );
}

export default DataSourceBadge;
