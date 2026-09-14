import React from 'react';

export function Badge({ children, variant = 'info', size = 'md', className = '' }) {
  const variants = {
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    offline: 'bg-slate-100 text-slate-600 border-slate-200',
    simulated: 'bg-purple-50 text-purple-700 border-purple-200',
    reference: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${variants[variant] || variants.info} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  const s = (status || 'HEALTHY').toUpperCase();
  let variant = 'healthy';
  let dotColor = 'bg-emerald-500';

  if (s === 'WARNING') {
    variant = 'warning';
    dotColor = 'bg-amber-500';
  } else if (s === 'CRITICAL') {
    variant = 'critical';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (s === 'OFFLINE') {
    variant = 'offline';
    dotColor = 'bg-slate-400';
  }

  return (
    <Badge variant={variant} size={size}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {s}
    </Badge>
  );
}

export default Badge;
