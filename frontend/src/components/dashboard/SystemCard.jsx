import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

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
      className="
        w-full
        text-left
        rounded-2xl
        border border-white/50
        bg-white/25
        backdrop-blur-xl
        p-4
        shadow-sm
        transition-all
        duration-200
        group
        cursor-pointer
        hover:bg-white/35
        hover:border-white/70
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-sky-500/20
      "
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">

        {/* System Name + Status */}
        <div>
          <h3
            className="
              text-base
              font-semibold
              text-slate-900
              group-hover:text-sky-900
              transition-colors
            "
          >
            {name}
          </h3>

          <div className="mt-2">
            <StatusBadge
              status={status}
              size="sm"
            />
          </div>
        </div>

        {/* Metric */}
        <div className="text-right">

          <div
            className="
              text-lg
              font-semibold
              text-slate-900
              tracking-tight
            "
          >
            {primaryMetric.value}
          </div>

          {primaryMetric.label && (
            <div className="text-xs text-slate-600">
              {primaryMetric.label}
            </div>
          )}

        </div>
      </div>

      {/* Bottom Divider + Action */}
      <div
        className="
          mt-3
          pt-2.5
          border-t border-white/40
          flex items-center justify-end
          text-[11px]
          text-slate-600
          group-hover:text-sky-800
          transition-colors
        "
      >
        <span>
          View telemetry & dependencies
        </span>

        <ArrowUpRight
          className="
            w-3.5
            h-3.5
            ml-1
            opacity-60
            group-hover:opacity-100
            group-hover:translate-x-0.5
            group-hover:-translate-y-0.5
            transition-all
          "
        />
      </div>
    </button>
  );
}

export default SystemCard;