import React from 'react';

/**
 * Standardized operational status badge
 * Strict scientific color semantics:
 * Green = Healthy / Operational
 * Amber = Warning
 * Red = Critical
 * Grey = Unknown / Offline / Stale
 * Blue = Informational
 */
export function StatusBadge({ status = 'Healthy', showDot = true, size = 'md', className = '' }) {
  const norm = String(status || '').trim().toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-500';

  if (norm.includes('health') || norm.includes('operat') || norm.includes('normal') || norm.includes('safe') || norm.includes('connect')) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-600';
  } else if (norm.includes('warn') || norm.includes('degrad') || norm.includes('high')) {
    colorClasses = 'bg-amber-50 text-amber-900 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (norm.includes('crit') || norm.includes('fail') || norm.includes('lost') || norm.includes('alarm') || norm.includes('trip')) {
    colorClasses = 'bg-rose-50 text-rose-900 border-rose-300';
    dotColor = 'bg-rose-600';
  } else if (norm.includes('info') || norm.includes('simul')) {
    colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
    dotColor = 'bg-sky-500';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {status}
    </span>
  );
}

export default StatusBadge;
