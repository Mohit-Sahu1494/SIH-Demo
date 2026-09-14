import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

/**
 * Minimal Overview System Card
 * Strict requirement:
 * Contains VERY LITTLE info:
 * - system/machine name
 * - status
 * - one primary metric
 * Clicking navigates to dedicated system details page
 */
export function SystemCard({
  name = 'CHP-1',
  status = 'Healthy',
  primaryMetric = { label: 'Load', value: '72%' },
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-slate-200/90 p-4 hover:border-slate-300 hover:shadow-xs transition-all duration-150 group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-sky-800 transition-colors">
            {name}
          </h3>
          <div className="mt-1">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold text-slate-900 tracking-tight">
            {primaryMetric.value}
          </div>
          {primaryMetric.label && (
            <div className="text-xs text-slate-500">
              {primaryMetric.label}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end text-[11px] text-slate-400 group-hover:text-sky-700 transition-colors">
        <span>View telemetry & dependencies</span>
        <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:opacity-100" />
      </div>
    </button>
  );
}

export default SystemCard;
