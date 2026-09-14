import React from 'react';
import Card from './Card.jsx';
import Badge from './Badge.jsx';

export function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendDirection = 'up',
  status = 'healthy',
  subtitle,
  badgeText,
  badgeVariant,
}) {
  const statusGradients = {
    healthy: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    critical: 'text-rose-600 bg-rose-50 border-rose-100',
    info: 'text-sky-600 bg-sky-50 border-sky-100',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border ${statusGradients[status] || statusGradients.info}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend || badgeText) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold inline-flex items-center gap-0.5 ${
                trendDirection === 'up' ? 'text-emerald-600' : 'text-slate-600'
              }`}
            >
              {trendDirection === 'up' ? '↑' : '↓'} {trend}
            </span>
          )}
          {badgeText && <Badge variant={badgeVariant || status} size="sm">{badgeText}</Badge>}
        </div>
      )}
    </Card>
  );
}

export default MetricCard;
